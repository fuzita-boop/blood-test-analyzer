/**
 * 一般的な基準値テーブル（日本人間ドック学会・各専門学会ガイドライン準拠）
 *
 * 【単位統一方針】
 * 日本の採血検査票で最も一般的に記載される単位・スケールに統一する。
 *   WBC: /μL 単位（例: 5800 /μL）  ← 検査票では 5800 や 58(×10²) で記載されることが多い
 *   RBC: ×10⁴/μL 単位（例: 450 ×10⁴/μL）
 *   PLT: ×10³/μL 単位（例: 220 ×10³/μL）
 *
 * OCR抽出時に単位を正しく読み取り、normalizeValue()で内部スケールに変換する。
 */

export interface ReferenceRange {
  min?: number;
  max?: number;
  unit: string;           // 表示用単位
  internalUnit: string;   // スクリーニング比較用の内部単位（統一済み）
  fullName: string;
  category: string;
  criticalLow?: number;
  criticalHigh?: number;
}

export interface ScreeningResult {
  item: string;
  fullName: string;
  value: number;          // 正規化後の値
  displayValue: number;   // 元の表示値
  unit: string;
  status: "high" | "low" | "critical_high" | "critical_low" | "normal";
  referenceMin?: number;
  referenceMax?: number;
  category: string;
}

