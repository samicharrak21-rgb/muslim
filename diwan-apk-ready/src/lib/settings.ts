// نظام الإعدادات الشاملة + الثيمات اللونية
import { storage } from "./storage";

export type ColorTheme = "andalusi" | "emerald" | "royal" | "rose" | "ocean" | "sunset";
export type FontSize = "sm" | "md" | "lg" | "xl";
export type BackgroundStyle = "andalusi" | "stars" | "geometric" | "plain" | "mosque" | "desert";

export interface AppSettings {
  reciterId: string;
  fontSize: FontSize;
  colorTheme: ColorTheme;
  backgroundStyle: BackgroundStyle;
  // الأذان
  adhanVoice: "mishary" | "abdulbasit" | "makkah" | "madinah";
  adhanReminderMinutes: 0 | 5 | 10 | 15 | 30; // تذكير قبل الصلاة
  adhanNotifications: boolean;
  // الأذكار
  morningAdhkarNotif: boolean;
  eveningAdhkarNotif: boolean;
  morningAdhkarTime: string; // HH:mm
  eveningAdhkarTime: string; // HH:mm
  // إشعارات إضافية
  dailyAyahNotif: boolean;
  dailyAyahTime: string; // HH:mm
  weeklyHadithNotif: boolean; // كل جمعة
  fridayReminder: boolean;
  qiyamReminder: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  reciterId: "afs",
  fontSize: "md",
  colorTheme: "andalusi",
  backgroundStyle: "andalusi",
  adhanVoice: "mishary",
  adhanReminderMinutes: 10,
  adhanNotifications: true,
  morningAdhkarNotif: false,
  eveningAdhkarNotif: false,
  morningAdhkarTime: "06:30",
  eveningAdhkarTime: "17:30",
  dailyAyahNotif: false,
  dailyAyahTime: "07:00",
  weeklyHadithNotif: false,
  fridayReminder: false,
  qiyamReminder: false,
};

export const BACKGROUND_STYLES: Record<BackgroundStyle, { name: string; preview: string }> = {
  andalusi:  { name: "النقش الأندلسي", preview: "linear-gradient(135deg,#d4a23c33,#1a1f3d)" },
  stars:     { name: "نجوم الليل",      preview: "radial-gradient(circle at 30% 30%,#fff3,transparent 50%),#0a0e27" },
  geometric: { name: "الهندسي الإسلامي", preview: "linear-gradient(45deg,#1fb88a33,#0a0e27)" },
  plain:     { name: "سادة فاخر",        preview: "linear-gradient(180deg,#0f1530,#0a0e27)" },
  mosque:    { name: "صورة المسجد",      preview: "linear-gradient(135deg,#9d6ad133,#0a0e27)" },
  desert:    { name: "كثبان الصحراء",    preview: "linear-gradient(135deg,#e07a3a55,#0a0e27)" },
};

// لوحات الألوان — كل لوحة تعرّف القيم الأساسية فقط
export const COLOR_THEMES: Record<ColorTheme, {
  name: string;
  primary: string;       // HSL
  primaryGlow: string;
  background: string;
  secondary: string;
  accent: string;
  preview: string;       // hex للمعاينة فقط
}> = {
  andalusi: {
    name: "الأندلسي الذهبي",
    primary: "42 78% 56%",
    primaryGlow: "45 95% 68%",
    background: "222 50% 6%",
    secondary: "158 50% 24%",
    accent: "12 70% 48%",
    preview: "#d4a23c",
  },
  emerald: {
    name: "الزمردي الإسلامي",
    primary: "158 65% 45%",
    primaryGlow: "165 80% 60%",
    background: "180 30% 6%",
    secondary: "42 70% 50%",
    accent: "200 60% 45%",
    preview: "#1fb88a",
  },
  royal: {
    name: "الملكي الأرجواني",
    primary: "270 65% 60%",
    primaryGlow: "280 80% 72%",
    background: "260 40% 7%",
    secondary: "200 60% 45%",
    accent: "330 65% 55%",
    preview: "#9d6ad1",
  },
  rose: {
    name: "الوردي الكلاسيكي",
    primary: "350 70% 55%",
    primaryGlow: "345 85% 70%",
    background: "350 30% 7%",
    secondary: "30 60% 50%",
    accent: "270 50% 55%",
    preview: "#d94767",
  },
  ocean: {
    name: "أزرق المحيط",
    primary: "200 75% 55%",
    primaryGlow: "195 85% 65%",
    background: "210 50% 7%",
    secondary: "180 50% 35%",
    accent: "30 70% 55%",
    preview: "#3aa6db",
  },
  sunset: {
    name: "غروب الصحراء",
    primary: "20 80% 55%",
    primaryGlow: "30 90% 65%",
    background: "15 35% 7%",
    secondary: "0 60% 50%",
    accent: "45 75% 55%",
    preview: "#e07a3a",
  },
};

const KEY = "app_settings_v2";

export const loadSettings = (): AppSettings => ({
  ...DEFAULT_SETTINGS,
  ...storage.get<Partial<AppSettings>>(KEY, {}),
});

export const saveSettings = (s: Partial<AppSettings>) => {
  const merged = { ...loadSettings(), ...s };
  storage.set(KEY, merged);
  applyTheme(merged.colorTheme);
  applyFontSize(merged.fontSize);
  applyBackground(merged.backgroundStyle);
  return merged;
};

export const applyBackground = (bg: BackgroundStyle) => {
  document.documentElement.dataset.bg = bg;
};

// ============== تطبيق الثيم على :root ==============
export const applyTheme = (themeId: ColorTheme) => {
  const t = COLOR_THEMES[themeId] ?? COLOR_THEMES.andalusi;
  const root = document.documentElement;
  root.style.setProperty("--primary", t.primary);
  root.style.setProperty("--primary-glow", t.primaryGlow);
  root.style.setProperty("--ring", t.primary);
  root.style.setProperty("--secondary", t.secondary);
  root.style.setProperty("--accent", t.accent);
  // تحديث meta theme-color للحالة بار
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    const [h, s, l] = t.background.split(" ");
    meta.setAttribute("content", `hsl(${h}, ${s}, ${l})`);
  }
};

const FONT_SIZE_MAP: Record<FontSize, string> = {
  sm: "0.9",
  md: "1",
  lg: "1.15",
  xl: "1.3",
};

export const applyFontSize = (size: FontSize) => {
  document.documentElement.style.setProperty("--app-font-scale", FONT_SIZE_MAP[size] ?? "1");
};

// ============== تطبيق فوري عند بدء التشغيل ==============
export const initSettings = () => {
  const s = loadSettings();
  applyTheme(s.colorTheme);
  applyFontSize(s.fontSize);
  applyBackground(s.backgroundStyle);
  return s;
};
