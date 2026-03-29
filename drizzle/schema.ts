import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 患者テーブル
export const patients = mysqlTable("patients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // 担当ユーザー（看護師）
  name: varchar("name", { length: 100 }).notNull(),
  patientCode: varchar("patientCode", { length: 50 }), // 患者コード（任意）
  birthYear: int("birthYear"), // 生年（個人情報最小化のため年のみ）
  gender: mysqlEnum("gender", ["male", "female", "other"]),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

// 採血記録テーブル
export const bloodTestRecords = mysqlTable("blood_test_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  patientId: int("patientId"), // 患者紐付け（任意）
  imageUrl: text("imageUrl").notNull(), // S3 URL
  imageKey: varchar("imageKey", { length: 500 }).notNull(), // S3 key
  testDate: timestamp("testDate"), // 採血日（画像から抽出 or 手動入力）
  extractedData: json("extractedData"), // OCR抽出結果（構造化JSON）
  status: mysqlEnum("status", ["uploading", "processing", "completed", "error"])
    .default("uploading")
    .notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BloodTestRecord = typeof bloodTestRecords.$inferSelect;
export type InsertBloodTestRecord = typeof bloodTestRecords.$inferInsert;

// アセスメントレポートテーブル
export const assessmentReports = mysqlTable("assessment_reports", {
  id: int("id").autoincrement().primaryKey(),
  bloodTestRecordId: int("bloodTestRecordId").notNull(),
  userId: int("userId").notNull(),
  patientId: int("patientId"),
  // レポート各セクション
  abnormalValues: json("abnormalValues"), // 異常値サマリー
  predictedConditions: json("predictedConditions"), // 予測される状態
  observationPoints: json("observationPoints"), // 観察ポイント
  recordSummary: text("recordSummary"), // 記録用サマリー
  fullReportText: text("fullReportText"), // レポート全文（Markdown）
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AssessmentReport = typeof assessmentReports.$inferSelect;
export type InsertAssessmentReport = typeof assessmentReports.$inferInsert;