// ── 基準値テーブル ────────────────────────────────────────────────────────────
// 内部スケール統一：WBC=/μL, RBC=×10⁴/μL, PLT=×10³/μL
export const REFERENCE_VALUES: Record<string, ReferenceRange> = {

  // ── 血算（CBC） ──────────────────────────────────────────────────────────
  // WBC: 内部単位 /μL。正常範囲 3300〜8600 /μL（日本人間ドック学会）
  WBC: {
    min: 3300, max: 8600,
    unit: "/μL", internalUnit: "/μL",
    fullName: "白血球数", category: "血算",
    criticalLow: 2000, criticalHigh: 30000,
  },
  "白血球数": {
    min: 3300, max: 8600,
    unit: "/μL", internalUnit: "/μL",
    fullName: "白血球数", category: "血算",
    criticalLow: 2000, criticalHigh: 30000,
  },
  "白血球": {
    min: 3300, max: 8600,
    unit: "/μL", internalUnit: "/μL",
    fullName: "白血球数", category: "血算",
    criticalLow: 2000, criticalHigh: 30000,
  },

  // RBC: 内部単位 ×10⁴/μL。正常範囲 386〜577 ×10⁴/μL（男女共通幅）
  RBC: {
    min: 386, max: 577,
    unit: "×10⁴/μL", internalUnit: "×10⁴/μL",
    fullName: "赤血球数", category: "血算",
  },
  "赤血球数": {
    min: 386, max: 577,
    unit: "×10⁴/μL", internalUnit: "×10⁴/μL",
    fullName: "赤血球数", category: "血算",
  },
  "赤血球": {
    min: 386, max: 577,
    unit: "×10⁴/μL", internalUnit: "×10⁴/μL",
    fullName: "赤血球数", category: "血算",
  },

  // HGB: g/dL
  HGB: {
    min: 11.3, max: 17.2,
    unit: "g/dL", internalUnit: "g/dL",
    fullName: "ヘモグロビン", category: "血算",
    criticalLow: 7.0, criticalHigh: 20.0,
  },
  Hb: {
    min: 11.3, max: 17.2,
    unit: "g/dL", internalUnit: "g/dL",
    fullName: "ヘモグロビン", category: "血算",
    criticalLow: 7.0, criticalHigh: 20.0,
  },
  "ヘモグロビン": {
    min: 11.3, max: 17.2,
    unit: "g/dL", internalUnit: "g/dL",
    fullName: "ヘモグロビン", category: "血算",
    criticalLow: 7.0, criticalHigh: 20.0,
  },

  // HCT: %
  HCT: { min: 33.4, max: 51.8, unit: "%", internalUnit: "%", fullName: "ヘマトクリット", category: "血算" },
  Ht: { min: 33.4, max: 51.8, unit: "%", internalUnit: "%", fullName: "ヘマトクリット", category: "血算" },
  "ヘマトクリット": { min: 33.4, max: 51.8, unit: "%", internalUnit: "%", fullName: "ヘマトクリット", category: "血算" },

  MCV: { min: 79.0, max: 100.0, unit: "fL", internalUnit: "fL", fullName: "平均赤血球容積", category: "血算" },
  MCH: { min: 26.3, max: 34.3, unit: "pg", internalUnit: "pg", fullName: "平均赤血球ヘモグロビン量", category: "血算" },
  MCHC: { min: 31.7, max: 35.3, unit: "g/dL", internalUnit: "g/dL", fullName: "平均赤血球ヘモグロビン濃度", category: "血算" },

  // PLT: 内部単位 ×10³/μL。正常範囲 158〜348 ×10³/μL
  PLT: {
    min: 158, max: 348,
    unit: "×10³/μL", internalUnit: "×10³/μL",
    fullName: "血小板数", category: "血算",
    criticalLow: 50, criticalHigh: 1000,
  },
  "血小板数": {
    min: 158, max: 348,
    unit: "×10³/μL", internalUnit: "×10³/μL",
    fullName: "血小板数", category: "血算",
    criticalLow: 50, criticalHigh: 1000,
  },
  "血小板": {
    min: 158, max: 348,
    unit: "×10³/μL", internalUnit: "×10³/μL",
    fullName: "血小板数", category: "血算",
    criticalLow: 50, criticalHigh: 1000,
  },

  // ── 生化学（肝機能） ─────────────────────────────────────────────────────
  AST: { min: 13, max: 30, unit: "U/L", internalUnit: "U/L", fullName: "AST（GOT）", category: "肝機能", criticalHigh: 1000 },
  GOT: { min: 13, max: 30, unit: "U/L", internalUnit: "U/L", fullName: "AST（GOT）", category: "肝機能", criticalHigh: 1000 },
  ALT: { min: 7, max: 42, unit: "U/L", internalUnit: "U/L", fullName: "ALT（GPT）", category: "肝機能", criticalHigh: 1000 },
  GPT: { min: 7, max: 42, unit: "U/L", internalUnit: "U/L", fullName: "ALT（GPT）", category: "肝機能", criticalHigh: 1000 },
  "γ-GT": { min: 0, max: 50, unit: "U/L", internalUnit: "U/L", fullName: "γ-GTP", category: "肝機能" },
  "γGTP": { min: 0, max: 50, unit: "U/L", internalUnit: "U/L", fullName: "γ-GTP", category: "肝機能" },
  "γ-GTP": { min: 0, max: 50, unit: "U/L", internalUnit: "U/L", fullName: "γ-GTP", category: "肝機能" },
  ALP: { min: 38, max: 113, unit: "U/L", internalUnit: "U/L", fullName: "アルカリホスファターゼ", category: "肝機能" },
  LDH: { min: 124, max: 222, unit: "U/L", internalUnit: "U/L", fullName: "乳酸脱水素酵素", category: "肝機能" },
  T_BIL: { min: 0.2, max: 1.2, unit: "mg/dL", internalUnit: "mg/dL", fullName: "総ビリルビン", category: "肝機能", criticalHigh: 15.0 },
  "総ビリルビン": { min: 0.2, max: 1.2, unit: "mg/dL", internalUnit: "mg/dL", fullName: "総ビリルビン", category: "肝機能" },
  D_BIL: { min: 0, max: 0.4, unit: "mg/dL", internalUnit: "mg/dL", fullName: "直接ビリルビン", category: "肝機能" },
  TP: { min: 6.6, max: 8.1, unit: "g/dL", internalUnit: "g/dL", fullName: "総蛋白", category: "肝機能" },
  "総蛋白": { min: 6.6, max: 8.1, unit: "g/dL", internalUnit: "g/dL", fullName: "総蛋白", category: "肝機能" },
  ALB: { min: 4.1, max: 5.1, unit: "g/dL", internalUnit: "g/dL", fullName: "アルブミン", category: "肝機能", criticalLow: 2.0 },
  "アルブミン": { min: 4.1, max: 5.1, unit: "g/dL", internalUnit: "g/dL", fullName: "アルブミン", category: "肝機能", criticalLow: 2.0 },

  // ── 腎機能 ───────────────────────────────────────────────────────────────
  BUN: { min: 8, max: 20, unit: "mg/dL", internalUnit: "mg/dL", fullName: "尿素窒素", category: "腎機能", criticalHigh: 100 },
  "尿素窒素": { min: 8, max: 20, unit: "mg/dL", internalUnit: "mg/dL", fullName: "尿素窒素", category: "腎機能" },
  CRE: { min: 0.46, max: 1.04, unit: "mg/dL", internalUnit: "mg/dL", fullName: "クレアチニン", category: "腎機能", criticalHigh: 10.0 },
  Cr: { min: 0.46, max: 1.04, unit: "mg/dL", internalUnit: "mg/dL", fullName: "クレアチニン", category: "腎機能", criticalHigh: 10.0 },
  "クレアチニン": { min: 0.46, max: 1.04, unit: "mg/dL", internalUnit: "mg/dL", fullName: "クレアチニン", category: "腎機能", criticalHigh: 10.0 },
  eGFR: { min: 60, max: 9999, unit: "mL/min/1.73m²", internalUnit: "mL/min/1.73m²", fullName: "推算糸球体濾過量", category: "腎機能" },
  UA: { min: 2.1, max: 7.0, unit: "mg/dL", internalUnit: "mg/dL", fullName: "尿酸", category: "腎機能" },
  "尿酸": { min: 2.1, max: 7.0, unit: "mg/dL", internalUnit: "mg/dL", fullName: "尿酸", category: "腎機能" },

  // ── 糖代謝 ───────────────────────────────────────────────────────────────
  GLU: { min: 70, max: 109, unit: "mg/dL", internalUnit: "mg/dL", fullName: "血糖（空腹時）", category: "糖代謝", criticalLow: 50, criticalHigh: 500 },
  BS: { min: 70, max: 109, unit: "mg/dL", internalUnit: "mg/dL", fullName: "血糖", category: "糖代謝", criticalLow: 50, criticalHigh: 500 },
  FBS: { min: 70, max: 109, unit: "mg/dL", internalUnit: "mg/dL", fullName: "空腹時血糖", category: "糖代謝", criticalLow: 50, criticalHigh: 500 },
  "血糖": { min: 70, max: 109, unit: "mg/dL", internalUnit: "mg/dL", fullName: "血糖", category: "糖代謝", criticalLow: 50, criticalHigh: 500 },
  HbA1c: { min: 4.6, max: 6.2, unit: "%", internalUnit: "%", fullName: "HbA1c（NGSP）", category: "糖代謝" },

  // ── 脂質代謝 ─────────────────────────────────────────────────────────────
  TC: { min: 142, max: 248, unit: "mg/dL", internalUnit: "mg/dL", fullName: "総コレステロール", category: "脂質代謝" },
  "総コレステロール": { min: 142, max: 248, unit: "mg/dL", internalUnit: "mg/dL", fullName: "総コレステロール", category: "脂質代謝" },
  LDL: { min: 65, max: 139, unit: "mg/dL", internalUnit: "mg/dL", fullName: "LDLコレステロール", category: "脂質代謝" },
  "LDL-C": { min: 65, max: 139, unit: "mg/dL", internalUnit: "mg/dL", fullName: "LDLコレステロール", category: "脂質代謝" },
  HDL: { min: 40, max: 9999, unit: "mg/dL", internalUnit: "mg/dL", fullName: "HDLコレステロール", category: "脂質代謝" },
  "HDL-C": { min: 40, max: 9999, unit: "mg/dL", internalUnit: "mg/dL", fullName: "HDLコレステロール", category: "脂質代謝" },
  TG: { min: 30, max: 149, unit: "mg/dL", internalUnit: "mg/dL", fullName: "中性脂肪（トリグリセリド）", category: "脂質代謝" },
  "中性脂肪": { min: 30, max: 149, unit: "mg/dL", internalUnit: "mg/dL", fullName: "中性脂肪", category: "脂質代謝" },
  "トリグリセリド": { min: 30, max: 149, unit: "mg/dL", internalUnit: "mg/dL", fullName: "中性脂肪", category: "脂質代謝" },

  // ── 電解質 ───────────────────────────────────────────────────────────────
  Na: { min: 138, max: 145, unit: "mEq/L", internalUnit: "mEq/L", fullName: "ナトリウム", category: "電解質", criticalLow: 120, criticalHigh: 160 },
  "ナトリウム": { min: 138, max: 145, unit: "mEq/L", internalUnit: "mEq/L", fullName: "ナトリウム", category: "電解質", criticalLow: 120, criticalHigh: 160 },
  K: { min: 3.6, max: 4.8, unit: "mEq/L", internalUnit: "mEq/L", fullName: "カリウム", category: "電解質", criticalLow: 2.5, criticalHigh: 6.5 },
  "カリウム": { min: 3.6, max: 4.8, unit: "mEq/L", internalUnit: "mEq/L", fullName: "カリウム", category: "電解質", criticalLow: 2.5, criticalHigh: 6.5 },
  Cl: { min: 101, max: 108, unit: "mEq/L", internalUnit: "mEq/L", fullName: "クロール", category: "電解質" },
  Ca: { min: 8.8, max: 10.1, unit: "mg/dL", internalUnit: "mg/dL", fullName: "カルシウム", category: "電解質", criticalLow: 6.0, criticalHigh: 13.0 },
  "カルシウム": { min: 8.8, max: 10.1, unit: "mg/dL", internalUnit: "mg/dL", fullName: "カルシウム", category: "電解質" },
  Mg: { min: 1.8, max: 2.6, unit: "mg/dL", internalUnit: "mg/dL", fullName: "マグネシウム", category: "電解質" },
  P: { min: 2.5, max: 4.5, unit: "mg/dL", internalUnit: "mg/dL", fullName: "無機リン", category: "電解質" },

  // ── 炎症・感染 ───────────────────────────────────────────────────────────
  CRP: { min: 0, max: 0.14, unit: "mg/dL", internalUnit: "mg/dL", fullName: "C反応性蛋白", category: "炎症", criticalHigh: 10.0 },
  "C反応性蛋白": { min: 0, max: 0.14, unit: "mg/dL", internalUnit: "mg/dL", fullName: "C反応性蛋白", category: "炎症" },
  ESR: { min: 0, max: 20, unit: "mm/h", internalUnit: "mm/h", fullName: "赤血球沈降速度", category: "炎症" },
  PCT: { min: 0, max: 0.05, unit: "ng/mL", internalUnit: "ng/mL", fullName: "プロカルシトニン", category: "炎症" },

  // ── 凝固 ─────────────────────────────────────────────────────────────────
  PT: { min: 70, max: 130, unit: "%", internalUnit: "%", fullName: "プロトロンビン時間", category: "凝固" },
  "PT-INR": { min: 0.85, max: 1.15, unit: "", internalUnit: "", fullName: "PT-INR", category: "凝固", criticalHigh: 5.0 },
  INR: { min: 0.85, max: 1.15, unit: "", internalUnit: "", fullName: "PT-INR", category: "凝固", criticalHigh: 5.0 },
  APTT: { min: 25, max: 40, unit: "秒", internalUnit: "秒", fullName: "活性化部分トロンボプラスチン時間", category: "凝固" },
  FIB: { min: 200, max: 400, unit: "mg/dL", internalUnit: "mg/dL", fullName: "フィブリノゲン", category: "凝固" },
  "Dダイマー": { min: 0, max: 1.0, unit: "μg/mL", internalUnit: "μg/mL", fullName: "Dダイマー", category: "凝固" },
  "D-dimer": { min: 0, max: 1.0, unit: "μg/mL", internalUnit: "μg/mL", fullName: "Dダイマー", category: "凝固" },

  // ── 甲状腺 ───────────────────────────────────────────────────────────────
  TSH: { min: 0.5, max: 5.0, unit: "μIU/mL", internalUnit: "μIU/mL", fullName: "甲状腺刺激ホルモン", category: "甲状腺" },
  FT4: { min: 0.9, max: 1.7, unit: "ng/dL", internalUnit: "ng/dL", fullName: "遊離サイロキシン", category: "甲状腺" },
  FT3: { min: 2.3, max: 4.0, unit: "pg/mL", internalUnit: "pg/mL", fullName: "遊離トリヨードサイロニン", category: "甲状腺" },

  // ── 心筋マーカー ─────────────────────────────────────────────────────────
  CK: { min: 40, max: 200, unit: "U/L", internalUnit: "U/L", fullName: "クレアチンキナーゼ", category: "心筋マーカー" },
  "CK-MB": { min: 0, max: 25, unit: "U/L", internalUnit: "U/L", fullName: "CK-MB", category: "心筋マーカー" },
  BNP: { min: 0, max: 18.4, unit: "pg/mL", internalUnit: "pg/mL", fullName: "脳性ナトリウム利尿ペプチド", category: "心筋マーカー", criticalHigh: 200 },
  "NT-proBNP": { min: 0, max: 125, unit: "pg/mL", internalUnit: "pg/mL", fullName: "NT-proBNP", category: "心筋マーカー" },
  "トロポニンI": { min: 0, max: 0.04, unit: "ng/mL", internalUnit: "ng/mL", fullName: "トロポニンI", category: "心筋マーカー" },
  "トロポニンT": { min: 0, max: 0.014, unit: "ng/mL", internalUnit: "ng/mL", fullName: "トロポニンT", category: "心筋マーカー" },

  // ── 膵臓 ─────────────────────────────────────────────────────────────────
  AMY: { min: 44, max: 132, unit: "U/L", internalUnit: "U/L", fullName: "アミラーゼ", category: "膵臓" },
  "アミラーゼ": { min: 44, max: 132, unit: "U/L", internalUnit: "U/L", fullName: "アミラーゼ", category: "膵臓" },
  LIP: { min: 13, max: 55, unit: "U/L", internalUnit: "U/L", fullName: "リパーゼ", category: "膵臓" },
};

