import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Play, Pause, Mic2, Bookmark, BookmarkPlus,
  ChevronRight, ChevronLeft, BookOpen, Trophy, RotateCcw, List, X, Layers, Repeat, SkipBack, SkipForward,
  Download, CheckCircle2, WifiOff, HardDrive, Loader2, Trash2,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { QURAN_RECITERS } from "@/lib/islamic-content";
import { JUZ_TO_PAGE, HIZB_TO_PAGE, JUZ_NAMES } from "@/lib/quran-meta";
import { offlineCache, audioKey } from "@/lib/offline-cache";
import { toast } from "sonner";

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface PageAyah {
  number: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
  numberInSurah: number;
  juz: number;
  page: number;
  hizbQuarter: number;
}

const TOTAL_PAGES = 604;

const SURAH_FIRST_PAGE: Record<number, number> = {
  1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187, 10: 208,
  11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282, 18: 293, 19: 305, 20: 312,
  21: 322, 22: 332, 23: 342, 24: 350, 25: 359, 26: 367, 27: 377, 28: 385, 29: 396, 30: 404,
  31: 411, 32: 415, 33: 418, 34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467,
  41: 477, 42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515, 50: 518,
  51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537, 58: 542, 59: 545, 60: 549,
  61: 551, 62: 553, 63: 554, 64: 556, 65: 558, 66: 560, 67: 562, 68: 564, 69: 566, 70: 568,
  71: 570, 72: 572, 73: 574, 74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585,
  81: 586, 82: 587, 83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593, 90: 594,
  91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598, 98: 598, 99: 599, 100: 599,
  101: 600, 102: 600, 103: 601, 104: 601, 105: 601, 106: 602, 107: 602, 108: 602, 109: 603, 110: 603,
  111: 603, 112: 604, 113: 604, 114: 604,
};

