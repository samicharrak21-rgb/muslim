import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Mic2, Type, Palette, Bell, BellOff, HardDrive, Trash2, Loader2,
  CheckCircle2, AlertCircle, Clock, Sun, Moon, Database, RefreshCw,
  Image as ImageIcon, Volume2, Play, BookOpen, CalendarDays, Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  loadSettings, saveSettings, COLOR_THEMES, ColorTheme, FontSize, AppSettings,
  BACKGROUND_STYLES, BackgroundStyle,
} from "@/lib/settings";
import { QURAN_RECITERS } from "@/lib/islamic-content";
import {
  getStorageStats, clearAllAudio, clearAllQuranData, formatBytes, StorageStats,
} from "@/lib/storage-stats";
import {
  refreshAllSchedules, requestNotificationPermissions,
} from "@/lib/notifications";
import { ADHAN_VOICES, getVoice } from "@/lib/adhan-voices";

const FONT_SIZES: { id: FontSize; label: string }[] = [
  { id: "sm", label: "صغير" },
  { id: "md", label: "متوسط" },
  { id: "lg", label: "كبير" },
  { id: "xl", label: "ضخم" },
];

const Settings = () => {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopPreview = () => {
    previewAudioRef.current?.pause();
    previewAudioRef.current = null;
    setPreviewing(false);
  };

  const previewAdhan = async (voiceId: string) => {
    stopPreview();
    const v = getVoice(voiceId);
    for (const src of v.sources) {
      try {
        const a = new Audio(src);
        a.onended = () => setPreviewing(false);
        a.onerror = () => {};
        await a.play();
        previewAudioRef.current = a;
        setPreviewing(true);
        return;
      } catch { /* جرّب التالي */ }
    }
    toast.error("تعذّر تشغيل المعاينة");
  };

  const refreshStats = async () => {
    setRefreshing(true);
    try { setStats(await getStorageStats()); }
    finally { setRefreshing(false); }
  };

  useEffect(() => { refreshStats(); }, []);

  // أيضاً ادفع reciterId الحالي إلى localStorage لاستخدامه في صفحة القرآن
  useEffect(() => {
    localStorage.setItem("diwan_reciter", settings.reciterId);
  }, [settings.reciterId]);

  const update = <K extends keyof AppSettings>(k: K, v: AppSettings[K]) => {
    const next = saveSettings({ [k]: v });
    setSettings(next);
  };

  const handleNotifToggle = async (key: keyof AppSettings, value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        toast.error("لم يتم منح إذن الإشعارات. فعّلها من إعدادات الجهاز.");
        return;
      }
    }
    update(key, value as never);
    const next = { ...settings, [key]: value };
    const r = await refreshAllSchedules({
      adhanNotifications: next.adhanNotifications,
      morningAdhkarNotif: next.morningAdhkarNotif,
      eveningAdhkarNotif: next.eveningAdhkarNotif,
      morningAdhkarTime: next.morningAdhkarTime,
      eveningAdhkarTime: next.eveningAdhkarTime,
    });
    if (!r.ok && r.message) toast.warning(r.message);
    else if (value && r.ok) toast.success("تم جدولة الإشعارات");
  };

  const rescheduleNow = async () => {
    const r = await refreshAllSchedules(settings);
    if (r.ok) toast.success("تم تحديث جدولة الإشعارات");
    else toast.error(r.message ?? "تعذّر التحديث");
  };

  const handleClearAudio = async () => {
    setClearing(true);
    try {
      const n = await clearAllAudio();
      toast.success(`تم حذف ${n} تلاوة`);
      await refreshStats();
    } finally { setClearing(false); }
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await clearAllAudio();
      await clearAllQuranData();
      toast.success("تم مسح كل المحتوى المنزّل");
      await refreshStats();
    } finally { setClearing(false); }
  };

  return (
    <PageShell title="الإعدادات" subtitle="خصّص تجربتك في الديوان">
      <div className="space-y-5">

        {/* ============ القارئ المفضل ============ */}
        <Section icon={Mic2} title="القارئ المفضل">
          <Select value={settings.reciterId} onValueChange={(v) => update("reciterId", v)}>
            <SelectTrigger className="bg-card/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QURAN_RECITERS.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground mt-2">
            سيُستخدم في تشغيل وتنزيل التلاوات في صفحة القرآن.
          </p>
        </Section>

        {/* ============ حجم الخط ============ */}
        <Section icon={Type} title="حجم الخط العام">
          <div className="grid grid-cols-4 gap-2">
            {FONT_SIZES.map((f) => (
              <button
                key={f.id}
                onClick={() => update("fontSize", f.id)}
                className={`py-2 rounded-lg border transition-all ${
                  settings.fontSize === f.id
                    ? "bg-primary/15 border-primary text-primary shadow-glow"
                    : "bg-card/40 border-border/40 hover:border-primary/40"
                }`}
              >
                <div className={`font-display ${
                  f.id === "sm" ? "text-xs" :
                  f.id === "md" ? "text-sm" :
                  f.id === "lg" ? "text-base" : "text-lg"
                }`}>أ</div>
                <div className="text-[10px] mt-0.5">{f.label}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* ============ اللون الأساسي ============ */}
        <Section icon={Palette} title="اللون الأساسي">
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(COLOR_THEMES) as [ColorTheme, typeof COLOR_THEMES.andalusi][]).map(([id, t]) => {
              const active = settings.colorTheme === id;
              return (
                <button
                  key={id}
                  onClick={() => update("colorTheme", id)}
                  className={`relative p-3 rounded-xl border-2 transition-all ${
                    active ? "border-primary shadow-glow" : "border-border/40 hover:border-primary/40"
                  }`}
                  style={{ background: `${t.preview}15` }}
                >
                  <div
                    className="w-10 h-10 mx-auto rounded-full mb-2 shadow-md"
                    style={{ background: t.preview }}
                  />
                  <div className="text-[11px] text-foreground/90">{t.name}</div>
                  {active && (
                    <CheckCircle2 className="absolute top-1 left-1 h-4 w-4 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* ============ خلفية التطبيق ============ */}
        <Section icon={ImageIcon} title="خلفية التطبيق">
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(BACKGROUND_STYLES) as [BackgroundStyle, typeof BACKGROUND_STYLES.andalusi][]).map(([id, b]) => {
              const active = settings.backgroundStyle === id;
              return (
                <button
                  key={id}
                  onClick={() => update("backgroundStyle", id)}
                  className={`relative rounded-xl border-2 overflow-hidden transition-all h-20 ${
                    active ? "border-primary shadow-glow" : "border-border/40 hover:border-primary/40"
                  }`}
                  style={{ background: b.preview }}
                >
                  <div className="absolute inset-x-0 bottom-0 bg-background/70 backdrop-blur-sm py-1">
                    <div className="text-[10px] text-foreground">{b.name}</div>
                  </div>
                  {active && (
                    <CheckCircle2 className="absolute top-1 left-1 h-4 w-4 text-primary drop-shadow" />
                  )}
                </button>
              );
            })}
          </div>
        </Section>


        {/* ============ صوت الأذان ============ */}
        <Section icon={Volume2} title="صوت الأذان">
          <div className="space-y-3">
            <Select value={settings.adhanVoice} onValueChange={(v) => update("adhanVoice", v as AppSettings["adhanVoice"])}>
              <SelectTrigger className="bg-card/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ADHAN_VOICES).map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">{getVoice(settings.adhanVoice).desc}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => previewing ? stopPreview() : previewAdhan(settings.adhanVoice)}
              className="w-full border-primary/40"
            >
              <Play className="h-3.5 w-3.5 ml-2" />
              {previewing ? "إيقاف المعاينة" : "استمع لمعاينة"}
            </Button>
          </div>
        </Section>

        {/* ============ تذكير مسبق قبل الأذان ============ */}
        <Section icon={Clock} title="تذكير قبل الصلاة">
          <Select
            value={String(settings.adhanReminderMinutes)}
            onValueChange={(v) => update("adhanReminderMinutes", Number(v) as AppSettings["adhanReminderMinutes"])}
          >
            <SelectTrigger className="bg-card/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">بدون تذكير مسبق</SelectItem>
              <SelectItem value="5">قبل 5 دقائق</SelectItem>
              <SelectItem value="10">قبل 10 دقائق</SelectItem>
              <SelectItem value="15">قبل 15 دقيقة</SelectItem>
              <SelectItem value="30">قبل 30 دقيقة</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground mt-2">
            يصلك إشعار قبل كل صلاة لتستعد وتتوضأ
          </p>
        </Section>

        <Section icon={Bell} title="الإشعارات والتذكيرات">
          <div className="space-y-3">
            <ToggleRow
              icon={Bell}
              title="إشعارات الأذان"
              desc="تذكير عند موعد كل صلاة"
              checked={settings.adhanNotifications}
              onChange={(v) => handleNotifToggle("adhanNotifications", v)}
            />

            <ToggleRow
              icon={Sun}
              title="تذكير أذكار الصباح"
              desc={`يومياً عند الساعة ${settings.morningAdhkarTime}`}
              checked={settings.morningAdhkarNotif}
              onChange={(v) => handleNotifToggle("morningAdhkarNotif", v)}
            />
            {settings.morningAdhkarNotif && (
              <TimeInput
                value={settings.morningAdhkarTime}
                onChange={async (v) => {
                  update("morningAdhkarTime", v);
                  await refreshAllSchedules({ ...settings, morningAdhkarTime: v });
                }}
              />
            )}

            <ToggleRow
              icon={Moon}
              title="تذكير أذكار المساء"
              desc={`يومياً عند الساعة ${settings.eveningAdhkarTime}`}
              checked={settings.eveningAdhkarNotif}
              onChange={(v) => handleNotifToggle("eveningAdhkarNotif", v)}
            />
            {settings.eveningAdhkarNotif && (
              <TimeInput
                value={settings.eveningAdhkarTime}
                onChange={async (v) => {
                  update("eveningAdhkarTime", v);
                  await refreshAllSchedules({ ...settings, eveningAdhkarTime: v });
                }}
              />
            )}

            <div className="h-px bg-border/40 my-2" />

            <ToggleRow
              icon={BookOpen}
              title="آية اليوم"
              desc={`يومياً عند الساعة ${settings.dailyAyahTime}`}
              checked={settings.dailyAyahNotif}
              onChange={(v) => handleNotifToggle("dailyAyahNotif", v)}
            />
            {settings.dailyAyahNotif && (
              <TimeInput
                value={settings.dailyAyahTime}
                onChange={async (v) => {
                  update("dailyAyahTime", v);
                  await refreshAllSchedules({ ...settings, dailyAyahTime: v });
                }}
              />
            )}

            <ToggleRow
              icon={Sparkles}
              title="حديث الأسبوع"
              desc="كل يوم جمعة الساعة 9 صباحاً"
              checked={settings.weeklyHadithNotif}
              onChange={(v) => handleNotifToggle("weeklyHadithNotif", v)}
            />

            <ToggleRow
              icon={CalendarDays}
              title="تذكير الجمعة"
              desc="كل خميس مساءً للاستعداد للجمعة"
              checked={settings.fridayReminder}
              onChange={(v) => handleNotifToggle("fridayReminder", v)}
            />

            <ToggleRow
              icon={Moon}
              title="قيام الليل"
              desc="تذكير في الثلث الأخير 3:00 ص"
              checked={settings.qiyamReminder}
              onChange={(v) => handleNotifToggle("qiyamReminder", v)}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={rescheduleNow}
              className="w-full border-primary/40"
            >
              <RefreshCw className="h-3.5 w-3.5 ml-2" />
              إعادة جدولة الإشعارات الآن
            </Button>

            <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
              <AlertCircle className="h-3 w-3" />
              الإشعارات تعمل فقط داخل تطبيق الموبايل بعد التثبيت
            </p>
          </div>
        </Section>

        {/* ============ التخزين ============ */}
        <Section icon={HardDrive} title="إدارة المحتوى المنزّل">
          {!stats ? (
            <div className="py-6 flex items-center justify-center text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 ml-2 animate-spin" /> جارٍ القياس...
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <StatBox label="سور القرآن" value={`${stats.surahsDownloaded} / 114`} />
                <StatBox label="التفسير" value={`${stats.tafsirDownloaded} / 114`} />
                <StatBox label="التلاوات الصوتية" value={`${stats.audioFilesCount}`} />
                <StatBox label="المساحة المستخدمة" value={formatBytes(stats.estimatedBytes)} highlight />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshStats}
                  disabled={refreshing}
                >
                  {refreshing ? <Loader2 className="h-3.5 w-3.5 ml-2 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 ml-2" />}
                  تحديث الإحصائيات
                </Button>

                <ConfirmAction
                  trigger={
                    <Button variant="outline" size="sm" disabled={clearing || stats.audioFilesCount === 0}>
                      <Trash2 className="h-3.5 w-3.5 ml-2" />
                      حذف كل التلاوات الصوتية ({stats.audioFilesCount})
                    </Button>
                  }
                  title="حذف التلاوات الصوتية؟"
                  desc="سيُحذف كل ملف صوت منزّل. يمكنك إعادة تنزيله لاحقاً."
                  onConfirm={handleClearAudio}
                />

                <ConfirmAction
                  trigger={
                    <Button variant="destructive" size="sm" disabled={clearing}>
                      <Database className="h-3.5 w-3.5 ml-2" />
                      مسح كل المحتوى المنزّل (تصفير)
                    </Button>
                  }
                  title="تصفير المحتوى بالكامل؟"
                  desc="سيُحذف القرآن، التفسير، وكل التلاوات. سيُعاد تنزيلها تلقائياً عند فتح التطبيق."
                  onConfirm={handleClearAll}
                  destructive
                />
              </div>
            </div>
          )}
        </Section>

      </div>
    </PageShell>
  );
};

// ===================== مكونات مساعدة =====================

const Section = ({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="ornament-border rounded-2xl bg-card/50 p-4"
  >
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-primary" />
      <h3 className="font-display text-sm gold-text">{title}</h3>
    </div>
    {children}
  </motion.section>
);

const ToggleRow = ({ icon: Icon, title, desc, checked, onChange }: {
  icon: React.ElementType; title: string; desc: string;
  checked: boolean; onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
    <Icon className={`h-4 w-4 shrink-0 ${checked ? "text-primary" : "text-muted-foreground"}`} />
    <div className="flex-1 min-w-0">
      <div className="text-sm text-foreground">{title}</div>
      <div className="text-[10px] text-muted-foreground">{desc}</div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const TimeInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="flex items-center gap-2 pr-7 pl-2">
    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
    <Input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-sm bg-card/50 max-w-[140px]"
    />
  </div>
);

const StatBox = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`rounded-lg p-3 text-center border ${
    highlight ? "bg-gradient-gold/15 border-primary/40" : "bg-muted/30 border-border/40"
  }`}>
    <div className="text-[10px] text-muted-foreground mb-1">{label}</div>
    <div className={`font-display text-sm ${highlight ? "gold-text" : "text-foreground"}`}>{value}</div>
  </div>
);

const ConfirmAction = ({ trigger, title, desc, onConfirm, destructive }: {
  trigger: React.ReactNode; title: string; desc: string;
  onConfirm: () => void | Promise<void>; destructive?: boolean;
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="gold-text font-display text-right">{title}</AlertDialogTitle>
        <AlertDialogDescription className="text-right">{desc}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="flex-row-reverse">
        <AlertDialogAction
          onClick={onConfirm}
          className={destructive ? "bg-destructive hover:bg-destructive/90" : ""}
        >
          تأكيد
        </AlertDialogAction>
        <AlertDialogCancel>إلغاء</AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default Settings;
