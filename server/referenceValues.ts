/**
 * 一般的な基準値テーブル（日本人間ドック学会・各専門学会ガイドライン準拠）
 *
 * 【男女別基準値】
 * 以下の項目は男女で基準値が異なるため、gender パラメータで切り替える:
 *   RBC, Hb(HGB), Ht(HCT), UA, γ-GTP, CK, Ferritin など
 *
 * 【単位統一方針】
 *   WBC: /μL 単位（例: 5800 /μL）
 *   RBC: ×10⁴/μL 単位（例: 450 ×10⁴/μL）
 *   PLT: ×10³/μL 単位（例: 220 ×10³/μL）
 */

export type Gender = "male" | "female" | "unknown";

export interface ReferenceRange {
  min?: number;
  max?: number;
  minMale?: number;
  maxMale?: number;
  minFemale?: number;
  maxFemale?: number;
  unit: string;
  internalUnit: string;
  fullName: string;
  category: string;
  criticalLow?: number;
  criticalHigh?: number;
}

export interface ScreeningResult {
  item: string;
  fullName: string;
  value: number;
  displayValue: number;
  unit: string;
  status: "high" | "low" | "critical_high" | "critical_low" | "normal";
  referenceMin?: number;
  referenceMax?: number;
  category: string;
  genderSpecific?: boolean;
}