const Quran = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [page, setPage] = useState<number | null>(null);
  const [pageInput, setPageInput] = useState("");
  const [search, setSearch] = useState("");
  const [reciterId, setReciterId] = useState<string>(() => localStorage.getItem("diwan_reciter") || "afs");
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pageAyahs, setPageAyahs] = useState<PageAyah[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>(
    () => JSON.parse(localStorage.getItem("diwan_quran_bm_pages") || "[]")
  );
  const [readPages, setReadPages] = useState<Record<number, boolean>>(
    () => JSON.parse(localStorage.getItem("diwan_khatma_pages") || "{}")
  );
  const [tab, setTab] = useState<"surahs" | "bookmarks" | "khatma" | "offline">("surahs");
  const [repeatMode, setRepeatMode] = useState<boolean>(() => localStorage.getItem("diwan_repeat") === "1");
  const [downloadingSurah, setDownloadingSurah] = useState<number | null>(null);
  const [downloadedKeys, setDownloadedKeys] = useState<Set<string>>(new Set());
  const [bulkDownload, setBulkDownload] = useState<{ active: boolean; current: number; total: number; type: "pages" | "surahs" } | null>(null);
  const [cachedPagesCount, setCachedPagesCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const touchStartX = useRef(0);

  useEffect(() => {
    const loadSurahs = async () => {
      // 1) جرّب الكاش أولاً
      const cached = (await offlineCache.getMeta("surahs_list")) as Surah[] | null;
      if (cached?.length) setSurahs(cached);

      // 2) حدّث من الإنترنت
      try {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        const json = await response.json();
        if (json.data?.length) {
          setSurahs(json.data);
          await offlineCache.setMeta("surahs_list", json.data);
        }
      } catch {
        if (!cached) toast.error("تعذّر تحميل قائمة السور");
      }
    };

    loadSurahs();

    // تحديث المفاتيح المنزّلة
    offlineCache.listAudioKeys().then((keys) => setDownloadedKeys(new Set(keys)));
    offlineCache.getPagesCount().then(setCachedPagesCount);

    // مراقبة حالة الاتصال
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("diwan_reciter", reciterId);
  }, [reciterId]);

  useEffect(() => {
    localStorage.setItem("diwan_quran_bm_pages", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("diwan_khatma_pages", JSON.stringify(readPages));
  }, [readPages]);

  useEffect(() => {
    if (!page) return;

    localStorage.setItem("diwan_last_page", String(page));
    setReadPages((p) => ({ ...p, [page]: true }));
    stopAudio();

    const controller = new AbortController();
    const loadPage = async () => {
      setPageLoading(true);
      setPageError(null);

      // 1) جرّب الكاش أولاً
      const cached = (await offlineCache.getPage(page)) as PageAyah[] | null;
      if (cached?.length) {
        setPageAyahs(cached);
        setPageLoading(false);
      }

      // 2) جرّب التحديث من الإنترنت إن أمكن
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/page/${page}/quran-uthmani`, {
          signal: controller.signal,
        });
        const json = await response.json();
        const ayahs = json?.data?.ayahs;

        if (!response.ok || !Array.isArray(ayahs)) {
          throw new Error("QURAN_PAGE_UNAVAILABLE");
        }

        setPageAyahs(ayahs);
        await offlineCache.setPage(page, ayahs);
        setCachedPagesCount(await offlineCache.getPagesCount());
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        if (!cached?.length) {
          setPageAyahs([]);
          setPageError("هذه الصفحة غير محملة. اتصل بالإنترنت لتحميلها.");
        }
      } finally {
        if (!controller.signal.aborted) setPageLoading(false);
      }
    };

    loadPage();
    return () => controller.abort();
  }, [page]);

  const stopAudio = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setAudio(null);
    setPlaying(false);
  };

  const reciter = QURAN_RECITERS.find((r) => r.id === reciterId) ?? QURAN_RECITERS[0];

  const currentSurahForPage = (p: number): Surah | undefined => {
    let found: Surah | undefined;
    for (const s of surahs) {
      const fp = SURAH_FIRST_PAGE[s.number];
      if (fp && fp <= p) found = s;
      else break;
    }
    return found;
  };

  // تشغيل صوت السورة (يستخدم الكاش إن وُجد)
  const startAudioForSurah = async (surahNumber: number) => {
    stopAudio();
    const key = audioKey(reciter.id, surahNumber);
    let url: string;

    const cachedBlob = await offlineCache.getAudio(key);
    if (cachedBlob) {
      url = URL.createObjectURL(cachedBlob);
    } else {
      url = `${reciter.server}/${String(surahNumber).padStart(3, "0")}.mp3`;
    }

    const a = new Audio(url);
    a.loop = repeatMode;
    a.onended = () => { if (!repeatMode) setPlaying(false); };
    a.onerror = () => {
      setPlaying(false);
      setAudio(null);
      toast.error(isOnline ? "تعذّر تشغيل التلاوة" : "هذه التلاوة غير منزّلة. اتصل بالإنترنت أو نزّلها أولاً");
    };
    a.play().catch(() => {
      toast.error("تعذّر بدء التلاوة");
    });
    setAudio(a);
    setPlaying(true);
  };

  const playPageSurah = () => {
    if (!page) return;
    if (audio && playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    if (audio && !playing) {
      audio.play();
      setPlaying(true);
      return;
    }

    const s = currentSurahForPage(page);
    if (!s) return;
    startAudioForSurah(s.number);
  };

  const playSurahAt = (surahNumber: number) => {
    startAudioForSurah(surahNumber);
  };

  // ============ تنزيل التلاوات ============
  const downloadSurahAudio = async (surahNumber: number, silent = false) => {
    const key = audioKey(reciter.id, surahNumber);
    if (downloadedKeys.has(key)) return true;

    setDownloadingSurah(surahNumber);
    try {
      const url = `${reciter.server}/${String(surahNumber).padStart(3, "0")}.mp3`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("FETCH_FAILED");
      const blob = await res.blob();
      await offlineCache.setAudio(key, blob);
      setDownloadedKeys((prev) => new Set(prev).add(key));
      if (!silent) toast.success(`تم تنزيل التلاوة بنجاح`);
      return true;
    } catch {
      if (!silent) toast.error("فشل تنزيل التلاوة");
      return false;
    } finally {
      setDownloadingSurah(null);
    }
  };

  const removeSurahAudio = async (key: string) => {
    await offlineCache.deleteAudio(key);
    setDownloadedKeys((prev) => {
      const n = new Set(prev);
      n.delete(key);
      return n;
    });
    toast.success("تم حذف التلاوة المحفوظة");
  };

  // ============ تنزيل المصحف كاملاً (نص الآيات) ============
  const downloadAllPages = async () => {
    if (bulkDownload?.active) return;
    setBulkDownload({ active: true, current: 0, total: TOTAL_PAGES, type: "pages" });
    let success = 0;
    for (let p = 1; p <= TOTAL_PAGES; p++) {
      const exists = await offlineCache.getPage(p);
      if (!exists) {
        try {
          const r = await fetch(`https://api.alquran.cloud/v1/page/${p}/quran-uthmani`);
          const j = await r.json();
          if (j?.data?.ayahs) {
            await offlineCache.setPage(p, j.data.ayahs);
            success++;
          }
        } catch { /* تخطّى */ }
      } else {
        success++;
      }
      setBulkDownload((prev) => prev ? { ...prev, current: p } : null);
    }
    setBulkDownload(null);
    setCachedPagesCount(await offlineCache.getPagesCount());
    toast.success(`اكتمل التنزيل: ${success} صفحة جاهزة بدون نت`);
  };

  const downloadAllSurahsForReciter = async () => {
    if (bulkDownload?.active) return;
    setBulkDownload({ active: true, current: 0, total: 114, type: "surahs" });
    for (let n = 1; n <= 114; n++) {
      await downloadSurahAudio(n, true);
      setBulkDownload((prev) => prev ? { ...prev, current: n } : null);
    }
    setBulkDownload(null);
    toast.success(`اكتمل تنزيل تلاوات ${reciter.name}`);
  };

  const clearAllCache = async () => {
    if (!confirm("سيتم حذف كل النصوص والتلاوات المنزّلة. متأكد؟")) return;
    await offlineCache.clearPages();
    const keys = await offlineCache.listAudioKeys();
    for (const k of keys) await offlineCache.deleteAudio(k);
    setDownloadedKeys(new Set());
    setCachedPagesCount(0);
    toast.success("تم مسح كل البيانات الأوفلاين");
  };

  useEffect(() => {
    localStorage.setItem("diwan_repeat", repeatMode ? "1" : "0");
    if (audio) audio.loop = repeatMode;
  }, [repeatMode, audio]);

  const goPrev = () => page && page > 1 && setPage(page - 1);
  const goNext = () => page && page < TOTAL_PAGES && setPage(page + 1);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) goNext();
    else if (dx > 50) goPrev();
  };

  const toggleBookmark = () => {
    if (!page) return;
    setBookmarks((prev) => {
      const exists = prev.includes(page);
      if (exists) {
        toast.success("أُزيلت الإشارة");
        return prev.filter((p) => p !== page);
      }
      toast.success(`حُفظت الصفحة ${page}`);
      return [page, ...prev];
    });
  };

  const filtered = surahs.filter(
    (s) => s.name.includes(search) || s.englishName.toLowerCase().includes(search.toLowerCase())
  );

  const lastPage = Number(localStorage.getItem("diwan_last_page") || "0");
  const readCount = Object.values(readPages).filter(Boolean).length;
  const khatmaPct = Math.round((readCount / TOTAL_PAGES) * 100);

  const pageMeta = useMemo(() => {
    if (!pageAyahs.length) return null;

    const first = pageAyahs[0];
    const last = pageAyahs[pageAyahs.length - 1];
    return {
      juz: first.juz,
      hizbQuarter: first.hizbQuarter,
      startAyah: first.numberInSurah,
      endAyah: last.numberInSurah,
      surahName: first.surah.name,
      isSingleSurah: first.surah.number === last.surah.number,
    };
  }, [pageAyahs]);

  if (page) {
    const surahHere = currentSurahForPage(page);
    const isBm = bookmarks.includes(page);

    return (
      <PageShell hideThemeToggle>
        <div className="-mx-4">
          <div className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-primary/20 px-3 py-2 flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setPage(null)}>
              <X className="h-4 w-4" />
            </Button>

            <div className="flex-1 text-center">
              <p className="font-display text-sm gold-text leading-none">
                {surahHere?.name ?? pageMeta?.surahName ?? "المصحف"}
              </p>
              <p className="text-[10px] text-muted-foreground">صفحة {page} / {TOTAL_PAGES}</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setRepeatMode((r) => !r)}
              title="تكرار التلاوة"
              className={repeatMode ? "text-primary" : ""}
            >
              <Repeat className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleBookmark}>
              {isBm ? <Bookmark className="h-4 w-4 text-primary fill-current" /> : <BookmarkPlus className="h-4 w-4" />}
            </Button>

            <Button onClick={playPageSurah} size="sm" className="bg-gradient-gold text-primary-foreground h-8">
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {playing && surahHere && (
            <div className="mx-2 mt-3 rounded-lg bg-gradient-gold/10 border border-primary/30 px-3 py-2 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => surahHere.number > 1 && playSurahAt(surahHere.number - 1)}
                disabled={surahHere.number <= 1}
                title="السورة السابقة"
              >
                <SkipBack className="h-3.5 w-3.5" />
              </Button>
              <div className="flex-1 text-center min-w-0">
                <p className="text-[10px] text-muted-foreground leading-none">يُتلى الآن</p>
                <p className="font-display text-sm gold-text mt-0.5 truncate">
                  {surahHere.name} • {reciter.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => surahHere.number < 114 && playSurahAt(surahHere.number + 1)}
                disabled={surahHere.number >= 114}
                title="السورة التالية"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <div
            className="relative bg-card/70 mx-2 my-3 rounded-lg overflow-hidden shadow-deep border-2 border-primary/40"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ minHeight: 460 }}
          >
            <div className="px-4 py-3 border-b border-primary/15 bg-gradient-gold/10 text-center">
              <div className="font-display gold-text text-sm">القراءة حسب الصفحة</div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {pageMeta ? `الجزء ${pageMeta.juz} • الحزب ${Math.ceil(pageMeta.hizbQuarter / 4)}` : "تحميل بيانات الصفحة..."}
              </div>
            </div>

            {pageLoading ? (
              <div className="min-h-[360px] flex items-center justify-center text-muted-foreground text-sm">
                جاري تحميل الصفحة...
              </div>
            ) : pageError ? (
              <div className="min-h-[360px] flex flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-sm text-muted-foreground">{pageError}</p>
                <Button size="sm" variant="outline" onClick={() => setPage((p) => p ? p : 1)}>
                  إعادة المحاولة
                </Button>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 text-right leading-[2.45] max-h-[70vh] overflow-y-auto"
                  dir="rtl"
                >
                  {pageAyahs.length > 0 && (
                    <>
                      {pageMeta?.isSingleSurah && pageMeta.startAyah === 1 && page !== 1 && (
                        <div className="text-center mb-4">
                          <h2 className="font-display text-lg gold-text mb-2">{pageMeta.surahName}</h2>
                          <p className="font-quran text-xl text-foreground/90">﷽</p>
                        </div>
                      )}

                      <div className="font-quran text-[1.55rem] text-foreground break-words">
                        {pageAyahs.map((ayah) => (
                          <span key={ayah.number} className="inline leading-[2.4]">
                            {ayah.text}{" "}
                            <span className="inline-flex items-center justify-center min-w-7 h-7 mx-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[0.7rem] align-middle">
                              {ayah.numberInSurah}
                            </span>{" "}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            <button
              onClick={goNext}
              disabled={page >= TOTAL_PAGES}
              aria-label="الصفحة التالية"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-12 w-9 rounded-r-md bg-primary/20 hover:bg-primary/40 text-primary-foreground flex items-center justify-center disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              onClick={goPrev}
              disabled={page <= 1}
              aria-label="الصفحة السابقة"
              className="absolute left-1 top-1/2 -translate-y-1/2 h-12 w-9 rounded-l-md bg-primary/20 hover:bg-primary/40 text-primary-foreground flex items-center justify-center disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="px-4 pb-4 space-y-3">
            <Progress value={(page / TOTAL_PAGES) * 100} className="h-1.5" />

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-center">
                <div className="text-[10px] text-muted-foreground">الجزء</div>
                <div className="font-display text-primary">{pageMeta?.juz ?? "—"}</div>
              </div>
              <div className="rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-center">
                <div className="text-[10px] text-muted-foreground">مدى الآيات</div>
                <div className="font-display text-primary">{pageMeta ? `${pageMeta.startAyah}-${pageMeta.endAyah}` : "—"}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <List className="h-3.5 w-3.5 ml-1" /> السور
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[75vh] overflow-y-auto">
                  <SheetHeader><SheetTitle className="text-right gold-text">اختر سورة</SheetTitle></SheetHeader>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {surahs.map((s) => (
                      <button
                        key={s.number}
                        onClick={() => setPage(SURAH_FIRST_PAGE[s.number])}
                        className="flex items-center gap-2 p-2 rounded-lg bg-card/50 hover:bg-card border border-border/40 text-right"
                      >
                        <span className="w-7 h-7 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                          {s.number}
                        </span>
                        <span className="font-display text-sm flex-1">{s.name}</span>
                      </button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Layers className="h-3.5 w-3.5 ml-1" /> أجزاء
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto p-0">
                  <SheetHeader className="p-4 border-b border-border/30">
                    <SheetTitle className="text-right gold-text">الأجزاء والأحزاب</SheetTitle>
                  </SheetHeader>

                  <div className="p-4 space-y-5">
                    <div>
                      <h4 className="font-display text-sm text-primary mb-2">الأجزاء (1 - 30)</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
                          <button
                            key={`j${j}`}
                            onClick={() => setPage(JUZ_TO_PAGE[j])}
                            className="group relative p-2 rounded-lg bg-card/50 hover:bg-gradient-gold/20 border border-border/40 hover:border-primary/60 transition-all text-center"
                          >
                            <div className="text-[10px] text-muted-foreground">جزء</div>
                            <div className="font-display text-lg gold-text">{j}</div>
                            <div className="text-[9px] text-primary/70 truncate font-quran">{JUZ_NAMES[j - 1]}</div>
                            <div className="text-[8px] text-muted-foreground mt-0.5">ص {JUZ_TO_PAGE[j]}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-display text-sm text-primary mb-2">الأحزاب (1 - 60)</h4>
                      <div className="grid grid-cols-5 gap-1.5">
                        {Array.from({ length: 60 }, (_, i) => i + 1).map((h) => (
                          <button
                            key={`h${h}`}
                            onClick={() => setPage(HIZB_TO_PAGE[h])}
                            className="aspect-square rounded-md bg-card/50 hover:bg-gradient-gold/20 border border-border/40 hover:border-primary/60 transition-all flex flex-col items-center justify-center"
                          >
                            <div className="font-display text-sm text-primary">{h}</div>
                            <div className="text-[8px] text-muted-foreground">{HIZB_TO_PAGE[h]}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={1}
                max={TOTAL_PAGES}
                placeholder="رقم الصفحة..."
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="h-9 text-center flex-1"
              />
              <Button
                size="sm"
                onClick={() => {
                  const n = Number(pageInput);
                  if (n >= 1 && n <= TOTAL_PAGES) {
                    setPage(n);
                    setPageInput("");
                  } else {
                    toast.error("رقم غير صحيح");
                  }
                }}
              >
                انتقل
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Mic2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <Select value={reciterId} onValueChange={(v) => { stopAudio(); setReciterId(v); }}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QURAN_RECITERS.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="المُصحف الشريف" subtitle="٦٠٤ صفحات • برواية حفص">
      {!isOnline && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
          <WifiOff className="h-3.5 w-3.5" />
          <span>وضع بدون إنترنت — يعمل من المحتوى المنزّل</span>
        </div>
      )}

      {bulkDownload?.active && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 ornament-border rounded-xl bg-gradient-gold/15 p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
            <p className="text-xs text-primary flex-1">
              {bulkDownload.type === "pages" ? "تنزيل المصحف" : `تنزيل تلاوات ${reciter.name}`} ({bulkDownload.current}/{bulkDownload.total})
            </p>
          </div>
          <Progress value={(bulkDownload.current / bulkDownload.total) * 100} className="h-1.5" />
        </motion.div>
      )}

      {lastPage > 0 && (
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setPage(lastPage)}
          className="w-full mb-4 ornament-border rounded-xl bg-gradient-gold/15 p-3 flex items-center gap-3 hover:bg-gradient-gold/25 transition-all"
        >
          <BookOpen className="h-5 w-5 text-primary" />
          <div className="flex-1 text-right">
            <p className="text-[11px] text-muted-foreground">تابع القراءة من</p>
            <p className="font-display text-sm gold-text">صفحة {lastPage}</p>
          </div>
          <ChevronLeft className="h-4 w-4 text-primary" />
        </motion.button>
      )}

      <div className="grid grid-cols-4 gap-1.5 mb-4 ornament-border rounded-xl p-1 bg-card/40">
        {([
          { id: "surahs", label: "السور", Icon: BookOpen },
          { id: "bookmarks", label: "إشاراتي", Icon: Bookmark },
          { id: "khatma", label: "ختمتي", Icon: Trophy },
          { id: "offline", label: "أوفلاين", Icon: HardDrive },
        ] as const).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] transition-all ${
              tab === id ? "bg-gradient-gold text-primary-foreground shadow-glow" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "surahs" && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن سورة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-card/50 border-primary/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filtered.map((s) => {
                const key = audioKey(reciter.id, s.number);
                const isDownloaded = downloadedKeys.has(key);
                const isDownloading = downloadingSurah === s.number;
                return (
                  <div
                    key={s.number}
                    className="group flex items-center gap-2 p-3 rounded-xl bg-card/40 border border-border/40 hover:border-primary/50 hover:bg-card/70 transition-all text-right"
                  >
                    <button
                      onClick={() => setPage(SURAH_FIRST_PAGE[s.number])}
                      className="flex items-center gap-3 flex-1 text-right min-w-0"
                    >
                      <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                        <svg viewBox="0 0 40 40" className="absolute inset-0 text-primary/40">
                          <polygon points="20,2 25,15 38,15 28,24 32,38 20,30 8,38 12,24 2,15 15,15" fill="currentColor" />
                        </svg>
                        <span className="relative text-xs font-bold text-primary">{s.number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-base text-foreground">{s.name}</h3>
                        <p className="text-[10px] text-muted-foreground">
                          {s.englishName} • {s.numberOfAyahs} آية • ص {SURAH_FIRST_PAGE[s.number]}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isDownloaded) removeSurahAudio(key);
                        else downloadSurahAudio(s.number);
                      }}
                      disabled={isDownloading}
                      title={isDownloaded ? "محفوظة — اضغط للحذف" : "تنزيل التلاوة للاستماع بدون نت"}
                      className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center hover:bg-primary/10 transition"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                      ) : isDownloaded ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Download className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {tab === "bookmarks" && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {bookmarks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">لا توجد إشارات بعد</p>
              </div>
            ) : (
              bookmarks.map((p, i) => {
                const s = currentSurahForPage(p);
                return (
                  <button
                    key={i}
                    onClick={() => setPage(p)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-border/40 hover:border-primary/50 transition-all text-right"
                  >
                    <Bookmark className="h-4 w-4 text-primary fill-current" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-base">صفحة {p}</h4>
                      <p className="text-[10px] text-muted-foreground">{s?.name ?? ""}</p>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-primary" />
                  </button>
                );
              })
            )}
          </motion.div>
        )}

        {tab === "khatma" && (
          <motion.div key="k" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="ornament-border rounded-2xl bg-card/50 p-6 text-center">
              <Trophy className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-display text-xl gold-text mb-1">ختمتك الشخصية</h3>
              <p className="text-xs text-muted-foreground mb-4">تتبّع تقدّمك في تلاوة المصحف</p>
              <div className="text-5xl font-display gold-text mb-2">{khatmaPct}%</div>
              <Progress value={khatmaPct} className="h-3 mb-3" />
              <p className="text-xs text-muted-foreground mb-4">
                {readCount.toLocaleString("ar-EG")} من {TOTAL_PAGES.toLocaleString("ar-EG")} صفحة
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("هل تريد بدء ختمة جديدة؟")) {
                    setReadPages({});
                    toast.success("بدأت ختمة جديدة");
                  }
                }}
              >
                <RotateCcw className="h-3 w-3 ml-1" /> ختمة جديدة
              </Button>
            </div>
          </motion.div>
        )}

        {tab === "offline" && (
          <motion.div key="o" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="ornament-border rounded-2xl bg-card/50 p-5 text-center">
              <HardDrive className="h-10 w-10 text-primary mx-auto mb-2" />
              <h3 className="font-display text-lg gold-text mb-1">الوضع الأوفلاين</h3>
              <p className="text-xs text-muted-foreground">حمّل المصحف والتلاوات للاستعمال بدون نت</p>
            </div>

            {/* تنزيل نص المصحف */}
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-4">
              <div className="flex items-start gap-3 mb-3">
                <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-display text-base gold-text">نص المصحف الشريف</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {cachedPagesCount} / {TOTAL_PAGES} صفحة محفوظة • حجم تقريبي ~5 ميجا
                  </p>
                </div>
              </div>
              <Progress value={(cachedPagesCount / TOTAL_PAGES) * 100} className="h-1.5 mb-3" />
              <Button
                size="sm"
                onClick={downloadAllPages}
                disabled={!isOnline || bulkDownload?.active || cachedPagesCount >= TOTAL_PAGES}
                className="w-full bg-gradient-gold text-primary-foreground"
              >
                {cachedPagesCount >= TOTAL_PAGES ? (
                  <><CheckCircle2 className="h-3.5 w-3.5 ml-1" /> المصحف كاملاً جاهز</>
                ) : (
                  <><Download className="h-3.5 w-3.5 ml-1" /> تنزيل المصحف كاملاً</>
                )}
              </Button>
            </div>

            {/* تنزيل تلاوات القارئ الحالي */}
            <div className="rounded-2xl border border-primary/20 bg-card/40 p-4">
              <div className="flex items-start gap-3 mb-3">
                <Mic2 className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-display text-base gold-text">تلاوات {reciter.name}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {Array.from(downloadedKeys).filter((k) => k.startsWith(`${reciter.id}:`)).length} / 114 سورة • حجم كبير ~2 جيجا
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadAllSurahsForReciter}
                disabled={!isOnline || bulkDownload?.active}
                className="w-full"
              >
                <Download className="h-3.5 w-3.5 ml-1" /> تنزيل كل تلاوات هذا القارئ
              </Button>
              <p className="text-[10px] text-muted-foreground/70 mt-2 text-center">
                💡 يمكنك تنزيل تلاوة سورة واحدة من زر التنزيل بجانبها في قائمة السور
              </p>
            </div>

            {/* قائمة التلاوات المنزّلة */}
            {downloadedKeys.size > 0 && (
              <div className="rounded-2xl border border-primary/20 bg-card/40 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-display text-sm gold-text">التلاوات المحفوظة ({downloadedKeys.size})</h4>
                  <button
                    onClick={clearAllCache}
                    className="text-[11px] text-destructive hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> مسح الكل
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {Array.from(downloadedKeys).slice(0, 30).map((k) => {
                    const [rid, num] = k.split(":");
                    const r = QURAN_RECITERS.find((x) => x.id === rid);
                    const sn = Number(num);
                    const s = surahs.find((x) => x.number === sn);
                    return (
                      <div key={k} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-card/40 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="flex-1 truncate">{s?.name ?? `سورة ${sn}`} • {r?.name ?? rid}</span>
                        <button onClick={() => removeSurahAudio(k)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                  {downloadedKeys.size > 30 && (
                    <p className="text-center text-[10px] text-muted-foreground py-2">+ {downloadedKeys.size - 30} أخرى</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default Quran;
