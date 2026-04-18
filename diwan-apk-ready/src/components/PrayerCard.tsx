import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Volume2, VolumeX, Search, Play, Square, Locate, Loader2 } from "lucide-react";
import { storage } from "@/lib/storage";
import { ARAB_CITIES, City } from "@/lib/cities";
import { fetchPrayerTimes, getNextPrayer, PRAYER_NAMES_AR, PrayerData } from "@/lib/prayer";
import { detectAndSaveCity } from "@/lib/geolocation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

import { ADHAN_VOICES, getVoice } from "@/lib/adhan-voices";
import { loadSettings } from "@/lib/settings";

export const PrayerCard = () => {
  const [city, setCity] = useState<City>(() => storage.get("city", ARAB_CITIES[0]));
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adhanOn, setAdhanOn] = useState(() => storage.get("adhanOn", true));
  const [now, setNow] = useState(new Date());
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [locating, setLocating] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const detectLocation = async () => {
    setLocating(true);
    try {
      const c = await detectAndSaveCity();
      if (c) {
        setCity(c);
        toast.success(`تم تحديد موقعك: ${c.name}`);
      } else {
        toast.error("تعذّر تحديد الموقع. تأكد من تفعيل أذونات الموقع.");
      }
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPrayerTimes(city.lat, city.lng)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    storage.set("city", city);
  }, [city]);

  useEffect(() => storage.set("adhanOn", adhanOn), [adhanOn]);

  // تشغيل الأذان تلقائياً عند موعد الصلاة
  useEffect(() => {
    if (!data || !adhanOn) return;
    const next = getNextPrayer(data.timings);
    if (!next || next.minutesLeft > 1) return;
    const timer = setTimeout(() => playAdhan(), next.minutesLeft * 60 * 1000);
    return () => clearTimeout(timer);
  }, [data, adhanOn, now]);

  const playAdhan = async () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const voiceId = loadSettings().adhanVoice;
    const voice = getVoice(voiceId);
    for (const src of voice.sources) {
      try {
        const audio = new Audio(src);
        audio.onended = () => setPlaying(false);
        audio.onerror = () => {};
        await audio.play();
        audioRef.current = audio;
        setPlaying(true);
        return;
      } catch { /* جرّب التالي */ }
    }
    toast.error("تعذّر تشغيل الأذان. تأكد من الاتصال بالإنترنت.");
  };

  const stopAdhan = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
  };

  const next = data ? getNextPrayer(data.timings) : null;

  const filtered = ARAB_CITIES.filter(
    (c) => c.name.includes(search) || c.country.includes(search)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="andalusi-frame"
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 transition">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm text-foreground truncate">{city.name}</span>
              <span className="text-[10px] text-muted-foreground">— {city.country}</span>
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="font-display gold-text text-center">اختر مدينتك</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن مدينة أو دولة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-card/50"
                autoFocus
              />
            </div>
            <Button
              onClick={async () => { await detectLocation(); setOpen(false); }}
              disabled={locating}
              variant="outline"
              className="w-full border-primary/40 text-primary hover:bg-primary/10"
            >
              {locating ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Locate className="h-4 w-4 ml-2" />}
              تحديد موقعي تلقائياً (GPS)
            </Button>
            <div className="overflow-y-auto flex-1 space-y-1 pr-1">
              {filtered.map((c) => (
                <button
                  key={`${c.name}-${c.country}`}
                  onClick={() => { setCity(c); setOpen(false); setSearch(""); }}
                  className={`w-full text-right p-2.5 rounded-lg border transition ${
                    c.name === city.name
                      ? "bg-primary/15 border-primary text-primary"
                      : "bg-card/40 border-border/40 hover:border-primary/40"
                  }`}
                >
                  <div className="text-sm">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground">{c.country}</div>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-6">لا توجد نتائج</p>
              )}
            </div>
            <p className="text-[10px] text-center text-primary/70">{ARAB_CITIES.length} مدينة عربية</p>
          </DialogContent>
        </Dialog>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={() => setAdhanOn(!adhanOn)}
          title={adhanOn ? "إيقاف الأذان التلقائي" : "تفعيل الأذان التلقائي"}
        >
          {adhanOn ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
        </Button>
      </div>

      {loading && <div className="text-center py-6 text-muted-foreground text-sm">جاري تحميل المواقيت...</div>}

      {data && next && (
        <>
          <motion.div
            key={next.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-4 p-4 rounded-xl bg-gradient-gold/10 border border-primary/30 animate-glow-pulse"
          >
            <p className="text-xs text-muted-foreground mb-1">الصلاة القادمة</p>
            <h3 className="font-display text-3xl gold-text mb-1">{PRAYER_NAMES_AR[next.name]}</h3>
            <p className="text-primary text-xl font-mono">{next.time}</p>
            <p className="text-xs text-muted-foreground mt-2">
              بعد {Math.floor(next.minutesLeft / 60)} ساعة و {next.minutesLeft % 60} دقيقة
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(PRAYER_NAMES_AR) as Array<keyof typeof PRAYER_NAMES_AR>).map((k, i) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`text-center p-2 rounded-lg border ${
                  next.name === k ? "border-primary bg-primary/10" : "border-border/40 bg-muted/20"
                }`}
              >
                <p className="text-[11px] text-muted-foreground">{PRAYER_NAMES_AR[k]}</p>
                <p className="text-sm font-mono text-foreground">{data.timings[k]}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {data.date.hijri.weekday.ar} {data.date.hijri.date} {data.date.hijri.month.ar} {data.date.hijri.year}هـ
            </span>
            {playing ? (
              <button onClick={stopAdhan} className="flex items-center gap-1 text-xs text-destructive hover:underline">
                <Square className="h-3 w-3" /> إيقاف
              </button>
            ) : (
              <button onClick={playAdhan} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Play className="h-3 w-3" /> استمع للأذان
              </button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
};
