import { describe, expect, it } from "vitest";
import { screenAbnormalValues, getAbnormalValues } from "./referenceValues";

// ── WBC（白血球数）の単位変換テスト ───────────────────────────────────────────
describe("WBC 白血球数 - 単位変換と正常判定", () => {
  it("/μL 単位で正常範囲内（5800 /μL）は normal", () => {
    const results = screenAbnormalValues([{ item: "WBC", value: 5800, unit: "/μL" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("×10³/μL 単位で正常範囲内（5.8 ×10³/μL → 5800 /μL）は normal", () => {
    const results = screenAbnormalValues([{ item: "WBC", value: 5.8, unit: "×10³/μL" }]);
    expect(results[0]?.status).toBe("normal");
    expect(results[0]?.value).toBe(5800);
  });

  it("単位なしで小さい値（5.8）は ×10³/μL と自動判定して normal", () => {
    const results = screenAbnormalValues([{ item: "WBC", value: 5.8, unit: "" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("/μL 単位で高値（12000 /μL）は high", () => {
    const results = screenAbnormalValues([{ item: "WBC", value: 12000, unit: "/μL" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("×10³/μL 単位で高値（12.0 ×10³/μL → 12000 /μL）は high", () => {
    const results = screenAbnormalValues([{ item: "WBC", value: 12.0, unit: "×10³/μL" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("/μL 単位で低値（2500 /μL）は low", () => {
    const results = screenAbnormalValues([{ item: "WBC", value: 2500, unit: "/μL" }]);
    expect(results[0]?.status).toBe("low");
  });

  it("緊急高値（35000 /μL）は critical_high", () => {
    const results = screenAbnormalValues([{ item: "WBC", value: 35000, unit: "/μL" }]);
    expect(results[0]?.status).toBe("critical_high");
  });

  it("日本語名「白血球」でも正常判定できる", () => {
    const results = screenAbnormalValues([{ item: "白血球", value: 5800, unit: "/μL" }]);
    expect(results[0]?.status).toBe("normal");
  });
});

// ── RBC（赤血球数）の単位変換テスト ───────────────────────────────────────────
describe("RBC 赤血球数 - 単位変換と正常判定", () => {
  it("×10⁴/μL 単位で正常範囲内（450 ×10⁴/μL）は normal", () => {
    const results = screenAbnormalValues([{ item: "RBC", value: 450, unit: "×10⁴/μL" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("×10⁶/μL 単位で正常範囲内（4.5 ×10⁶/μL → 450 ×10⁴/μL）は normal", () => {
    const results = screenAbnormalValues([{ item: "RBC", value: 4.5, unit: "×10⁶/μL" }]);
    expect(results[0]?.status).toBe("normal");
    expect(results[0]?.value).toBe(450);
  });

  it("単位なしで小さい値（4.5）は ×10⁶/μL と自動判定して normal", () => {
    const results = screenAbnormalValues([{ item: "RBC", value: 4.5, unit: "" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("×10⁴/μL 単位で低値（350 ×10⁴/μL）は low", () => {
    const results = screenAbnormalValues([{ item: "RBC", value: 350, unit: "×10⁴/μL" }]);
    expect(results[0]?.status).toBe("low");
  });

  it("日本語名「赤血球」でも正常判定できる", () => {
    const results = screenAbnormalValues([{ item: "赤血球", value: 450, unit: "×10⁴/μL" }]);
    expect(results[0]?.status).toBe("normal");
  });
});

// ── PLT（血小板数）のテスト ───────────────────────────────────────────────────
describe("PLT 血小板数 - 正常判定", () => {
  it("×10³/μL 単位で正常範囲内（220 ×10³/μL）は normal", () => {
    const results = screenAbnormalValues([{ item: "PLT", value: 220, unit: "×10³/μL" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("×10⁴/μL 単位で正常範囲内（22.0 ×10⁴/μL → 220 ×10³/μL）は normal", () => {
    const results = screenAbnormalValues([{ item: "PLT", value: 22.0, unit: "×10⁴/μL" }]);
    expect(results[0]?.status).toBe("normal");
    expect(results[0]?.value).toBe(220);
  });
});

// ── 生化学・肝機能 ────────────────────────────────────────────────────────────
describe("生化学 - 肝機能", () => {
  it("AST 正常値（20 U/L）は normal", () => {
    const results = screenAbnormalValues([{ item: "AST", value: 20, unit: "U/L" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("ALT 高値（60 U/L）は high", () => {
    const results = screenAbnormalValues([{ item: "ALT", value: 60, unit: "U/L" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("ALB 低値（3.5 g/dL）は low", () => {
    const results = screenAbnormalValues([{ item: "ALB", value: 3.5, unit: "g/dL" }]);
    expect(results[0]?.status).toBe("low");
  });

  it("HGB 低値（9.0 g/dL）は low", () => {
    const results = screenAbnormalValues([{ item: "HGB", value: 9.0, unit: "g/dL" }]);
    expect(results[0]?.status).toBe("low");
  });

  it("HGB 緊急低値（5.0 g/dL）は critical_low", () => {
    const results = screenAbnormalValues([{ item: "HGB", value: 5.0, unit: "g/dL" }]);
    expect(results[0]?.status).toBe("critical_low");
  });
});

// ── 腎機能 ────────────────────────────────────────────────────────────────────
describe("腎機能", () => {
  it("CRE 正常値（0.8 mg/dL）は normal", () => {
    const results = screenAbnormalValues([{ item: "CRE", value: 0.8, unit: "mg/dL" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("BUN 高値（25 mg/dL）は high", () => {
    const results = screenAbnormalValues([{ item: "BUN", value: 25, unit: "mg/dL" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("eGFR 低値（45 mL/min/1.73m²）は low", () => {
    const results = screenAbnormalValues([{ item: "eGFR", value: 45, unit: "mL/min/1.73m²" }]);
    expect(results[0]?.status).toBe("low");
  });
});

// ── 糖代謝 ────────────────────────────────────────────────────────────────────
describe("糖代謝", () => {
  it("血糖 正常値（90 mg/dL）は normal", () => {
    const results = screenAbnormalValues([{ item: "GLU", value: 90, unit: "mg/dL" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("HbA1c 高値（7.5%）は high", () => {
    const results = screenAbnormalValues([{ item: "HbA1c", value: 7.5, unit: "%" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("血糖 緊急低値（40 mg/dL）は critical_low", () => {
    const results = screenAbnormalValues([{ item: "GLU", value: 40, unit: "mg/dL" }]);
    expect(results[0]?.status).toBe("critical_low");
  });
});

// ── 電解質 ────────────────────────────────────────────────────────────────────
describe("電解質", () => {
  it("K 正常値（4.0 mEq/L）は normal", () => {
    const results = screenAbnormalValues([{ item: "K", value: 4.0, unit: "mEq/L" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("K 緊急高値（7.0 mEq/L）は critical_high", () => {
    const results = screenAbnormalValues([{ item: "K", value: 7.0, unit: "mEq/L" }]);
    expect(results[0]?.status).toBe("critical_high");
  });
});

// ── 炎症 ─────────────────────────────────────────────────────────────────────
describe("炎症マーカー", () => {
  it("CRP 正常値（0.05 mg/dL）は normal", () => {
    const results = screenAbnormalValues([{ item: "CRP", value: 0.05, unit: "mg/dL" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("CRP 高値（2.0 mg/dL）は high", () => {
    const results = screenAbnormalValues([{ item: "CRP", value: 2.0, unit: "mg/dL" }]);
    expect(results[0]?.status).toBe("high");
  });
});

// ── カテゴリ分類 ─────────────────────────────────────────────────────────────
describe("カテゴリ分類", () => {
  it("各項目のカテゴリが正しく設定される", () => {
    const results = screenAbnormalValues([
      { item: "WBC", value: 5800, unit: "/μL" },
      { item: "CRE", value: 0.8, unit: "mg/dL" },
      { item: "GLU", value: 100, unit: "mg/dL" },
    ]);
    expect(results.find((r) => r.item === "WBC")?.category).toBe("血算");
    expect(results.find((r) => r.item === "CRE")?.category).toBe("腎機能");
    expect(results.find((r) => r.item === "GLU")?.category).toBe("糖代謝");
  });

  it("基準値不明の項目はスキップする", () => {
    const results = screenAbnormalValues([{ item: "UNKNOWN_ITEM", value: 999, unit: "mg/dL" }]);
    expect(results).toHaveLength(0);
  });
});

// ── getAbnormalValues フィルタリング ─────────────────────────────────────────
describe("getAbnormalValues", () => {
  it("正常値のみの場合は空配列を返す", () => {
    const results = screenAbnormalValues([
      { item: "WBC", value: 5800, unit: "/μL" },
      { item: "HbA1c", value: 5.5, unit: "%" },
    ]);
    expect(getAbnormalValues(results)).toHaveLength(0);
  });

  it("異常値が含まれる場合は異常値のみを返す", () => {
    const results = screenAbnormalValues([
      { item: "WBC", value: 5800, unit: "/μL" },  // normal
      { item: "HbA1c", value: 8.0, unit: "%" },    // high
      { item: "K", value: 7.0, unit: "mEq/L" },    // critical_high
    ]);
    const abnormal = getAbnormalValues(results);
    expect(abnormal).toHaveLength(2);
    expect(abnormal.map((r) => r.item)).toContain("HbA1c");
    expect(abnormal.map((r) => r.item)).toContain("K");
  });
});