// ── 単位変換テーブル ──────────────────────────────────────────────────────────
// OCRが読み取った単位を内部単位に変換するための係数
// { fromUnit: { toUnit: multiplier } }
const UNIT_CONVERSION: Record<string, Record<string, number>> = {
  // WBC: ×10³/μL → /μL (×1000)
  "×10³/μl": { "/μl": 1000 },
  "×10³/μL": { "/μL": 1000 },
  "10³/μl": { "/μl": 1000 },
  "10³/μL": { "/μL": 1000 },
  "千/μl": { "/μl": 1000 },
  "千/μL": { "/μL": 1000 },

  // WBC: ×10²/μL → /μL (×100)  ← 一部検査票で使用
  "×10²/μl": { "/μl": 100 },
  "×10²/μL": { "/μL": 100 },

  // RBC: ×10⁶/μL → ×10⁴/μL (×100)
  // 1×10⁶/μL = 100×10⁴/μL
  "×10⁶/μl": { "×10⁴/μl": 100 },
  "×10⁶/μL": { "×10⁴/μL": 100 },
  "10⁶/μl": { "×10⁴/μl": 100 },
  "10⁶/μL": { "×10⁴/μL": 100 },
  "百万/μl": { "×10⁴/μl": 100 },
  "百万/μL": { "×10⁴/μL": 100 },

  // RBC: ×10⁴/μL → ×10⁴/μL (×1, no conversion needed but listed for clarity)
  "×10⁴/μl": { "×10⁴/μl": 1 },
  "×10⁴/μL": { "×10⁴/μL": 1 },

  // PLT: ×10⁴/μL → ×10³/μL (×10)
  // (some labs report PLT in ×10⁴/μL, e.g. 22.0 ×10⁴/μL = 220 ×10³/μL)
};

