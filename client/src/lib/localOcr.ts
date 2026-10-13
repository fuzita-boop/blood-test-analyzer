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

function normalizeLine(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[‐‑–—―ー]/g, "-")
    .replace(/[，、]/g, ",")
    .replace(/[．。]/g, ".")
    .trim();
}

function normalizeNumber(value: string) {
  const normalized = value
    .normalize("NFKC")
    .replace(/,/g, "")
    .replace(/[Oo]/g, "0")
    .replace(/[Il]/g, "1");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function matchesAlias(line: string, alias: string) {
  const normalizedAlias = normalizeLine(alias);
  // 英数字だけの短い略称は単語境界を要求する（例: Hb が HbA1c に一致しないようにする）。
  if (/^[A-Za-z0-9]+$/.test(normalizedAlias)) {
    return new RegExp(`(?:^|[^A-Za-z0-9])${escapeRegExp(normalizedAlias)}(?![A-Za-z0-9])`, "i").test(line);
  }
  return line.toLowerCase().includes(normalizedAlias.toLowerCase());
}

function detectUnit(text: string, fallback: string) {
  const unitMatch = text.match(/((?:×|x)\s*10(?:[²³⁴⁶]|\^?[2346])\s*\/?\s*μ?[lL]|U\/?L|mg\/?dL|mg\/?L|g\/?dL|mEq\/?L|mmol\/?L|mL\/?min\/?1\.73m2|\/?μ[lL]|%|pg|fL)/i);
  const detected = unitMatch?.[0]?.replace(/\s+/g, "");
  if (!detected) return fallback;
  return detected
    .replace(/[xX]/, "×")
    .replace(/10\^?2/g, "10²")
    .replace(/10\^?3/g, "10³")
    .replace(/10\^?4/g, "10⁴")
    .replace(/10\^?6/g, "10⁶");
}

function isReferenceRange(text: string) {
  return /\d[\d,.]*\s*(?:~|〜|\-|–|to)\s*\d[\d,.]*/i.test(text);
}

function getValueNearLabel(lines: string[], lineIndex: number, alias: string) {
  const labelLine = lines[lineIndex] ?? "";
  const afterLabel = labelLine.replace(new RegExp(`.*?${escapeRegExp(alias)}`, "i"), "");
  const sameLineValue = afterLabel.match(/[-+]?\d[\d,.]*/)?.[0];
  if (sameLineValue && !isReferenceRange(afterLabel)) {
    return { value: normalizeNumber(sameLineValue), context: lines.slice(lineIndex, lineIndex + 3).join(" ") };
  }

  // 検査票の列レイアウトでは「項目名」「数値」「単位」が別々の行としてOCRされる場合がある。
  // 直後2行だけを候補にし、基準値の範囲表記は実測値として扱わない。
  for (let offset = 1; offset <= 2; offset += 1) {
    const nextLine = lines[lineIndex + offset];
    if (!nextLine || isReferenceRange(nextLine) || /^(?:基準値|参考値|単位|項目|結果)$/i.test(nextLine)) continue;
    const numericValue = nextLine.match(/^\s*([-+]?\d[\d,.]*)\s*(?:$|[^\d])/ )?.[1];
    if (numericValue) {
      return { value: normalizeNumber(numericValue), context: lines.slice(lineIndex, lineIndex + 4).join(" ") };
    }
  }

  return { value: null, context: lines.slice(lineIndex, lineIndex + 3).join(" ") };
}

/**
 * OCR本文から、検査項目の直後にある実測値を候補として抽出する。
 * 同一行だけでなく、表の列が分割されたOCR結果（項目名→数値→単位）にも対応する。
 * 数値のない項目・基準範囲だけの行は未検査（null）として残し、解析対象にはしない。
 */
export function parseBloodTestText(rawText: string): ExtractedItem[] {
  const lines = rawText
    .replace(/\r/g, "")
    .split("\n")
    .map(normalizeLine)
    .filter(Boolean);

  const extracted: ExtractedItem[] = [];
  for (const candidate of OCR_CANDIDATES) {
    const lineIndex = lines.findIndex((line) => candidate.aliases.some((alias) => matchesAlias(line, alias)));
    if (lineIndex < 0) continue;

    const match = lines[lineIndex];
    const alias = candidate.aliases.find((value) => matchesAlias(match, value)) ?? candidate.canonical;
    const { value, context } = getValueNearLabel(lines, lineIndex, normalizeLine(alias));
    extracted.push({
      item: candidate.canonical,
      value,
      unit: detectUnit(context, candidate.defaultUnit),
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
