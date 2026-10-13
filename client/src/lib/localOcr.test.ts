import { describe, expect, it } from "vitest";
import { parseBloodTestText } from "./localOcr";

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
});
