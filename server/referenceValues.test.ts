import { describe, expect, it } from "vitest";
import { screenAbnormalValues, getAbnormalValues } from "./referenceValues";

// ── WBC 単位変換 ──────────────────────────────────────────────────────────

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

  it("小文字μl（×10³/μl）でも変換できる", () => {
    const results = screenAbnormalValues([{ item: "WBC", value: 5.8, unit: "×10³/μl" }]);
    expect(results[0]?.value).toBe(5800);
    expect(results[0]?.status).toBe("normal");
  });
});

// ── RBC 単位変換 ──────────────────────────────────────────────────────────

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

// ── PLT 単位変換 ──────────────────────────────────────────────────────────

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

// ── CRP 単位変換 ──────────────────────────────────────────────────────────

describe("CRP - mg/L → mg/dL 変換", () => {
  it("mg/dL 正常値（0.05）は normal", () => {
    const results = screenAbnormalValues([{ item: "CRP", value: 0.05, unit: "mg/dL" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("mg/L 正常値（1.4 mg/L = 0.14 mg/dL）は normal", () => {
    const results = screenAbnormalValues([{ item: "CRP", value: 1.4, unit: "mg/L" }]);
    expect(results[0]?.value).toBeCloseTo(0.14);
    expect(results[0]?.status).toBe("normal");
  });

  it("mg/L 高値（5.0 mg/L = 0.5 mg/dL）は high", () => {
    const results = screenAbnormalValues([{ item: "CRP", value: 5.0, unit: "mg/L" }]);
    expect(results[0]?.value).toBeCloseTo(0.5);
    expect(results[0]?.status).toBe("high");
  });

  it("mg/dL 高値（2.0）は high", () => {
    const results = screenAbnormalValues([{ item: "CRP", value: 2.0, unit: "mg/dL" }]);
    expect(results[0]?.status).toBe("high");
  });
});

// ── 生化学・肝機能 ────────────────────────────────────────────────────────

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

// ── 腎機能 ───────────────────────────────────────────────────────────────

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

// ── 糖代謝 ───────────────────────────────────────────────────────────────

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

// ── 電解質 ───────────────────────────────────────────────────────────────

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

// ── OCR表記バリエーション ─────────────────────────────────────────────────

describe("OCR表記バリエーション - 項目名正規化", () => {
  it("HBA1C → HbA1c として高値検出", () => {
    const results = screenAbnormalValues([{ item: "HBA1C", value: 8.5, unit: "%" }]);
    expect(results[0]?.status).toBe("high");
    expect(results[0]?.category).toBe("糖代謝");
  });

  it("HBAIC → HbA1c として高値検出（OCRの1→I誤認対応）", () => {
    const results = screenAbnormalValues([{ item: "HBAIC", value: 8.5, unit: "%" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("ALT(GPT) → ALT として高値検出", () => {
    const results = screenAbnormalValues([{ item: "ALT(GPT)", value: 60, unit: "U/L" }]);
    expect(results[0]?.status).toBe("high");
    expect(results[0]?.category).toBe("肝機能");
  });

  it("ALT (GPT) → ALT として高値検出（スペースあり）", () => {
    const results = screenAbnormalValues([{ item: "ALT (GPT)", value: 60, unit: "U/L" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("AST(GOT) → AST として高値検出", () => {
    const results = screenAbnormalValues([{ item: "AST(GOT)", value: 50, unit: "U/L" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("GGT → γ-GTP として高値検出", () => {
    const results = screenAbnormalValues([{ item: "GGT", value: 80, unit: "U/L" }]);
    expect(results[0]?.status).toBe("high");
    expect(results[0]?.category).toBe("肝機能");
  });

  it("γGTP → γ-GTP として高値検出", () => {
    const results = screenAbnormalValues([{ item: "γGTP", value: 80, unit: "U/L" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("LDLコレステロール → LDL として高値検出", () => {
    const results = screenAbnormalValues([{ item: "LDLコレステロール", value: 160, unit: "mg/dL" }]);
    expect(results[0]?.status).toBe("high");
    expect(results[0]?.category).toBe("脂質代謝");
  });

  it("LDL-コレステロール → LDL として高値検出", () => {
    const results = screenAbnormalValues([{ item: "LDL-コレステロール", value: 160, unit: "mg/dL" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("GOT → AST として高値検出", () => {
    const results = screenAbnormalValues([{ item: "GOT", value: 50, unit: "U/L" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("GPT → ALT として高値検出", () => {
    const results = screenAbnormalValues([{ item: "GPT", value: 60, unit: "U/L" }]);
    expect(results[0]?.status).toBe("high");
  });

  it("γ-GTP 正常値（30 U/L）は normal", () => {
    const results = screenAbnormalValues([{ item: "γ-GTP", value: 30, unit: "U/L" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("HbA1c 正常値（5.5%）は normal", () => {
    const results = screenAbnormalValues([{ item: "HbA1c", value: 5.5, unit: "%" }]);
    expect(results[0]?.status).toBe("normal");
  });

  it("LDL 正常値（100 mg/dL）は normal", () => {
    const results = screenAbnormalValues([{ item: "LDL", value: 100, unit: "mg/dL" }]);
    expect(results[0]?.status).toBe("normal");
  });
});

// ── 男女別基準値 ──────────────────────────────────────────────────────────

describe("男女別基準値", () => {
  it("RBC: 男性 450 ×10⁴/μL は normal", () => {
    const results = screenAbnormalValues(
      [{ item: "RBC", value: 450, unit: "×10⁴/μL" }],
      "male"
    );
    expect(results[0]?.status).toBe("normal");
  });

  it("RBC: 女性 430 ×10⁴/μL は normal", () => {
    const results = screenAbnormalValues(
      [{ item: "RBC", value: 430, unit: "×10⁴/μL" }],
      "female"
    );
    expect(results[0]?.status).toBe("normal");
  });

  it("RBC: 510 ×10⁴/μL は男性 normal・女性 high", () => {
    const male = screenAbnormalValues(
      [{ item: "RBC", value: 510, unit: "×10⁴/μL" }],
      "male"
    );
    const female = screenAbnormalValues(
      [{ item: "RBC", value: 510, unit: "×10⁴/μL" }],
      "female"
    );
    expect(male[0]?.status).toBe("normal");
    expect(female[0]?.status).toBe("high");
  });

  it("Hb: 男性 15.0 g/dL は normal", () => {
    const results = screenAbnormalValues(
      [{ item: "HGB", value: 15.0, unit: "g/dL" }],
      "male"
    );
    expect(results[0]?.status).toBe("normal");
  });

  it("Hb: 女性 12.0 g/dL は normal（女性基準 11.6〜14.8）", () => {
    const results = screenAbnormalValues(
      [{ item: "HGB", value: 12.0, unit: "g/dL" }],
      "female"
    );
    expect(results[0]?.status).toBe("normal");
  });

  it("Hb: 男性 12.0 g/dL は low（男性基準 13.7〜16.8）", () => {
    const results = screenAbnormalValues(
      [{ item: "HGB", value: 12.0, unit: "g/dL" }],
      "male"
    );
    expect(results[0]?.status).toBe("low");
  });

  it("UA: 男性 7.0 mg/dL は正常上限ぴったり（normal）", () => {
    const results = screenAbnormalValues(
      [{ item: "UA", value: 7.0, unit: "mg/dL" }],
      "male"
    );
    expect(results[0]?.status).toBe("normal");
  });

  it("UA: 女性 5.5 mg/dL は正常上限ぴったり（normal）", () => {
    const results = screenAbnormalValues(
      [{ item: "UA", value: 5.5, unit: "mg/dL" }],
      "female"
    );
    expect(results[0]?.status).toBe("normal");
  });

  it("UA: 女性 6.0 mg/dL は high（女性上限 5.5）", () => {
    const results = screenAbnormalValues(
      [{ item: "UA", value: 6.0, unit: "mg/dL" }],
      "female"
    );
    expect(results[0]?.status).toBe("high");
  });

  it("γ-GTP: 男性 70 U/L は正常上限ぴったり（normal）", () => {
    const results = screenAbnormalValues(
      [{ item: "γ-GTP", value: 70, unit: "U/L" }],
      "male"
    );
    expect(results[0]?.status).toBe("normal");
  });

  it("γ-GTP: 女性 30 U/L は正常上限ぴったり（normal）", () => {
    const results = screenAbnormalValues(
      [{ item: "γ-GTP", value: 30, unit: "U/L" }],
      "female"
    );
    expect(results[0]?.status).toBe("normal");
  });

  it("γ-GTP: 女性 50 U/L は high（女性上限 30）", () => {
    const results = screenAbnormalValues(
      [{ item: "γ-GTP", value: 50, unit: "U/L" }],
      "female"
    );
    expect(results[0]?.status).toBe("high");
  });

  it("gender=unknown の場合は広い基準値（男性基準）を使用", () => {
    const results = screenAbnormalValues(
      [{ item: "UA", value: 6.0, unit: "mg/dL" }],
      "unknown"
    );
    // unknown時は min/max（男性相当）が適用されるため 6.0 は normal
    expect(results[0]?.status).toBe("normal");
  });

  it("genderSpecific フラグが男女別項目に設定される", () => {
    const results = screenAbnormalValues(
      [{ item: "RBC", value: 450, unit: "×10⁴/μL" }],
      "male"
    );
    expect(results[0]?.genderSpecific).toBe(true);
  });
});

// ── カテゴリ分類 ──────────────────────────────────────────────────────────

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

// ── getAbnormalValues ────────────────────────────────────────────────────

describe("getAbnormalValues", () => {
  it("正常値のみの場合は空配列を返す", () => {
    const results = getAbnormalValues([
      { item: "WBC", value: 5800, unit: "/μL" },
      { item: "HbA1c", value: 5.5, unit: "%" },
    ]);
    expect(results).toHaveLength(0);
  });

  it("異常値が含まれる場合は異常値のみを返す", () => {
    const results = getAbnormalValues([
      { item: "WBC", value: 5800, unit: "/μL" },
      { item: "HbA1c", value: 8.0, unit: "%" },
      { item: "K", value: 7.0, unit: "mEq/L" },
    ]);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.item)).toContain("HbA1c");
    expect(results.map((r) => r.item)).toContain("K");
  });
});

// ── 未検査項目（null値）のスキップ ────────────────────────────────────────

describe("未検査項目（null / undefined / NaN）のスキップ", () => {
  it("value が null の項目はスクリーニング結果に含まれない", () => {
    const results = screenAbnormalValues([
      { item: "WBC", value: null as unknown as number, unit: "/μL" },
      { item: "HbA1c", value: 7.5, unit: "%" },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0]?.item).toBe("HbA1c");
  });

  it("value が undefined の項目はスキップされる", () => {
    const results = screenAbnormalValues([
      { item: "ALT", value: undefined as unknown as number, unit: "U/L" },
      { item: "AST", value: 25, unit: "U/L" },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0]?.item).toBe("AST");
  });

  it("全項目が null の場合は空配列を返す", () => {
    const results = screenAbnormalValues([
      { item: "WBC", value: null as unknown as number, unit: "/μL" },
      { item: "RBC", value: null as unknown as number, unit: "×10⁴/μL" },
      { item: "HbA1c", value: null as unknown as number, unit: "%" },
    ]);
    expect(results).toHaveLength(0);
  });

  it("null と正常値が混在する場合、正常値のみ結果に含まれ status は normal", () => {
    const results = screenAbnormalValues([
      { item: "WBC", value: null as unknown as number, unit: "/μL" },
      { item: "GLU", value: 95, unit: "mg/dL" },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0]?.status).toBe("normal");
  });

  it("null と異常値が混在する場合、異常値のみ結果に含まれ status は high", () => {
    const results = screenAbnormalValues([
      { item: "LDL", value: null as unknown as number, unit: "mg/dL" },
      { item: "GLU", value: 250, unit: "mg/dL" },
    ]);
    expect(results).toHaveLength(1);
    expect(results[0]?.status).toBe("high");
  });
});
