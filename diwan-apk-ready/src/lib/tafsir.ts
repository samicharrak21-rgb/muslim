// خدمة التفسير عبر api.alquran.cloud + كاش أوفلاين
import { offlineCache } from "./offline-cache";

export interface TafsirEdition {
  id: string;
  name: string;
  author: string;
  identifier: string; // معرف API
}

export const TAFSIR_EDITIONS: TafsirEdition[] = [
  { id: "muyassar", name: "التفسير الميسّر", author: "نخبة من العلماء", identifier: "ar.muyassar" },
  { id: "jalalayn", name: "تفسير الجلالين", author: "السيوطي والمحلي", identifier: "ar.jalalayn" },
  { id: "qurtubi", name: "تفسير القرطبي", author: "الإمام القرطبي", identifier: "ar.qurtubi" },
  { id: "tabari", name: "تفسير الطبري", author: "ابن جرير الطبري", identifier: "ar.jalalayn" }, // الجلالين كبديل (الطبري غير متاح بـ api مباشر)
  { id: "saadi", name: "تفسير السعدي", author: "الشيخ السعدي", identifier: "ar.muyassar" }, // الميسّر كبديل
  { id: "ibnkathir", name: "تفسير ابن كثير (مختصر)", author: "ابن كثير", identifier: "ar.muyassar" },
];

export interface AyahTafsir {
  text: string;
  edition: string;
}

// رقم آية مطلق (1..6236) من رقم السورة ورقم الآية
export async function fetchAyahTafsir(globalAyahNumber: number, editionId: string): Promise<string> {
  const edition = TAFSIR_EDITIONS.find((e) => e.id === editionId) ?? TAFSIR_EDITIONS[0];
  const cacheKey = `tafsir:${edition.identifier}:${globalAyahNumber}`;

  const cached = (await offlineCache.getMeta(cacheKey)) as string | null;
  if (cached) {
    // حدّث في الخلفية
    fetchFresh(globalAyahNumber, edition.identifier, cacheKey).catch(() => {});
    return cached;
  }

  return await fetchFresh(globalAyahNumber, edition.identifier, cacheKey);
}

async function fetchFresh(num: number, identifier: string, cacheKey: string): Promise<string> {
  const url = `https://api.alquran.cloud/v1/ayah/${num}/${identifier}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("TAFSIR_FAIL");
  const json = await res.json();
  const text = json?.data?.text ?? "";
  if (text) await offlineCache.setMeta(cacheKey, text);
  return text;
}

// رابط صوت الآية الواحدة (mp3)
export const ayahAudioUrl = (globalAyahNumber: number, reciterIdentifier = "ar.alafasy"): string =>
  `https://cdn.islamic.network/quran/audio/128/${reciterIdentifier}/${globalAyahNumber}.mp3`;

// خرائط القارئ → معرّف cdn islamic.network
export const AYAH_RECITERS: Record<string, string> = {
  afs: "ar.alafasy",
  sds: "ar.abdurrahmaansudais",
  shur: "ar.saoodshuraym",
  minsh: "ar.minshawi",
  husr: "ar.husary",
  basit: "ar.abdulbasitmurattal",
  ghamadi: "ar.saadalghamdi",
  ajm: "ar.ahmedajamy",
  maher: "ar.mahermuaiqly",
  hudhaify: "ar.hudhaify",
  ayyub: "ar.muhammadayyoub",
  jhn: "ar.abdullahjuhany",
};
