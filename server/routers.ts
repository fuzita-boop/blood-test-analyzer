import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { storagePut, storageDelete } from "./storage";
import {
  createBloodTestRecord,
  getBloodTestRecordsByUserId,
  getBloodTestRecordById,
  updateBloodTestRecord,
  createAssessmentReport,
  getAssessmentReportByRecordId,
  getAssessmentReportsByUserId,
  getAssessmentReportById,
} from "./db";
import { screenAbnormalValues, getAbnormalValues } from "./referenceValues";
import { nanoid } from "nanoid";

// ── 採血記録ルーター ───────────────────────────────────────────────────────

const bloodTestRouter = router({
  list: protectedProcedure
    .input(z.object({ patientId: z.number().optional() }))
    .query(({ ctx }) => getBloodTestRecordsByUserId(ctx.user.id)),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => getBloodTestRecordById(input.id, ctx.user.id)),

  // S3へ画像アップロード → OCR → 異常値スクリーニング → レポート生成 → 画像削除
  uploadAndAnalyze: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        mimeType: z.string().default("image/jpeg"),
        testDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. S3に画像を一時アップロード
      const imageBuffer = Buffer.from(input.imageBase64, "base64");
      const fileKey = `blood-tests-tmp/${ctx.user.id}/${nanoid()}.jpg`;
      const { url: imageUrl } = await storagePut(fileKey, imageBuffer, input.mimeType);

      // 2. DBに採血記録を作成（processing状態）
      const record = await createBloodTestRecord({
        userId: ctx.user.id,
        testDate: input.testDate ? new Date(input.testDate) : undefined,
        status: "processing",
      });

      const recordId = record.id;

      try {
        // 3. LLMで画像からOCR抽出
        const ocrResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `あなたは医療検査データの解析専門家です。採血検査結果の画像から検査項目名と数値を正確に抽出してください。
個人情報（氏名・生年月日・ID番号・病院名など）は一切抽出しないでください。
検査項目と数値のみを構造化JSONとして返してください。`,
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: imageUrl, detail: "high" },
                },
                {
                  type: "text",
                  text: `この採血検査結果の画像から、すべての検査項目名・数値・単位を正確に抽出してください。
以下のJSON形式で返してください：
{
  "items": [
    { "item": "検査項目名（略称）", "value": 数値, "unit": "単位" },
    ...
  ],
  "testDate": "採血日（YYYY-MM-DD形式、不明な場合はnull）"
}

【重要な注意事項】
- 個人情報（氏名・ID・生年月日・病院名）は絶対に含めないこと
- 数値は画像に記載されている数値をそのまま抽出すること（変換しない）
- 単位は画像に記載されている単位をそのまま抽出すること（例: /μL, ×10³/μL, ×10⁴/μL, ×10⁶/μL, g/dL, mg/dL, U/L など）
- WBC（白血球数）の単位は特に注意：/μL（例:5800）、×10²/μL（例:58）、×10³/μL（例:5.8）など検査票により異なる
- RBC（赤血球数）の単位は特に注意：×10⁴/μL（例:450）、×10⁶/μL（例:4.5）など検査票により異なる
- 単位が画像に明記されていない場合は空文字列
- 参考値・基準値欄の数値ではなく、患者の実測値のみを抽出すること`,
                },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "blood_test_extraction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item: { type: "string" },
                        value: { type: "number" },
                        unit: { type: "string" },
                      },
                      required: ["item", "value", "unit"],
                      additionalProperties: false,
                    },
                  },
                  testDate: { type: ["string", "null"] },
                },
                required: ["items", "testDate"],
                additionalProperties: false,
              },
            },
          },
        });

        const ocrRaw = ocrResponse.choices[0]?.message?.content;
        const ocrContent = typeof ocrRaw === "string" ? ocrRaw : null;
        if (!ocrContent) throw new Error("OCR extraction failed");

        const extractedData = JSON.parse(ocrContent) as {
          items: Array<{ item: string; value: number; unit: string }>;
          testDate: string | null;
        };

        // 4. 異常値スクリーニング
        const screeningResults = screenAbnormalValues(extractedData.items);
        const abnormalValues = getAbnormalValues(screeningResults);

        // 5. LLMでアセスメントレポート生成
        const reportResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `あなたは訪問看護・介護施設スタッフ向けの医療データ解析アシスタントです。
採血データの異常値に基づいてアセスメント補助レポートを生成します。
以下の制約を厳守してください：
1. 診断は行わず「〜の可能性」「〜の疑い」という表現を使用
2. 個人情報は一切含めない
3. 日本人間ドック学会・各専門学会のガイドラインに基づく客観的情報のみ
4. 訪問看護記録・申し送りで使用できる簡潔な表現`,
            },
            {
              role: "user",
              content: `以下の採血データの異常値に基づいてアセスメントレポートを生成してください。

【全検査結果】
${JSON.stringify(screeningResults, null, 2)}

【異常値】
${JSON.stringify(abnormalValues, null, 2)}

以下のJSON形式で返してください：
{
  "abnormalSummary": [
    { "item": "項目名", "value": 数値, "unit": "単位", "status": "high/low/critical_high/critical_low", "referenceRange": "基準値範囲", "category": "カテゴリ" }
  ],
  "predictedConditions": [
    { "condition": "疑われる状態・疾患", "relatedItems": ["関連検査項目"] }
  ],
  "observationPoints": [
    "観察ポイント1",
    "観察ポイント2",
    "観察ポイント3"
  ],
  "recordSummary": "看護記録用サマリー（簡潔な文章）",
  "fullReport": "マークダウン形式の完全レポート"
}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "assessment_report",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  abnormalSummary: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item: { type: "string" },
                        value: { type: "number" },
                        unit: { type: "string" },
                        status: { type: "string" },
                        referenceRange: { type: "string" },
                        category: { type: "string" },
                      },
                      required: ["item", "value", "unit", "status", "referenceRange", "category"],
                      additionalProperties: false,
                    },
                  },
                  predictedConditions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        condition: { type: "string" },
                        relatedItems: { type: "array", items: { type: "string" } },
                      },
                      required: ["condition", "relatedItems"],
                      additionalProperties: false,
                    },
                  },
                  observationPoints: { type: "array", items: { type: "string" } },
                  recordSummary: { type: "string" },
                  fullReport: { type: "string" },
                },
                required: ["abnormalSummary", "predictedConditions", "observationPoints", "recordSummary", "fullReport"],
                additionalProperties: false,
              },
            },
          },
        });

        const reportRaw = reportResponse.choices[0]?.message?.content;
        const reportContent = typeof reportRaw === "string" ? reportRaw : null;
        if (!reportContent) throw new Error("Report generation failed");

        const reportData = JSON.parse(reportContent);

        // 6. DBを更新（completed）
        await updateBloodTestRecord(recordId, {
          extractedData: extractedData as unknown as Record<string, unknown>,
          status: "completed",
          testDate: extractedData.testDate ? new Date(extractedData.testDate) : undefined,
        });

        // 7. アセスメントレポートをDBに保存
        const reportRecord = await createAssessmentReport({
          bloodTestRecordId: recordId,
          userId: ctx.user.id,
          abnormalValues: reportData.abnormalSummary,
          predictedConditions: reportData.predictedConditions,
          observationPoints: reportData.observationPoints,
          recordSummary: reportData.recordSummary,
          fullReportText: reportData.fullReport,
        });

        // 8. S3から画像を削除（読み取り完了後、プライバシー保護のため）
        await storageDelete(fileKey);
        console.log(`[Privacy] Image deleted from S3 after OCR: ${fileKey}`);

        return {
          recordId,
          reportId: reportRecord.id,
          extractedData,
          screeningResults,
          abnormalValues,
          report: reportData,
        };
      } catch (error) {
        // エラー時もS3画像を削除
        await storageDelete(fileKey);
        // DBを更新
        await updateBloodTestRecord(recordId, {
          status: "error",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),
});

// ── レポートルーター ───────────────────────────────────────────────────────

const reportRouter = router({
  list: protectedProcedure
    .input(z.object({ patientId: z.number().optional() }))
    .query(({ ctx }) => getAssessmentReportsByUserId(ctx.user.id)),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => getAssessmentReportById(input.id, ctx.user.id)),

  getByRecordId: protectedProcedure
    .input(z.object({ recordId: z.number() }))
    .query(({ ctx, input }) => getAssessmentReportByRecordId(input.recordId)),
});

// ── アプリルーター ─────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  bloodTest: bloodTestRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