// ── 基準値テーブル ────────────────────────────────────────────────────────────
export const REFERENCE_VALUES: Record<string, ReferenceRange> = {

  // ── 血算（CBC） ──────────────────────────────────────────────────────────
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

  // RBC: 男性 427〜570、女性 376〜500 ×10⁴/μL
  RBC: {
    minMale: 427, maxMale: 570,
    minFemale: 376, maxFemale: 500,
    min: 376, max: 570,
    unit: "×10⁴/μL", internalUnit: "×10⁴/μL",
    fullName: "赤血球数", category: "血算",
  },
  "赤血球数": {
    minMale: 427, maxMale: 570,
    minFemale: 376, maxFemale: 500,
    min: 376, max: 570,
    unit: "×10⁴/μL", internalUnit: "×10⁴/μL",
    fullName: "赤血球数", category: "血算",
  },
  "赤血球": {
    minMale: 427, maxMale: 570,
    minFemale: 376, maxFemale: 500,
    min: 376, max: 570,
    unit: "×10⁴/μL", internalUnit: "×10⁴/μL",
    fullName: "赤血球数", category: "血算",
  },

  // Hb: 男性 13.7〜16.8、女性 11.6〜14.8 g/dL
  HGB: {
    minMale: 13.7, maxMale: 16.8,
    minFemale: 11.6, maxFemale: 14.8,
    min: 11.6, max: 16.8,
    unit: "g/dL", internalUnit: "g/dL",
    fullName: "ヘモグロビン", category: "血算",
    criticalLow: 7.0, criticalHigh: 20.0,
  },
  Hb: {
    minMale: 13.7, maxMale: 16.8,
    minFemale: 11.6, maxFemale: 14.8,
    min: 11.6, max: 16.8,
    unit: "g/dL", internalUnit: "g/dL",
    fullName: "ヘモグロビン", category: "血算",
    criticalLow: 7.0, criticalHigh: 20.0,
  },
  "ヘモグロビン": {
    minMale: 13.7, maxMale: 16.8,
    minFemale: 11.6, maxFemale: 14.8,
    min: 11.6, max: 16.8,
    unit: "g/dL", internalUnit: "g/dL",
    fullName: "ヘモグロビン", category: "血算",
    criticalLow: 7.0, criticalHigh: 20.0,
  },

  // Ht: 男性 40.7〜50.1、女性 35.1〜44.4 %
  HCT: {
    minMale: 40.7, maxMale: 50.1,
    minFemale: 35.1, maxFemale: 44.4,
    min: 35.1, max: 50.1,
    unit: "%", internalUnit: "%",
    fullName: "ヘマトクリット", category: "血算",
  },
  Ht: {
    minMale: 40.7, maxMale: 50.1,
    minFemale: 35.1, maxFemale: 44.4,
    min: 35.1, max: 50.1,
    unit: "%", internalUnit: "%",
    fullName: "ヘマトクリット", category: "血算",
  },
  "ヘマトクリット": {
    minMale: 40.7, maxMale: 50.1,
    minFemale: 35.1, maxFemale: 44.4,
    min: 35.1, max: 50.1,
    unit: "%", internalUnit: "%",
    fullName: "ヘマトクリット", category: "血算",
  },

  MCV: { min: 79.0, max: 100.0, unit: "fL", internalUnit: "fL", fullName: "平均赤血球容積", category: "血算" },
  MCH: { min: 26.3, max: 34.3, unit: "pg", internalUnit: "pg", fullName: "平均赤血球ヘモグロビン量", category: "血算" },
  MCHC: { min: 31.7, max: 35.3, unit: "g/dL", internalUnit: "g/dL", fullName: "平均赤血球ヘモグロビン濃度", category: "血算" },

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

  // γ-GTP: 男性 0〜70、女性 0〜30 U/L
  "γ-GT": {
    minMale: 0, maxMale: 70,
    minFemale: 0, maxFemale: 30,
    min: 0, max: 70,
    unit: "U/L", internalUnit: "U/L",
    fullName: "γ-GTP", category: "肝機能",
  },
  "γGTP": {
    minMale: 0, maxMale: 70,
    minFemale: 0, maxFemale: 30,
    min: 0, max: 70,
    unit: "U/L", internalUnit: "U/L",
    fullName: "γ-GTP", category: "肝機能",
  },
  "γ-GTP": {
    minMale: 0, maxMale: 70,
    minFemale: 0, maxFemale: 30,
    min: 0, max: 70,
    unit: "U/L", internalUnit: "U/L",
    fullName: "γ-GTP", category: "肝機能",
  },
  "GGT": {
    minMale: 0, maxMale: 70,
    minFemale: 0, maxFemale: 30,
    min: 0, max: 70,
    unit: "U/L", internalUnit: "U/L",
    fullName: "γ-GTP", category: "肝機能",
  },
  "γGT": {
    minMale: 0, maxMale: 70,
    minFemale: 0, maxFemale: 30,
    min: 0, max: 70,
    unit: "U/L", internalUnit: "U/L",
    fullName: "γ-GTP", category: "肝機能",
  },

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

  // Cr: 男性 0.65〜1.07、女性 0.46〜0.79 mg/dL
  CRE: {
    minMale: 0.65, maxMale: 1.07,
    minFemale: 0.46, maxFemale: 0.79,
    min: 0.46, max: 1.07,
    unit: "mg/dL", internalUnit: "mg/dL",
    fullName: "クレアチニン", category: "腎機能",
    criticalHigh: 10.0,
  },
  Cr: {
    minMale: 0.65, maxMale: 1.07,
    minFemale: 0.46, maxFemale: 0.79,
    min: 0.46, max: 1.07,
    unit: "mg/dL", internalUnit: "mg/dL",
    fullName: "クレアチニン", category: "腎機能",
    criticalHigh: 10.0,
  },
  "クレアチニン": {
    minMale: 0.65, maxMale: 1.07,
    minFemale: 0.46, maxFemale: 0.79,
    min: 0.46, max: 1.07,
    unit: "mg/dL", internalUnit: "mg/dL",
    fullName: "クレアチニン", category: "腎機能",
    criticalHigh: 10.0,
  },

  eGFR: { min: 60, max: 9999, unit: "mL/min/1.73m²", internalUnit: "mL/min/1.73m²", fullName: "推算糸球体濾過量", category: "腎機能" },

  // UA: 男性 3.7〜7.0、女性 2.1〜5.5 mg/dL
  UA: {
    minMale: 3.7, maxMale: 7.0,
    minFemale: 2.1, maxFemale: 5.5,
    min: 2.1, max: 7.0,
    unit: "mg/dL", internalUnit: "mg/dL",
    fullName: "尿酸", category: "腎機能",
  },
  "尿酸": {
    minMale: 3.7, maxMale: 7.0,
    minFemale: 2.1, maxFemale: 5.5,
    min: 2.1, max: 7.0,
    unit: "mg/dL", internalUnit: "mg/dL",
    fullName: "尿酸", category: "腎機能",
  },

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
  "LDLコレステロール": { min: 65, max: 139, unit: "mg/dL", internalUnit: "mg/dL", fullName: "LDLコレステロール", category: "脂質代謝" },
  "LDL-コレステロール": { min: 65, max: 139, unit: "mg/dL", internalUnit: "mg/dL", fullName: "LDLコレステロール", category: "脂質代謝" },
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
  // CRP: mg/dL 基準（一部検査票は mg/L で記載 → 変換が必要）
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
  // CK: 男性 59〜248、女性 41〜153 U/L
  CK: {
    minMale: 59, maxMale: 248,
    minFemale: 41, maxFemale: 153,
    min: 41, max: 248,
    unit: "U/L", internalUnit: "U/L",
    fullName: "クレアチンキナーゼ", category: "心筋マーカー",
  },
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

// ── 単位正規化ユーティリティ ──────────────────────────────────────────────────
/**
 * 単位文字列を正規化する
 * - 全角→半角変換
 * - スペース除去
 * - 小文字のμ/Lを大文字に統一
 */
function normalizeUnitString(unit: string): string {
  return unit
    .trim()
    // 全角英数字・記号を半角に変換
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    // 全角スペース・スペースを除去
    .replace(/[\s　]+/g, "")
    // 全角ギリシャ文字の正規化（γ）
    .replace(/γ/g, "γ")
    // 小文字 l → 大文字 L（μl → μL）
    .replace(/μl/g, "μL")
    // 上付き文字の正規化（²³⁴⁶）
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/\^4/g, "⁴")
    .replace(/\^6/g, "⁶");
}

