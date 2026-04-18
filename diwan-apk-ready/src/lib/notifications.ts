// نظام إشعارات الأذان والأذكار عبر Capacitor LocalNotifications
import { fetchPrayerTimes, PRAYER_NAMES_AR, PrayerTimes } from "./prayer";
import { storage } from "./storage";
import { ARAB_CITIES } from "./cities";
import { getDailyAyah, getWeeklyHadith } from "./daily-content";

const PRAYER_NOTIF_BASE = 1000;     // 1001..1006
const PRE_PRAYER_BASE = 1100;       // 1101..1106 (تذكير مسبق)
const MORNING_NOTIF_ID = 2001;
const EVENING_NOTIF_ID = 2002;
const DAILY_AYAH_ID = 3001;
const WEEKLY_HADITH_ID = 3002;
const FRIDAY_ID = 3003;
const QIYAM_ID = 3004;

const isNative = async (): Promise<boolean> => {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!(await isNative())) {
    if (typeof Notification !== "undefined") {
      const result = await Notification.requestPermission();
      return result === "granted";
    }
    return false;
  }
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const r = await LocalNotifications.requestPermissions();
    return r.display === "granted";
  } catch {
    return false;
  }
};

export const cancelAllScheduled = async (): Promise<void> => {
  if (!(await isNative())) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }
  } catch { /* ignore */ }
};

const PRAYER_ORDER: (keyof PrayerTimes)[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

// جدولة إشعارات الصلوات + التذكير المسبق
export const schedulePrayerNotifications = async (
  timings: PrayerTimes,
  reminderMinutes: number = 0,
): Promise<void> => {
  if (!(await isNative())) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const today = new Date();

    const main = PRAYER_ORDER.map((name, i) => {
      const [h, m] = timings[name].split(":").map(Number);
      const at = new Date(today);
      at.setHours(h, m, 0, 0);
      if (at.getTime() <= Date.now()) at.setDate(at.getDate() + 1);
      return {
        id: PRAYER_NOTIF_BASE + i + 1,
        title: `حان الآن وقت صلاة ${PRAYER_NAMES_AR[name]}`,
        body: "حيّ على الصلاة • حيّ على الفلاح",
        schedule: { at, allowWhileIdle: true, repeats: true, every: "day" as const },
        smallIcon: "ic_stat_icon_config_sample",
        channelId: "diwan_adhan",
      };
    });

    const reminders = reminderMinutes > 0
      ? PRAYER_ORDER.map((name, i) => {
          const [h, m] = timings[name].split(":").map(Number);
          const at = new Date(today);
          at.setHours(h, m, 0, 0);
          at.setMinutes(at.getMinutes() - reminderMinutes);
          if (at.getTime() <= Date.now()) at.setDate(at.getDate() + 1);
          return {
            id: PRE_PRAYER_BASE + i + 1,
            title: `بقي ${reminderMinutes} دقيقة على صلاة ${PRAYER_NAMES_AR[name]} 🕌`,
            body: "استعد للصلاة وتوضأ",
            schedule: { at, allowWhileIdle: true, repeats: true, every: "day" as const },
            smallIcon: "ic_stat_icon_config_sample",
            channelId: "diwan_adhan",
          };
        })
      : [];

    await LocalNotifications.schedule({ notifications: [...main, ...reminders] });
  } catch { /* ignore */ }
};

export const scheduleAdhkarReminder = async (
  type: "morning" | "evening",
  time: string,
): Promise<void> => {
  if (!(await isNative())) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const [h, m] = time.split(":").map(Number);
    const at = new Date();
    at.setHours(h, m, 0, 0);
    if (at.getTime() <= Date.now()) at.setDate(at.getDate() + 1);

    await LocalNotifications.schedule({
      notifications: [{
        id: type === "morning" ? MORNING_NOTIF_ID : EVENING_NOTIF_ID,
        title: type === "morning" ? "أذكار الصباح 🌅" : "أذكار المساء 🌙",
        body: type === "morning"
          ? "ابدأ يومك بذكر الله — اضغط لقراءة الأذكار"
          : "اختم يومك بذكر الله — اضغط لقراءة الأذكار",
        schedule: { at, allowWhileIdle: true, repeats: true, every: "day" as const },
        smallIcon: "ic_stat_icon_config_sample",
        channelId: "diwan_adhkar",
      }],
    });
  } catch { /* ignore */ }
};

export const scheduleDailyAyah = async (time: string) => {
  if (!(await isNative())) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const [h, m] = time.split(":").map(Number);
    const at = new Date();
    at.setHours(h, m, 0, 0);
    if (at.getTime() <= Date.now()) at.setDate(at.getDate() + 1);
    const ayah = getDailyAyah(at);
    await LocalNotifications.schedule({
      notifications: [{
        id: DAILY_AYAH_ID,
        title: "آية اليوم 📖",
        body: `${ayah.text} — [${ayah.surah}]`,
        schedule: { at, allowWhileIdle: true, repeats: true, every: "day" as const },
        smallIcon: "ic_stat_icon_config_sample",
        channelId: "diwan_daily",
      }],
    });
  } catch { /* ignore */ }
};

