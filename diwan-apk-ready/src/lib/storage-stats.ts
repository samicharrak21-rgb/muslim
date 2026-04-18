// أدوات قياس وحذف المحتوى المنزّل
import { quranStore } from "./quran-downloader";
import { offlineCache } from "./offline-cache";

export interface StorageStats {
  surahsDownloaded: number;
  tafsirDownloaded: number;
  audioFilesCount: number;
  prayerCacheCount: number;
  estimatedBytes: number;
  estimatedMB: number;
}

const estimateBytes = (count: number, avgKB: number) => count * avgKB * 1024;

export const getStorageStats = async (): Promise<StorageStats> => {
  const [surahs, tafsir, audioKeys] = await Promise.all([
    quranStore.surahsCount(),
    quranStore.tafsirCount(),
    offlineCache.listAudioKeys(),
  ]);

  // تقديرات تقريبية: سورة ~30KB، تفسير ~80KB، صوت سورة ~17MB
  const estimatedBytes =
    estimateBytes(surahs, 30) +
    estimateBytes(tafsir, 80) +
    audioKeys.length * 17 * 1024 * 1024;

  return {
    surahsDownloaded: surahs,
    tafsirDownloaded: tafsir,
    audioFilesCount: audioKeys.length,
    prayerCacheCount: 0,
    estimatedBytes,
    estimatedMB: Math.round(estimatedBytes / (1024 * 1024)),
  };
};

export const clearAllAudio = async (): Promise<number> => {
  const keys = await offlineCache.listAudioKeys();
  for (const k of keys) await offlineCache.deleteAudio(k);
  return keys.length;
};

export const clearAllQuranData = async (): Promise<void> => {
  // مسح قاعدة البيانات diwan_quran_full بالكامل
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase("diwan_quran_full");
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
};

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};
