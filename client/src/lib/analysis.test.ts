import { describe, expect, it } from "vitest";
import { buildAssessmentReport, runScreening } from "./analysis";

describe("ローカル解析", () => {
  it("未検査項目のnull値を判定対象から除外する", () => {
    const result = runScreening([
      { item: "WBC", value: null, unit: "/μL" },
      { item: "HbA1c", value: 7.2, unit: "%" },
    ], "unknown");
    expect(result).toHaveLength(1);
    expect(result[0]?.item).toBe("HbA1c");
    expect(result[0]?.status).toBe("high");
  });

  it("WBCの×10³/μL表記をローカルで正規化する", () => {
    const result = runScreening([{ item: "WBC", value: 5.8, unit: "×10³/μL" }], "unknown");
    expect(result[0]?.value).toBe(5800);
    expect(result[0]?.status).toBe("normal");
  });

  it("異常値から非診断的なアセスメントレポートを生成する", () => {
    const screening = runScreening([{ item: "ALT", value: 80, unit: "U/L" }], "unknown");
    const report = buildAssessmentReport(screening);
    expect(report.abnormalSummary).toHaveLength(1);
    expect(report.fullReport).toContain("可能性");
    expect(report.recordSummary).toContain("ALT（GPT）");
  });
});