/**
 * 検査項目名の正規化（別名・英語名→標準キー）
 */
function normalizeItemName(name: string): string {
  const upper = name.trim().toUpperCase();
  const aliases: Record<string, string> = {
    "GOT": "AST",
    "GPT": "ALT",
    "HB": "Hb",
    "HT": "HCT",
    "CR": "CRE",
    "CREATININE": "CRE",
    "GLUCOSE": "GLU",
    "TRIGLYCERIDE": "TG",
    "CHOLESTEROL": "TC",
    "WBC": "WBC",
    "RBC": "RBC",
    "PLT": "PLT",
  };
  return aliases[upper] || name.trim();
}

/**
 * 単位を正規化して内部スケールに変換する
 * 例: WBC 5.8 ×10³/μL → 5800 /μL
 *     RBC 4.5 ×10⁶/μL → 450 ×10⁴/μL
 */
function normalizeValue(value: number, fromUnit: string, itemKey: string): { value: number; unit: string } {
  const ref = REFERENCE_VALUES[itemKey];
  if (!ref) return { value, unit: fromUnit };

  const targetUnit = ref.internalUnit;
  const fromUnitClean = fromUnit.trim();

  // 同一単位なら変換不要（空文字列は除く）
  if (fromUnitClean !== "" && fromUnitClean === targetUnit) {
    return { value, unit: targetUnit };
  }

  // 大文字小文字・スペース正規化して変換テーブルを探す
  if (fromUnitClean !== "") {
    const conversionMap = UNIT_CONVERSION[fromUnitClean];
    if (conversionMap) {
      for (const [toUnit, multiplier] of Object.entries(conversionMap)) {
        if (toUnit.toLowerCase() === targetUnit.toLowerCase()) {
          return { value: value * multiplier, unit: targetUnit };
        }
      }
    }
  }

  // WBC特別処理: 単位に×10³が含まれるか、単位なしで値が100未満の場合に変換（例: 5.8 → 5800）
  if ((itemKey === "WBC" || itemKey === "白血球" || itemKey === "白血球数") && targetUnit === "/μL") {
    const unitHasThousand = fromUnitClean.includes("10³") || fromUnitClean.includes("10^3") || fromUnitClean.toLowerCase().includes("千");
    if (unitHasThousand || value < 100) {
      return { value: value * 1000, unit: "/μL" };
    }
  }

  // RBC特別処理: 単位に×10⁶が含まれるか、値が10未満の場合に変換（例: 4.5 → 450）
  if ((itemKey === "RBC" || itemKey === "赤血球" || itemKey === "赤血球数") && targetUnit === "×10⁴/μL") {
    const unitHasMillion = fromUnitClean.includes("10⁶") || fromUnitClean.includes("10^6") || fromUnitClean.toLowerCase().includes("百万");
    if (unitHasMillion || value < 10) {
      return { value: value * 100, unit: "×10⁴/μL" };
    }
  }

  // PLT特別処理: 単位に×10⁴が含まれるか、値が100未満の場合に変換（例: 22.0 → 220）
  if ((itemKey === "PLT" || itemKey === "血小板" || itemKey === "血小板数") && targetUnit === "×10³/μL") {
    const unitHasTenThousand = fromUnitClean.includes("10⁴") || fromUnitClean.includes("10^4");
    if (unitHasTenThousand || value < 100) {
      return { value: value * 10, unit: "×10³/μL" };
    }
  }

  return { value, unit: fromUnit };
}

