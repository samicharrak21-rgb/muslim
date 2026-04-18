// نظام تحميل القرآن الكريم كاملاً + التفسير + الترجمة للعمل أوفلاين
// يخزن في IndexedDB حتى لا تشغل المساحة من localStorage
import { offlineCache } from "./offline-cache";

const DB_NAME = "diwan_quran_full";
const DB_VERSION = 1;
const STORES = {
  surahs: "surahs",       // كل سورة كاملة (نص عثماني + إملائي)
  tafsir: "tafsir",       // التفسير الميسر
  meta: "meta",           // حالة التحميل
} as const;

export interface DownloadProgress {
  total: number;
  done: number;
  current: string;
  phase: "quran" | "tafsir" | "complete" | "error" | "idle";
  error?: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;
const openDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      Object.values(STORES).forEach((s) => {
        if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
};

const tx = async <T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  ayahs: { number: number; numberInSurah: number; text: string; juz: number; page: number }[];
}

export interface TafsirData {
  surah: number;
  ayahs: { numberInSurah: number; text: string }[];
}

export const quranStore = {
  async getSurah(num: number): Promise<SurahData | null> {
    try { return (await tx<SurahData>(STORES.surahs, "readonly", (s) => s.get(num))) ?? null; }
    catch { return null; }
  },
  async setSurah(num: number, data: SurahData): Promise<void> {
    try { await tx(STORES.surahs, "readwrite", (s) => s.put(data, num)); } catch { /* ignore */ }
  },
  async getTafsir(num: number): Promise<TafsirData | null> {
    try { return (await tx<TafsirData>(STORES.tafsir, "readonly", (s) => s.get(num))) ?? null; }
    catch { return null; }
  },
  async setTafsir(num: number, data: TafsirData): Promise<void> {
    try { await tx(STORES.tafsir, "readwrite", (s) => s.put(data, num)); } catch { /* ignore */ }
  },
  async surahsCount(): Promise<number> {
    try { return await tx<number>(STORES.surahs, "readonly", (s) => s.count()); }
    catch { return 0; }
  },
  async tafsirCount(): Promise<number> {
    try { return await tx<number>(STORES.tafsir, "readonly", (s) => s.count()); }
    catch { return 0; }
  },
  async setMeta(key: string, value: unknown): Promise<void> {
    try { await tx(STORES.meta, "readwrite", (s) => s.put(value, key)); } catch { /* ignore */ }
  },
  async getMeta<T>(key: string): Promise<T | null> {
    try { return (await tx<T>(STORES.meta, "readonly", (s) => s.get(key))) ?? null; }
    catch { return null; }
  },
};

const QURAN_API = "https://api.alquran.cloud/v1";

const fetchWithRetry = async (url: string, retries = 3): Promise<Response> => {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) { lastErr = e; }
    await new Promise((r) => setTimeout(r, 800 * (i + 1)));
  }
  throw lastErr;
};

// تنزيل القرآن كاملاً (114 سورة) + التفسير الميسر
export const downloadFullQuran = async (
  onProgress: (p: DownloadProgress) => void,
  signal?: AbortSignal
): Promise<void> => {
  const TOTAL = 114 * 2; // قرآن + تفسير
  let done = 0;
  const update = (phase: DownloadProgress["phase"], current: string) =>
    onProgress({ total: TOTAL, done, current, phase });

  try {
    update("quran", "بدء تنزيل القرآن الكريم...");

    // 1) القرآن الكريم — النص العثماني (quran-uthmani)
    for (let i = 1; i <= 114; i++) {
      if (signal?.aborted) throw new Error("ألغي التنزيل");
      const cached = await quranStore.getSurah(i);
      if (!cached) {
        const res = await fetchWithRetry(`${QURAN_API}/surah/${i}/quran-uthmani`);
        const json = await res.json();
        const d = json.data;
        await quranStore.setSurah(i, {
          number: d.number,
          name: d.name,
          englishName: d.englishName,
          ayahs: d.ayahs.map((a: any) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
            juz: a.juz,
            page: a.page,
          })),
        });
      }
      done++;
      update("quran", `سورة ${i} من 114`);
    }

    // 2) التفسير الميسر
    update("tafsir", "بدء تنزيل التفسير...");
    for (let i = 1; i <= 114; i++) {
      if (signal?.aborted) throw new Error("ألغي التنزيل");
      const cached = await quranStore.getTafsir(i);
      if (!cached) {
        const res = await fetchWithRetry(`${QURAN_API}/surah/${i}/ar.muyassar`);
        const json = await res.json();
        const d = json.data;
        await quranStore.setTafsir(i, {
          surah: d.number,
          ayahs: d.ayahs.map((a: any) => ({
            numberInSurah: a.numberInSurah,
            text: a.text,
          })),
        });
      }
      done++;
      update("tafsir", `تفسير سورة ${i} من 114`);
    }

    await quranStore.setMeta("complete", true);
    await quranStore.setMeta("downloadedAt", new Date().toISOString());
    onProgress({ total: TOTAL, done: TOTAL, current: "اكتمل التنزيل بنجاح!", phase: "complete" });
  } catch (err: any) {
    onProgress({
      total: TOTAL,
      done,
      current: "حدث خطأ",
      phase: "error",
      error: err?.message ?? String(err),
    });
    throw err;
  }
};

export const isQuranDownloaded = async (): Promise<boolean> => {
  const complete = await quranStore.getMeta<boolean>("complete");
  if (complete) return true;
  const c = await quranStore.surahsCount();
  return c >= 114;
};

export const getDownloadStats = async () => {
  const surahs = await quranStore.surahsCount();
  const tafsir = await quranStore.tafsirCount();
  const downloadedAt = await quranStore.getMeta<string>("downloadedAt");
  return { surahs, tafsir, downloadedAt };
};

// تصدير بسيط لعمل warm-up لـ offlineCache (الصفحات قد تستخدم في Quran.tsx)
export { offlineCache };