// ── 単位変換テーブル ──────────────────────────────────────────────────────────
// 正規化済み単位文字列をキーとして使用
const UNIT_CONVERSION: Record<string, Record<string, number>> = {
  // WBC: ×10³/μL → /μL (×1000)
  "×10³/μL": { "/μL": 1000 },
  "10³/μL": { "/μL": 1000 },
  "千/μL": { "/μL": 1000 },
  // WBC: ×10²/μL → /μL (×100)
  "×10²/μL": { "/μL": 100 },
  "10²/μL": { "/μL": 100 },

  // RBC: ×10⁶/μL → ×10⁴/μL (×100)
  "×10⁶/μL": { "×10⁴/μL": 100 },
  "10⁶/μL": { "×10⁴/μL": 100 },
  "百万/μL": { "×10⁴/μL": 100 },
  // RBC: ×10⁴/μL → ×10⁴/μL (×1, no conversion)
  "×10⁴/μL": { "×10⁴/μL": 1 },
  "10⁴/μL": { "×10⁴/μL": 1 },

  // PLT: ×10⁴/μL → ×10³/μL (×10)
  // ※ RBCと同じ ×10⁴ 表記だが、PLTの場合は×10に変換
  // PLT特別処理はnormalizeValue内で行う

  // CRP: mg/L → mg/dL (÷10)
  "mg/L": { "mg/dL": 0.1 },
  "MG/L": { "mg/dL": 0.1 },

  // mEq/L と mmol/L は電解質で同値（Na, K, Clは1:1）
  "mmol/L": { "mEq/L": 1 },
  "MMOL/L": { "mEq/L": 1 },
};

/**
 * 検査項目名の正規化（別名・英語名・OCR認識バリエーション→標準キー）
 */
