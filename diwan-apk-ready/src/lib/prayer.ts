// خدمة مواقيت الصلاة عبر Aladhan API — مع كاش أوفلاين
import { offlineCache, todayPrayerKey } from "./offline-cache";

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export interface PrayerData {
  timings: PrayerTimes;
  date: {
    readable: string;
    hijri: { date: string; month: { ar: string }; year: string; weekday: { ar: string } };
    gregorian: { date: string };
  };
  meta: { qibla?: number };
}

export async function fetchPrayerTimes(lat: number, lng: number): Promise<PrayerData> {
  const cacheKey = todayPrayerKey(lat, lng);

  // 1) جرّب الكاش أولاً سريعاً (للسرعة + الأوفلاين)
  const cached = (await offlineCache.getPrayer(cacheKey)) as PrayerData | null;

  // 2) جرّب الجلب من الإنترنت
  try {
    const date = new Date();
    const url = `https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${lat}&longitude=${lng}&method=4`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("فشل جلب المواقيت");
    const json = await res.json();
    await offlineCache.setPrayer(cacheKey, json.data);
    return json.data;
  } catch (err) {
    if (cached) return cached;
    // ابحث عن أحدث كاش لنفس الموقع كاحتياط
    throw err;
  }
}

export async function fetchQibla(lat: number, lng: number): Promise<number> {
  const key = `qibla_${lat.toFixed(2)}_${lng.toFixed(2)}`;
  try {
    const res = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`);
    const json = await res.json();
    await offlineCache.setMeta(key, json.data.direction);
    return json.data.direction;
  } catch {
    const cached = (await offlineCache.getMeta(key)) as number | null;
    if (cached != null) return cached;
    throw new Error("تعذّر جلب اتجاه القبلة");
  }
}

export const PRAYER_NAMES_AR: Record<keyof PrayerTimes, string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

export function getNextPrayer(timings: PrayerTimes): { name: keyof PrayerTimes; time: string; minutesLeft: number } | null {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const order: (keyof PrayerTimes)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  for (const name of order) {
    const [h, m] = timings[name].split(":").map(Number);
    const t = h * 60 + m;
    if (t > nowMin) return { name, time: timings[name], minutesLeft: t - nowMin };
  }
  // الفجر اليوم التالي
  const [h, m] = timings.Fajr.split(":").map(Number);
  return { name: "Fajr", time: timings.Fajr, minutesLeft: 24 * 60 - nowMin + h * 60 + m };
}