export const scheduleWeeklyHadith = async () => {
  if (!(await isNative())) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    // كل جمعة 9 صباحاً
    const at = new Date();
    const daysUntilFriday = (5 - at.getDay() + 7) % 7 || 7;
    at.setDate(at.getDate() + daysUntilFriday);
    at.setHours(9, 0, 0, 0);
    const h = getWeeklyHadith(at);
    await LocalNotifications.schedule({
      notifications: [{
        id: WEEKLY_HADITH_ID,
        title: "حديث الأسبوع 🌿",
        body: `«${h.text}» — ${h.source}`,
        schedule: { at, allowWhileIdle: true, repeats: true, every: "week" as const },
        smallIcon: "ic_stat_icon_config_sample",
        channelId: "diwan_daily",
      }],
    });
  } catch { /* ignore */ }
};

export const scheduleFridayReminder = async () => {
  if (!(await isNative())) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    // الخميس 8 مساءً
    const at = new Date();
    const daysUntilThursday = (4 - at.getDay() + 7) % 7 || 7;
    at.setDate(at.getDate() + daysUntilThursday);
    at.setHours(20, 0, 0, 0);
    await LocalNotifications.schedule({
      notifications: [{
        id: FRIDAY_ID,
        title: "غداً الجمعة 🕌",
        body: "استعد لصلاة الجمعة • اقرأ سورة الكهف",
        schedule: { at, allowWhileIdle: true, repeats: true, every: "week" as const },
        smallIcon: "ic_stat_icon_config_sample",
        channelId: "diwan_daily",
      }],
    });
  } catch { /* ignore */ }
};

export const scheduleQiyamReminder = async () => {
  if (!(await isNative())) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    // الثلث الأخير من الليل تقريباً 3:00 ص
    const at = new Date();
    at.setDate(at.getDate() + 1);
    at.setHours(3, 0, 0, 0);
    await LocalNotifications.schedule({
      notifications: [{
        id: QIYAM_ID,
        title: "قيام الليل 🌙",
        body: "هذا هو الثلث الأخير — وقت إجابة الدعاء",
        schedule: { at, allowWhileIdle: true, repeats: true, every: "day" as const },
        smallIcon: "ic_stat_icon_config_sample",
        channelId: "diwan_daily",
      }],
    });
  } catch { /* ignore */ }
};

export const cancelPrayerNotifications = async () => {
  if (!(await isNative())) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({
      notifications: [
        ...PRAYER_ORDER.map((_, i) => ({ id: PRAYER_NOTIF_BASE + i + 1 })),
        ...PRAYER_ORDER.map((_, i) => ({ id: PRE_PRAYER_BASE + i + 1 })),
      ],
    });
  } catch { /* ignore */ }
};

export const cancelAdhkarReminder = async (type: "morning" | "evening") => {
  if (!(await isNative())) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({
      notifications: [{ id: type === "morning" ? MORNING_NOTIF_ID : EVENING_NOTIF_ID }],
    });
  } catch { /* ignore */ }
};

// إعادة جدولة كاملة
export const refreshAllSchedules = async (settings: {
  adhanNotifications: boolean;
  adhanReminderMinutes?: number;
  morningAdhkarNotif: boolean;
  eveningAdhkarNotif: boolean;
  morningAdhkarTime: string;
  eveningAdhkarTime: string;
  dailyAyahNotif?: boolean;
  dailyAyahTime?: string;
  weeklyHadithNotif?: boolean;
  fridayReminder?: boolean;
  qiyamReminder?: boolean;
}): Promise<{ ok: boolean; message?: string }> => {
  if (!(await isNative())) {
    return { ok: false, message: "الإشعارات تعمل فقط داخل تطبيق الموبايل" };
  }
  const granted = await requestNotificationPermissions();
  if (!granted) return { ok: false, message: "لم يتم منح إذن الإشعارات" };

  await cancelAllScheduled();

  if (settings.adhanNotifications) {
    const city = storage.get("city", ARAB_CITIES[0]);
    try {
      const data = await fetchPrayerTimes(city.lat, city.lng);
      await schedulePrayerNotifications(data.timings, settings.adhanReminderMinutes ?? 0);
    } catch { /* ignore */ }
  }
  if (settings.morningAdhkarNotif) await scheduleAdhkarReminder("morning", settings.morningAdhkarTime);
  if (settings.eveningAdhkarNotif) await scheduleAdhkarReminder("evening", settings.eveningAdhkarTime);
  if (settings.dailyAyahNotif && settings.dailyAyahTime) await scheduleDailyAyah(settings.dailyAyahTime);
  if (settings.weeklyHadithNotif) await scheduleWeeklyHadith();
  if (settings.fridayReminder) await scheduleFridayReminder();
  if (settings.qiyamReminder) await scheduleQiyamReminder();

  return { ok: true };
};

export const isNotificationsSupported = isNative;
