// طبقة كاش IndexedDB للعمل بدون إنترنت
// يخزن: صفحات المصحف، التلاوات الصوتية (Blob)، أوقات الصلاة

const DB_NAME = "diwan_offline";
const DB_VERSION = 1;
const STORES = {
  pages: "quran_pages",      // صفحات المصحف (json)
  audio: "quran_audio",      // ملفات الصوت (Blob)
  prayer: "prayer_times",    // أوقات الصلاة (json)
  meta: "meta",              // بيانات تعريفية
} as const;

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

export const offlineCache = {
  // ============ صفحات المصحف ============
  async getPage(page: number): Promise<unknown | null> {
    try { return (await tx(STORES.pages, "readonly", (s) => s.get(page))) ?? null; }
    catch { return null; }
  },
  async setPage(page: number, data: unknown): Promise<void> {
    try { await tx(STORES.pages, "readwrite", (s) => s.put(data, page)); } catch { /* ignore */ }
  },
  async getPagesCount(): Promise<number> {
    try { return await tx(STORES.pages, "readonly", (s) => s.count()); }
    catch { return 0; }
  },
  async clearPages(): Promise<void> {
    try { await tx(STORES.pages, "readwrite", (s) => s.clear()); } catch { /* ignore */ }
  },

  // ============ التلاوات الصوتية ============
  async getAudio(key: string): Promise<Blob | null> {
    try { return (await tx<Blob>(STORES.audio, "readonly", (s) => s.get(key))) ?? null; }
    catch { return null; }
  },
  async setAudio(key: string, blob: Blob): Promise<void> {
    try { await tx(STORES.audio, "readwrite", (s) => s.put(blob, key)); } catch { /* ignore */ }
  },
  async deleteAudio(key: string): Promise<void> {
    try { await tx(STORES.audio, "readwrite", (s) => s.delete(key)); } catch { /* ignore */ }
  },
  async listAudioKeys(): Promise<string[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const t = db.transaction(STORES.audio, "readonly");
        const req = t.objectStore(STORES.audio).getAllKeys();
        req.onsuccess = () => resolve(req.result as string[]);
        req.onerror = () => resolve([]);
      });
    } catch { return []; }
  },

  // ============ أوقات الصلاة ============
  async getPrayer(key: string): Promise<unknown | null> {
    try { return (await tx(STORES.prayer, "readonly", (s) => s.get(key))) ?? null; }
    catch { return null; }
  },
  async setPrayer(key: string, data: unknown): Promise<void> {
    try { await tx(STORES.prayer, "readwrite", (s) => s.put(data, key)); } catch { /* ignore */ }
  },

  // ============ Meta ============
  async getMeta(key: string): Promise<unknown | null> {
    try { return (await tx(STORES.meta, "readonly", (s) => s.get(key))) ?? null; }
    catch { return null; }
  },
  async setMeta(key: string, data: unknown): Promise<void> {
    try { await tx(STORES.meta, "readwrite", (s) => s.put(data, key)); } catch { /* ignore */ }
  },
};

// مفتاح الصلاة لليوم
export const todayPrayerKey = (lat: number, lng: number): string => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}_${lat.toFixed(2)}_${lng.toFixed(2)}`;
};

// مفتاح صوت السورة
export const audioKey = (reciterId: string, surahNumber: number): string =>
  `${reciterId}:${String(surahNumber).padStart(3, "0")}`;

// تحويل blob إلى object URL آمن
export const blobToUrl = (blob: Blob): string => URL.createObjectURL(blob);
