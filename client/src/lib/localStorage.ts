import type { LocalBloodTestRecord, LocalSettings } from "./localTypes";

const DB_NAME = "blood-test-analyzer-local";
const DB_VERSION = 1;
const RECORDS_STORE = "records";
const SETTINGS_STORE = "settings";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("端末内データベースを開けませんでした"));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECORDS_STORE)) {
        const records = db.createObjectStore(RECORDS_STORE, { keyPath: "id" });
        records.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function transact<T>(storeName: string, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDatabase().then((db) => new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = run(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("端末内データの操作に失敗しました"));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error ?? new Error("端末内データの操作に失敗しました"));
    };
  }));
}

export async function saveRecord(record: LocalBloodTestRecord) {
  await transact(RECORDS_STORE, "readwrite", (store) => store.put(record));
}

export async function getRecord(id: string): Promise<LocalBloodTestRecord | undefined> {
  return transact(RECORDS_STORE, "readonly", (store) => store.get(id));
}

export async function getRecords(): Promise<LocalBloodTestRecord[]> {
  const records = await transact(RECORDS_STORE, "readonly", (store) => store.getAll());
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function deleteRecord(id: string) {
  await transact(RECORDS_STORE, "readwrite", (store) => store.delete(id));
}

export async function clearRecords() {
  await transact(RECORDS_STORE, "readwrite", (store) => store.clear());
}

export async function getSettings(): Promise<LocalSettings> {
  const result = await transact<{ key: string; value: LocalSettings } | undefined>(
    SETTINGS_STORE,
    "readonly",
    (store) => store.get("settings")
  );
  return result?.value ?? { version: 1, ocrLanguageReady: false };
}

export async function saveSettings(settings: LocalSettings) {
  await transact(SETTINGS_STORE, "readwrite", (store) => store.put({ key: "settings", value: settings }));
}

export async function exportLocalData() {
  const records = await getRecords();
  return {
    schema: "blood-test-analyzer-local-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    records,
  };
}

export async function importLocalData(payload: unknown): Promise<number> {
  if (!payload || typeof payload !== "object") throw new Error("バックアップ形式が正しくありません");
  const candidate = payload as { schema?: string; version?: number; records?: unknown };
  if (candidate.schema !== "blood-test-analyzer-local-backup" || candidate.version !== 1 || !Array.isArray(candidate.records)) {
    throw new Error("対応していないバックアップ形式です");
  }
  const validRecords = candidate.records.filter((record): record is LocalBloodTestRecord => {
    return Boolean(record && typeof record === "object" && "id" in record && "report" in record);
  });
  await Promise.all(validRecords.map((record) => saveRecord(record)));
  return validRecords.length;
}
