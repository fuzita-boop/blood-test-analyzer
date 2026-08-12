import { screenAbnormalValues } from "./referenceValues";
import type { AssessmentReport, ExtractedItem, Gender, ScreeningResult } from "./localTypes";

const CATEGORY_INSIGHTS: Record<string, { condition: string; points: string[] }> = {
  血算: {
    condition: "血液学的な変化を確認する必要がある状態の可能性",
    points: ["倦怠感、息切れ、動悸、皮膚・粘膜の色調", "発熱、悪寒、感染兆候、出血傾向の有無"],
  },
  肝機能: {
    condition: "肝胆道系への負担や肝機能変化の可能性",
    points: ["食欲低下、悪心、全身倦怠感", "皮膚・眼球結膜の黄染、尿色・便色の変化"],
  },
  腎機能: {
    condition: "腎機能または体液バランスの変化の可能性",
    points: ["尿量・尿性状、浮腫、体重の変動", "血圧、呼吸状態、食事・水分摂取量"],
  },
  糖代謝: {
    condition: "血糖コントロールの変化の可能性",
    points: ["口渇、多飲、多尿、食欲・体重の変化", "発汗、振戦、意識状態など低血糖を示唆する症状"],
  },
  脂質代謝: {
    condition: "脂質代謝の管理状況を確認する必要がある可能性",
    points: ["服薬状況、食事内容、体重・腹囲の変化", "胸部症状、片麻痺、構音の変化など急性症状の有無"],
  },
  電解質: {
    condition: "電解質または水分バランスの変化の可能性",
    points: ["意識状態、筋力低下、けいれん・不整脈を示唆する症状", "摂取・排泄量、下痢・嘔吐、利尿薬等の服薬状況"],
  },
  炎症: {
    condition: "炎症や感染に関連する状態の可能性",
    points: ["体温、脈拍、呼吸数、血圧の変化", "咳・痰、排尿時症状、創部・皮膚の発赤や熱感"],
  },
};

function statusLabel(status: ScreeningResult["status"]) {
  if (status === "critical_high") return "緊急高値";
  if (status === "critical_low") return "緊急低値";
  if (status === "high") return "高値";
  if (status === "low") return "低値";
  return "基準範囲内";
}

function referenceRange(result: ScreeningResult) {
  if (result.referenceMin === undefined && result.referenceMax === undefined) return "基準値は施設基準を確認";
  return `${result.referenceMin ?? ""}〜${result.referenceMax ?? ""} ${result.unit}`.trim();
}

export function runScreening(items: ExtractedItem[], gender: Gender): ScreeningResult[] {
  const measuredItems = items.filter((item): item is ExtractedItem & { value: number } => {
    return typeof item.value === "number" && Number.isFinite(item.value);
  });
  return screenAbnormalValues(measuredItems, gender) as ScreeningResult[];
}

export function buildAssessmentReport(screeningResults: ScreeningResult[]): AssessmentReport {
  const abnormalSummary = screeningResults.filter((result) => result.status !== "normal");
  const byCategory = new Map<string, ScreeningResult[]>();
  abnormalSummary.forEach((result) => {
    byCategory.set(result.category, [...(byCategory.get(result.category) ?? []), result]);
  });

  const predictedConditions = Array.from(byCategory.entries()).map(([category, results]: [string, ScreeningResult[]]) => ({
    condition: CATEGORY_INSIGHTS[category]?.condition ?? `${category}に関連する状態を確認する必要がある可能性`,
    relatedItems: results.map((result: ScreeningResult) => result.fullName),
  }));

  const observationPoints = Array.from(new Set(
    Array.from(byCategory.keys()).flatMap((category) => CATEGORY_INSIGHTS[category]?.points ?? ["自覚症状、バイタルサイン、摂取・排泄状況の変化"])
  )).slice(0, 5);

  const abnormalLines = abnormalSummary.map((result) =>
    `- ${result.fullName}: ${result.displayValue} ${result.unit}（${statusLabel(result.status)}、一般的な基準値 ${referenceRange(result)}）`
  );
  const recordSummary = abnormalSummary.length === 0
    ? "採血データのうち基準値テーブルに照合できた項目に、一般的な基準値からの逸脱は認めない。未検査・数値未記載の項目は判定対象外。"
    : `採血データにて${abnormalSummary.map((result) => `${result.fullName}${statusLabel(result.status)}`).join("、")}を認める。自覚症状、バイタルサイン、摂取・排泄状況を観察し、主治医・看護師の専門的判断のもと対応する。`;
  const fullReport = [
    "■ 1. スクリーニング結果（異常値のサマリー）",
    abnormalLines.length ? abnormalLines.join("\n") : "- 基準値テーブルに照合できた項目に一般的な基準値からの逸脱なし。未検査・数値未記載の項目は判定対象外。",
    "\n■ 2. 予測される状態・疑われる疾患の可能性（※参考情報）",
    predictedConditions.length ? predictedConditions.map((entry) => `- ${entry.condition}（関連項目: ${entry.relatedItems.join("、")}）`).join("\n") : "- 異常値から特記すべき状態の推測は行わない。",
    "\n■ 3. 現場での観察・アセスメントポイント",
    observationPoints.length ? observationPoints.map((point) => `- ${point}`).join("\n") : "- 自覚症状、バイタルサイン、食事・水分摂取、排泄状況の変化。",
    "\n■ 4. 記録用サマリー",
    recordSummary,
    "\n■ 注意事項",
    "※本データは一般的な基準値による参考情報であり、医学的診断を示すものではありません。異常値については必ず主治医の指示を仰ぎ、看護師の専門的判断のもと対応してください。",
  ].join("\n");

  return { abnormalSummary, predictedConditions, observationPoints, recordSummary, fullReport };
}

export { referenceRange, statusLabel };