/**
 * 異常値スクリーニング
 */
export function screenAbnormalValues(
  extractedItems: Array<{ item: string; value: number; unit?: string }>
): ScreeningResult[] {
  const results: ScreeningResult[] = [];

  for (const { item, value, unit } of extractedItems) {
    const normalizedName = normalizeItemName(item);
    const ref = REFERENCE_VALUES[normalizedName] || REFERENCE_VALUES[item];

    if (!ref) continue; // 基準値が不明な項目はスキップ

    // 単位変換して内部スケールに正規化
    const { value: normalizedValue, unit: normalizedUnit } = normalizeValue(
      value,
      unit || "",
      normalizedName
    );

    let status: ScreeningResult["status"] = "normal";

    if (ref.criticalHigh !== undefined && normalizedValue > ref.criticalHigh) {
      status = "critical_high";
    } else if (ref.criticalLow !== undefined && normalizedValue < ref.criticalLow) {
      status = "critical_low";
    } else if (ref.max !== undefined && normalizedValue > ref.max) {
      status = "high";
    } else if (ref.min !== undefined && normalizedValue < ref.min) {
      status = "low";
    }

    results.push({
      item: normalizedName,
      fullName: ref.fullName,
      value: normalizedValue,
      displayValue: value,
      unit: normalizedUnit || ref.unit,
      status,
      referenceMin: ref.min,
      referenceMax: ref.max,
      category: ref.category,
    });
  }

  return results;
}

/**
 * 異常値のみフィルタリング
 */
export function getAbnormalValues(results: ScreeningResult[]): ScreeningResult[] {
  return results.filter((r) => r.status !== "normal");
}