function normalizeItemName(name: string): string {
  const stripped = name
    .trim()
    .replace(/[（(].*?[）)]/g, "")
    .replace(/[\s\-・·]/g, "")
    .trim();

  const upper = stripped.toUpperCase();

  const aliases: Record<string, string> = {
    // 血算
    "WBC": "WBC",
    "RBC": "RBC",
    "PLT": "PLT",
    "HGB": "HGB",
    "HB": "Hb",
    "HCT": "HCT",
    "HT": "HCT",
    "MCV": "MCV",
    "MCH": "MCH",
    "MCHC": "MCHC",
    // 肝機能
    "AST": "AST",
    "GOT": "AST",
    "ALT": "ALT",
    "GPT": "ALT",
    "YGTP": "γ-GTP",
    "GGTP": "γ-GTP",
    "GGT": "GGT",
    "YGGT": "γ-GTP",
    "ALP": "ALP",
    "LDH": "LDH",
    "TBIL": "T_BIL",
    "TBILI": "T_BIL",
    "DBIL": "D_BIL",
    "TP": "TP",
    "ALB": "ALB",
    // 腎機能
    "BUN": "BUN",
    "CRE": "CRE",
    "CR": "CRE",
    "CREATININE": "CRE",
    "EGFR": "eGFR",
    "UA": "UA",
    // 糖代謝
    "GLU": "GLU",
    "BS": "BS",
    "FBS": "FBS",
    "GLUCOSE": "GLU",
    "HBAIC": "HbA1c",
    "HBA1C": "HbA1c",
    "HBAC": "HbA1c",
    "A1C": "HbA1c",
    "HEMOGLOBINA1C": "HbA1c",
    // 脂質代謝
    "TC": "TC",
    "CHOLESTEROL": "TC",
    "LDLC": "LDL",
    "LDL": "LDL",
    "LDLCHOLESTEROL": "LDL",
    "HDLC": "HDL",
    "HDL": "HDL",
    "HDLCHOLESTEROL": "HDL",
    "TG": "TG",
    "TRIGLYCERIDE": "TG",
    "TRIGLYCERIDES": "TG",
    // 電解質
    "NA": "Na",
    "K": "K",
    "CL": "Cl",
    "CA": "Ca",
    "MG": "Mg",
    "P": "P",
    // 炎症
    "CRP": "CRP",
    "ESR": "ESR",
    "PCT": "PCT",
    // 凝固
    "PT": "PT",
    "PTINR": "PT-INR",
    "INR": "INR",
    "APTT": "APTT",
    "FIB": "FIB",
    "DDIMER": "D-dimer",
    // 甲状腺
    "TSH": "TSH",
    "FT4": "FT4",
    "FT3": "FT3",
    // 心筋マーカー
    "CK": "CK",
    "CKMB": "CK-MB",
    "BNP": "BNP",
    "NTPROBNP": "NT-proBNP",
    // 膵臓
    "AMY": "AMY",
    "AMYLASE": "AMY",
    "LIP": "LIP",
    "LIPASE": "LIP",
  };

  if (aliases[upper]) return aliases[upper];
  return name.trim();
}

/**
 * 単位を正規化して内部スケールに変換する
 */
function normalizeValue(value: number, fromUnit: string, itemKey: string): { value: number; unit: string } {
  const ref = REFERENCE_VALUES[itemKey];
  if (!ref) return { value, unit: fromUnit };

  const targetUnit = ref.internalUnit;
  // 単位文字列を正規化（大文字小文字・スペース・全角を統一）
  const fromUnitNorm = normalizeUnitString(fromUnit);
  const targetUnitNorm = normalizeUnitString(targetUnit);

  // 同一単位なら変換不要
  if (fromUnitNorm !== "" && fromUnitNorm === targetUnitNorm) {
    return { value, unit: targetUnit };
  }

  // 変換テーブルで変換
  if (fromUnitNorm !== "") {
    const conversionMap = UNIT_CONVERSION[fromUnitNorm];
    if (conversionMap) {
      for (const [toUnit, multiplier] of Object.entries(conversionMap)) {
        if (normalizeUnitString(toUnit) === targetUnitNorm) {
          return { value: value * multiplier, unit: targetUnit };
        }
      }
    }
  }

  // WBC特別処理: 単位に×10³が含まれるか、単位なしで値が100未満の場合
  if ((itemKey === "WBC" || itemKey === "白血球" || itemKey === "白血球数") && targetUnitNorm === "/μL") {
    const unitHasThousand = fromUnitNorm.includes("10³") || fromUnitNorm.includes("10^3") || fromUnitNorm.includes("千");
    if (unitHasThousand || (fromUnitNorm === "" && value < 100)) {
      return { value: value * 1000, unit: "/μL" };
    }
  }

  // RBC特別処理: 単位に×10⁶が含まれるか、値が10未満の場合
  if ((itemKey === "RBC" || itemKey === "赤血球" || itemKey === "赤血球数") && targetUnitNorm === "×10⁴/μL") {
    const unitHasMillion = fromUnitNorm.includes("10⁶") || fromUnitNorm.includes("10^6") || fromUnitNorm.includes("百万");
    if (unitHasMillion || (fromUnitNorm === "" && value < 10)) {
      return { value: value * 100, unit: "×10⁴/μL" };
    }
  }

  // PLT特別処理: 単位に×10⁴が含まれるか、値が100未満の場合
  if ((itemKey === "PLT" || itemKey === "血小板" || itemKey === "血小板数") && targetUnitNorm === "×10³/μL") {
    const unitHasTenThousand = fromUnitNorm.includes("10⁴") || fromUnitNorm.includes("10^4");
    if (unitHasTenThousand || (fromUnitNorm === "" && value < 100)) {
      return { value: value * 10, unit: "×10³/μL" };
    }
  }

  return { value, unit: fromUnit };
}

