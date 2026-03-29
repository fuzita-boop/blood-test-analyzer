/**
 * フロントエンドで使用する基準値の最小限情報
 * （サーバー側の完全版は server/referenceValues.ts を参照）
 */
export interface ReferenceRangeBasic {
  min?: number;
  max?: number;
  unit: string;
  fullName: string;
}

export const REFERENCE_VALUES_BASIC: Record<string, ReferenceRangeBasic> = {
  WBC: { min: 3.3, max: 8.6, unit: "×10³/μL", fullName: "白血球数" },
  RBC: { min: 3.86, max: 5.77, unit: "×10⁶/μL", fullName: "赤血球数" },
  HGB: { min: 11.3, max: 17.2, unit: "g/dL", fullName: "ヘモグロビン" },
  Hb: { min: 11.3, max: 17.2, unit: "g/dL", fullName: "ヘモグロビン" },
  HCT: { min: 33.4, max: 51.8, unit: "%", fullName: "ヘマトクリット" },
  PLT: { min: 158, max: 348, unit: "×10³/μL", fullName: "血小板数" },
  AST: { min: 13, max: 30, unit: "U/L", fullName: "AST（GOT）" },
  ALT: { min: 7, max: 42, unit: "U/L", fullName: "ALT（GPT）" },
  BUN: { min: 8, max: 20, unit: "mg/dL", fullName: "尿素窒素" },
  CRE: { min: 0.46, max: 1.04, unit: "mg/dL", fullName: "クレアチニン" },
  Cr: { min: 0.46, max: 1.04, unit: "mg/dL", fullName: "クレアチニン" },
  eGFR: { min: 60, max: 999, unit: "mL/min/1.73m²", fullName: "推算糸球体濾過量" },
  GLU: { min: 70, max: 109, unit: "mg/dL", fullName: "血糖" },
  HbA1c: { min: 4.6, max: 6.2, unit: "%", fullName: "HbA1c（NGSP）" },
  TC: { min: 142, max: 248, unit: "mg/dL", fullName: "総コレステロール" },
  LDL: { min: 65, max: 139, unit: "mg/dL", fullName: "LDLコレステロール" },
  HDL: { min: 40, max: 999, unit: "mg/dL", fullName: "HDLコレステロール" },
  TG: { min: 30, max: 149, unit: "mg/dL", fullName: "中性脂肪" },
  Na: { min: 138, max: 145, unit: "mEq/L", fullName: "ナトリウム" },
  K: { min: 3.6, max: 4.8, unit: "mEq/L", fullName: "カリウム" },
  Cl: { min: 101, max: 108, unit: "mEq/L", fullName: "クロール" },
  Ca: { min: 8.8, max: 10.1, unit: "mg/dL", fullName: "カルシウム" },
  CRP: { min: 0, max: 0.14, unit: "mg/dL", fullName: "C反応性蛋白" },
  ALB: { min: 4.1, max: 5.1, unit: "g/dL", fullName: "アルブミン" },
  TP: { min: 6.6, max: 8.1, unit: "g/dL", fullName: "総蛋白" },
  TSH: { min: 0.5, max: 5.0, unit: "μIU/mL", fullName: "甲状腺刺激ホルモン" },
  BNP: { min: 0, max: 18.4, unit: "pg/mL", fullName: "脳性ナトリウム利尿ペプチド" },
  UA: { min: 2.1, max: 7.0, unit: "mg/dL", fullName: "尿酸" },
};
