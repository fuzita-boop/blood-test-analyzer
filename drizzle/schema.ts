import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
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

// 採血記録テーブル（画像URLは保存しない・患者紐付けなし）
export const bloodTestRecords = mysqlTable("blood_test_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
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

// アセスメントレポートテーブル（患者紐付けなし）
export const assessmentReports = mysqlTable("assessment_reports", {
  id: int("id").autoincrement().primaryKey(),
  bloodTestRecordId: int("bloodTestRecordId").notNull(),
  userId: int("userId").notNull(),
  abnormalValues: json("abnormalValues"),
  predictedConditions: json("predictedConditions"),
  observationPoints: json("observationPoints"),
  recordSummary: text("recordSummary"),
  fullReportText: text("fullReportText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AssessmentReport = typeof assessmentReports.$inferSelect;
export type InsertAssessmentReport = typeof assessmentReports.$inferInsert;