/**
 * 性別に応じた基準値の min/max を取得する
 */
function getRefRange(ref: ReferenceRange, gender: Gender): { min?: number; max?: number } {
  if (gender === "male" && ref.minMale !== undefined && ref.maxMale !== undefined) {
    return { min: ref.minMale, max: ref.maxMale };
  }
  if (gender === "female" && ref.minFemale !== undefined && ref.maxFemale !== undefined) {
    return { min: ref.minFemale, max: ref.maxFemale };
  }
  return { min: ref.min, max: ref.max };
}

/**
 * 異常値スクリーニング
 * @param extractedItems OCRで抽出した検査項目リスト
 * @param gender 性別（"male" | "female" | "unknown"）
 */
export function screenAbnormalValues(
  extractedItems: Array<{ item: string; value: number | null | undefined; unit?: string }>,
  gender: Gender = "unknown"
): ScreeningResult[] {
  const results: ScreeningResult[] = [];

  for (const { item, value, unit } of extractedItems) {
    // null / undefined / NaN は未検査項目 → スキップ
    if (value === null || value === undefined || (typeof value === "number" && isNaN(value))) {
      continue;
    }
    const normalizedName = normalizeItemName(item);
    const ref = REFERENCE_VALUES[normalizedName] || REFERENCE_VALUES[item];

    if (!ref) continue;

    const { value: normalizedValue, unit: normalizedUnit } = normalizeValue(
      value,
      unit || "",
      normalizedName
    );

    const { min: refMin, max: refMax } = getRefRange(ref, gender);
    const isGenderSpecific = (ref.minMale !== undefined || ref.minFemale !== undefined);

    let status: ScreeningResult["status"] = "normal";

    if (ref.criticalHigh !== undefined && normalizedValue > ref.criticalHigh) {
      status = "critical_high";
    } else if (ref.criticalLow !== undefined && normalizedValue < ref.criticalLow) {
      status = "critical_low";
    } else if (refMax !== undefined && normalizedValue > refMax) {
      status = "high";
    } else if (refMin !== undefined && normalizedValue < refMin) {
      status = "low";
    }

    results.push({
      item: normalizedName,
      fullName: ref.fullName,
      value: normalizedValue,
      displayValue: value,
      unit: normalizedUnit || unit || ref.unit,
      status,
      referenceMin: refMin,
      referenceMax: refMax,
      category: ref.category,
      genderSpecific: isGenderSpecific,
    });
  }

  return results;
}

/**
 * 異常値のみを返す（status が normal 以外）
 */
export function getAbnormalValues(
  extractedItems: Array<{ item: string; value: number | null | undefined; unit?: string }>,
  gender: Gender = "unknown"
): ScreeningResult[] {
  return screenAbnormalValues(extractedItems, gender).filter(r => r.status !== "normal");
}
