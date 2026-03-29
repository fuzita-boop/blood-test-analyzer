import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  bloodTestRecords,
  assessmentReports,
  InsertBloodTestRecord,
  InsertAssessmentReport,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ── Users ──────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ── Blood Test Records ─────────────────────────────────────────────────────

export async function createBloodTestRecord(data: InsertBloodTestRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(bloodTestRecords).values(data).$returningId();
  return result;
}

export async function getBloodTestRecordsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(bloodTestRecords)
    .where(eq(bloodTestRecords.userId, userId))
    .orderBy(desc(bloodTestRecords.createdAt));
}

export async function getBloodTestRecordById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(bloodTestRecords)
    .where(and(eq(bloodTestRecords.id, id), eq(bloodTestRecords.userId, userId)))
    .limit(1);
  return result[0];
}

export async function updateBloodTestRecord(id: number, data: Partial<InsertBloodTestRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bloodTestRecords).set(data).where(eq(bloodTestRecords.id, id));
}

// ── Assessment Reports ─────────────────────────────────────────────────────

export async function createAssessmentReport(data: InsertAssessmentReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(assessmentReports).values(data).$returningId();
  return result;
}

export async function getAssessmentReportByRecordId(bloodTestRecordId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(assessmentReports)
    .where(eq(assessmentReports.bloodTestRecordId, bloodTestRecordId))
    .limit(1);
  return result[0];
}

export async function getAssessmentReportsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(assessmentReports)
    .where(eq(assessmentReports.userId, userId))
    .orderBy(desc(assessmentReports.createdAt));
}

export async function getAssessmentReportById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(assessmentReports)
    .where(and(eq(assessmentReports.id, id), eq(assessmentReports.userId, userId)))
    .limit(1);
  return result[0];
}
