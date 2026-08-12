export type Gender = "male" | "female" | "unknown";

export type ExtractedItem = {
  item: string;
  value: number | null;
  unit: string;
};

export type ScreeningStatus = "high" | "low" | "critical_high" | "critical_low" | "normal";

export type ScreeningResult = {
  item: string;
  fullName: string;
  value: number;
  displayValue: number;
  unit: string;
  status: ScreeningStatus;
  referenceMin?: number;
  referenceMax?: number;
  category: string;
  genderSpecific?: boolean;
};

export type AssessmentReport = {
  abnormalSummary: ScreeningResult[];
  predictedConditions: Array<{ condition: string; relatedItems: string[] }>;
  observationPoints: string[];
  recordSummary: string;
  fullReport: string;
};

export type LocalBloodTestRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  testDate?: string;
  gender: Gender;
  extractedItems: ExtractedItem[];
  screeningResults: ScreeningResult[];
  report: AssessmentReport;
  source: "local-ocr" | "manual";
};

export type LocalSettings = {
  version: 1;
  ocrLanguageReady: boolean;
};
