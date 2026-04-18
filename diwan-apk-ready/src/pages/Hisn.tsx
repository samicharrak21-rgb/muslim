import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, BookMarked, Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { HISN_CHAPTERS } from "@/lib/hisn";
import type { Dhikr } from "@/lib/islamic-content";

const Hisn = () => {
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [counts, setCounts] = useState<Record<number, number>>({});

  const chapter = HISN_CHAPTERS.find((c) => c.id === chapterId);

  const inc = (i: number, d: Dhikr) => {
    setCounts((p) => ({ ...p, [i]: Math.min((p[i] ?? 0) + 1, d.count) }));
  };

  if (chapter) {
    return (
      <PageShell title={chapter.title} subtitle={`${chapter.items.length} ذكر`}>
        <button
          onClick={() => { setChapterId(null); setCounts({}); }}
          className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> رجوع للأبواب
        </button>

        <div className="space-y-3">
          {chapter.items.map((d, i) => {
            const c = counts[i] ?? 0;
            const done = c >= d.count;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`ornament-border rounded-xl p-4 ${done ? "bg-secondary/30" : "bg-card/50"}`}
              >
                <p className="font-quran text-lg leading-loose text-foreground mb-3 text-justify">{d.text}</p>
                {d.source && <p className="text-[11px] text-primary/80 mb-2">— {d.source}</p>}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => inc(i, d)}
                    disabled={done}
                    className="flex-1 py-2 rounded-lg bg-gradient-gold/20 hover:bg-gradient-gold/30 border border-primary/30 text-sm transition disabled:opacity-50"
                  >
                    {done ? "✓ تم" : "اضغط للتسبيح"}
                  </button>
                  <span className="font-mono text-sm text-primary min-w-[3rem] text-center">{c} / {d.count}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </PageShell>
    );
  }

  const filtered = HISN_CHAPTERS.filter((c) => c.title.includes(search));

  return (
    <PageShell title="حِصن المُسلم" subtitle={`${HISN_CHAPTERS.length} باباً من أذكار اليوم والليلة`}>
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن باب..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10 bg-card/50 border-primary/20"
        />
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filtered.map((c, i) => (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setChapterId(c.id)}
              className="flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-border/40 hover:border-primary/50 hover:bg-card/70 transition text-right"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-gold/15 border border-primary/30 flex items-center justify-center shrink-0">
                <BookMarked className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm text-foreground truncate">{c.title}</h3>
                <p className="text-[10px] text-muted-foreground">{c.items.length} ذكر</p>
              </div>
              <ChevronLeft className="h-4 w-4 text-primary/60 shrink-0" />
            </motion.button>
          ))}
        </div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <p className="text-center py-8 text-muted-foreground text-sm">لا توجد نتائج</p>
      )}
    </PageShell>
  );
};

export default Hisn;
