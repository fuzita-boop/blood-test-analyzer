import { describe, expect, it } from "vitest";
import { screenAbnormalValues, getAbnormalValues } from "./referenceValues";

describe("screenAbnormalValues", () => {
  it("正常値の場合はnormalを返す", () => {
    const results = screenAbnormalValues([
      { item: "WBC", value: 5.0, unit: "×10³/μL" },
      { item: "HGB", value: 14.0, unit: "g/dL" },
      { item: "CRE", value: 0.8, unit: "mg/dL" },
    ]);
    expect(results.every((r) => r.status === "normal")).toBe(true);
  });

  it("高値の場合はhighを返す", () => {
    const results = screenAbnormalValues([
      { item: "WBC", value: 12.0, unit: "×10³/μL" }, // 基準値上限8.6
    ]);
    expect(results[0]?.status).toBe("high");
  });

  it("低値の場合はlowを返す", () => {
    const results = screenAbnormalValues([
      { item: "HGB", value: 9.0, unit: "g/dL" }, // 基準値下限11.3
    ]);
    expect(results[0]?.status).toBe("low");
  });

  it("緊急高値の場合はcritical_highを返す", () => {
    const results = screenAbnormalValues([
      { item: "K", value: 7.0, unit: "mEq/L" }, // criticalHigh: 6.5
    ]);
    expect(results[0]?.status).toBe("critical_high");
  });

  it("緊急低値の場合はcritical_lowを返す", () => {
    const results = screenAbnormalValues([
      { item: "HGB", value: 5.0, unit: "g/dL" }, // criticalLow: 7.0
    ]);
    expect(results[0]?.status).toBe("critical_low");
  });

  it("基準値不明の項目はスキップする", () => {
    const results = screenAbnormalValues([
      { item: "UNKNOWN_ITEM", value: 999, unit: "mg/dL" },
    ]);
    expect(results).toHaveLength(0);
  });

  it("getAbnormalValuesは異常値のみを返す", () => {
    const all = screenAbnormalValues([
      { item: "WBC", value: 5.0, unit: "×10³/μL" }, // normal
      { item: "HGB", value: 9.0, unit: "g/dL" },    // low
      { item: "CRE", value: 3.0, unit: "mg/dL" },   // high
    ]);
    const abnormal = getAbnormalValues(all);
    expect(abnormal).toHaveLength(2);
    expect(abnormal.every((r) => r.status !== "normal")).toBe(true);
  });

  it("カテゴリが正しく設定される", () => {
    const results = screenAbnormalValues([
      { item: "WBC", value: 5.0, unit: "×10³/μL" },
      { item: "CRE", value: 0.8, unit: "mg/dL" },
      { item: "GLU", value: 100, unit: "mg/dL" },
    ]);
    const wbc = results.find((r) => r.item === "WBC");
    const cre = results.find((r) => r.item === "CRE");
    const glu = results.find((r) => r.item === "GLU");
    expect(wbc?.category).toBe("血算");
    expect(cre?.category).toBe("腎機能");
    expect(glu?.category).toBe("糖代謝");
  });

  it("HbA1cの異常値（高値）を正しく検出する", () => {
    const results = screenAbnormalValues([
      { item: "HbA1c", value: 8.5, unit: "%" }, // 基準値上限6.2
    ]);
    expect(results[0]?.status).toBe("high");
    expect(results[0]?.category).toBe("糖代謝");
  });

  it("CRPの高値を正しく検出する", () => {
    const results = screenAbnormalValues([
      { item: "CRP", value: 5.0, unit: "mg/dL" }, // 基準値上限0.14
    ]);
    expect(results[0]?.status).toBe("high");
  });
});
