import { describe, expect, it } from "vitest";
import { buildAssessmentReport, runScreening } from "./analysis";
import { extractBloodTestItems, parseBloodTestText, parseBloodTestWords, type OcrWord } from "./localOcr";

function word(text: string, x0: number, y0: number): OcrWord {
  return { text, bbox: { x0, y0, x1: x0 + 40, y1: y0 + 20 } };
}

describe("ローカルOCRテキスト解析", () => {
  it("同じ行にある項目・数値・単位を抽出する", () => {
    const items = parseBloodTestText("HbA1c 7.2 %\nALT(GPT) 80 U/L\nLDL-C 160 mg/dL");

    expect(items).toEqual(expect.arrayContaining([
      { item: "HbA1c", value: 7.2, unit: "%" },
      { item: "ALT", value: 80, unit: "U/L" },
      { item: "LDL", value: 160, unit: "mg/dL" },
    ]));
  });

  it("表形式で別行になった項目・数値・単位を抽出する", () => {
    const items = parseBloodTestText("WBC\n5.8\n×10³/μL\nPLT\n220\n×10³/μL\nCRP\n0.08\nmg/dL");

    expect(items).toEqual(expect.arrayContaining([
      { item: "WBC", value: 5.8, unit: "×10³/μL" },
      { item: "PLT", value: 220, unit: "×10³/μL" },
      { item: "CRP", value: 0.08, unit: "mg/dL" },
    ]));
  });

  it("数値のない項目を0ではなく未検査として扱う", () => {
    const items = parseBloodTestText("AST\n基準値 13〜30 U/L\nALT 25 U/L");
    const ast = items.find((item) => item.item === "AST");
    const alt = items.find((item) => item.item === "ALT");

    expect(ast?.value).toBeNull();
    expect(alt).toEqual({ item: "ALT", value: 25, unit: "U/L" });
  });

  it("単語座標から表の横並びを保って実測値を対応付ける", () => {
    const items = parseBloodTestWords([
      word("項目", 20, 10), word("結果", 220, 10), word("単位", 320, 10),
      word("ALT", 20, 50), word("80", 220, 50), word("U/L", 320, 50),
      word("HbA1c", 20, 90), word("7.2", 220, 90), word("%", 320, 90),
      word("LDL-C", 20, 130), word("160", 220, 130), word("mg/dL", 320, 130),
    ]);

    expect(items).toEqual([
      { item: "ALT", value: 80, unit: "U/L" },
      { item: "HbA1c", value: 7.2, unit: "%" },
      { item: "LDL", value: 160, unit: "mg/dL" },
    ]);
  });

  it("改行順が崩れたOCR本文より座標付きの実測値を優先する", () => {
    const items = extractBloodTestItems("ALT\n基準値 7-42 U/L\n結果", [
      word("ALT", 20, 50), word("80", 220, 50), word("U/L", 320, 50),
    ]);

    expect(items).toContainEqual({ item: "ALT", value: 80, unit: "U/L" });
  });

  it("表形式OCRの抽出結果だけで、手入力せずアセスメントレポートを生成できる", () => {
    const items = parseBloodTestWords([
      word("ALT", 20, 50), word("80", 220, 50), word("U/L", 320, 50),
      word("HbA1c", 20, 90), word("7.2", 220, 90), word("%", 320, 90),
    ]);
    const screening = runScreening(items, "unknown");
    const report = buildAssessmentReport(screening);

    expect(screening).toEqual(expect.arrayContaining([
      expect.objectContaining({ item: "ALT", value: 80, status: "high" }),
      expect.objectContaining({ item: "HbA1c", value: 7.2, status: "high" }),
    ]));
    expect(report.abnormalSummary).toHaveLength(2);
  });
});
