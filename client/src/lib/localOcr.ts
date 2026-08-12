import { createWorker } from "tesseract.js";
import type { ExtractedItem } from "./localTypes";

export type OcrProgress = { status: string; progress: number };

type OcrCandidate = {
  canonical: string;
  aliases: string[];
  defaultUnit: string;
};

const OCR_CANDIDATES: OcrCandidate[] = [
  { canonical: "WBC", aliases: ["WBC", "白血球", "白血球数"], defaultUnit: "/μL" },
  { canonical: "RBC", aliases: ["RBC", "赤血球", "赤血球数"], defaultUnit: "×10⁴/μL" },
  { canonical: "HGB", aliases: ["HGB", "Hb", "ヘモグロビン"], defaultUnit: "g/dL" },
  { canonical: "HCT", aliases: ["HCT", "Ht", "ヘマトクリット"], defaultUnit: "%" },
  { canonical: "PLT", aliases: ["PLT", "血小板", "血小板数"], defaultUnit: "×10³/μL" },
  { canonical: "AST", aliases: ["AST", "GOT", "AST(GOT)"], defaultUnit: "U/L" },
  { canonical: "ALT", aliases: ["ALT", "GPT", "ALT(GPT)"], defaultUnit: "U/L" },
  { canonical: "γ-GTP", aliases: ["γ-GTP", "γGTP", "GGT", "r-GTP", "Y-GTP"], defaultUnit: "U/L" },
  { canonical: "ALP", aliases: ["ALP"], defaultUnit: "U/L" },
  { canonical: "LDH", aliases: ["LDH"], defaultUnit: "U/L" },
  { canonical: "TP", aliases: ["TP", "総蛋白"], defaultUnit: "g/dL" },
  { canonical: "ALB", aliases: ["ALB", "Alb", "アルブミン"], defaultUnit: "g/dL" },
  { canonical: "T_BIL", aliases: ["T-Bil", "T_BIL", "総ビリルビン"], defaultUnit: "mg/dL" },
  { canonical: "BUN", aliases: ["BUN", "尿素窒素"], defaultUnit: "mg/dL" },
  { canonical: "CRE", aliases: ["Cre", "CRE", "クレアチニン"], defaultUnit: "mg/dL" },
  { canonical: "eGFR", aliases: ["eGFR"], defaultUnit: "mL/min/1.73m²" },
  { canonical: "UA", aliases: ["UA", "尿酸"], defaultUnit: "mg/dL" },
  { canonical: "GLU", aliases: ["GLU", "BS", "FBS", "血糖"], defaultUnit: "mg/dL" },
  { canonical: "HbA1c", aliases: ["HbA1c", "HBA1C", "A1C", "ヘモグロビンA1c"], defaultUnit: "%" },
  { canonical: "TC", aliases: ["TC", "総コレステロール"], defaultUnit: "mg/dL" },
  { canonical: "LDL", aliases: ["LDL-C", "LDL", "LDLコレステロール"], defaultUnit: "mg/dL" },
  { canonical: "HDL", aliases: ["HDL-C", "HDL", "HDLコレステロール"], defaultUnit: "mg/dL" },
  { canonical: "TG", aliases: ["TG", "中性脂肪", "トリグリセリド"], defaultUnit: "mg/dL" },
  { canonical: "Na", aliases: ["Na", "ナトリウム"], defaultUnit: "mEq/L" },
  { canonical: "K", aliases: ["K", "カリウム"], defaultUnit: "mEq/L" },
  { canonical: "Cl", aliases: ["Cl", "クロール"], defaultUnit: "mEq/L" },
  { canonical: "Ca", aliases: ["Ca", "カルシウム"], defaultUnit: "mg/dL" },
  { canonical: "CRP", aliases: ["CRP", "C反応性蛋白"], defaultUnit: "mg/dL" },
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeNumber(value: string) {
  const normalized = value.replace(/,/g, "").replace(/O/g, "0").replace(/[Il]/g, "1");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function detectUnit(line: string, fallback: string) {
  const unitMatch = line.match(/(×\s*10[²³⁴⁶]|x\s*10[2346]|\/?μ?[lL]|U\/?L|mg\/?dL|mg\/?L|g\/?dL|mEq\/?L|mmol\/?L|%|pg|fL|mL\/min\/1\.73m²)/i);
  return unitMatch?.[0]?.replace(/\s+/g, "") ?? fallback;
}

export function parseBloodTestText(rawText: string): ExtractedItem[] {
  const lines = rawText
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const extracted: ExtractedItem[] = [];
  for (const candidate of OCR_CANDIDATES) {
    const match = lines.find((line) => candidate.aliases.some((alias) => line.toLowerCase().includes(alias.toLowerCase())));
    if (!match) continue;
    const alias = candidate.aliases.find((value) => match.toLowerCase().includes(value.toLowerCase())) ?? candidate.canonical;
    const afterLabel = match.replace(new RegExp(`.*?${escapeRegExp(alias)}`, "i"), "");
    const numericMatch = afterLabel.match(/[-+]?\d[\d,.]*/);
    const value = numericMatch ? normalizeNumber(numericMatch[0]) : null;
    extracted.push({
      item: candidate.canonical,
      value,
      unit: detectUnit(afterLabel, candidate.defaultUnit),
    });
  }
  return extracted;
}

/**
 * すべてのOCR資産を同一オリジンの静的ファイルから読み込む。
 * デプロイ後はService Workerがこれらをキャッシュするため、初回オンライン起動後にオフライン利用できる。
 */
export async function extractFromImage(file: File, onProgress?: (progress: OcrProgress) => void) {
  const base = import.meta.env.BASE_URL;
  const worker = await createWorker("jpn+eng", 1, {
    workerPath: `${base}ocr/worker.min.js`,
    corePath: `${base}ocr/tesseract-core-simd-lstm.wasm.js`,
    langPath: `${base}tessdata`,
    cacheMethod: "none",
    gzip: true,
    logger: (message) => onProgress?.({ status: message.status, progress: message.progress }),
  });
  try {
    const result = await worker.recognize(file);
    const rawText = result.data.text;
    return { rawText, items: parseBloodTestText(rawText) };
  } finally {
    await worker.terminate();
  }
}
