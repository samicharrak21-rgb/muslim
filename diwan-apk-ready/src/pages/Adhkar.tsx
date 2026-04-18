import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, RotateCcw, Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { MORNING_ADHKAR, EVENING_ADHKAR, TASBEEH_ITEMS, Dhikr } from "@/lib/islamic-content";

type Tab = "morning" | "evening" | "tasbeeh";

const Adhkar = () => {
  const [tab, setTab] = useState<Tab>("morning");
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [tasbeehIdx, setTasbeehIdx] = useState(0);
  const [tasbeehCount, setTasbeehCount] = useState(0);

  const list = tab === "morning" ? MORNING_ADHKAR : tab === "evening" ? EVENING_ADHKAR : [];

  const inc = (i: number, dhikr: Dhikr) => {
    setCounts((p) => {
      const next = (p[i] ?? 0) + 1;
      return { ...p, [i]: next > dhikr.count ? dhikr.count : next };
    });
  };

  const tasbeeh = TASBEEH_ITEMS[tasbeehIdx];

  return (
    <PageShell title="الأذكار والتسبيح" subtitle="حصن المسلم">
      <div className="grid grid-cols-3 gap-2 mb-5 ornament-border rounded-xl p-1 bg-card/40">
        {([
          { id: "morning", label: "الصباح", Icon: Sun },
          { id: "evening", label: "المساء", Icon: Moon },
          { id: "tasbeeh", label: "السبحة", Icon: Sparkles },
        ] as const).map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-all ${
              tab === id ? "bg-gradient-gold text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab !== "tasbeeh" ? (
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {list.map((d, i) => {
              const c = counts[i] ?? 0;
              const done = c >= d.count;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`ornament-border rounded-xl p-4 transition-all ${
                    done ? "bg-secondary/30 border-secondary/50" : "bg-card/50"
                  }`}
                >
                  <p className="font-quran text-lg leading-loose text-foreground mb-3 text-justify">{d.text}</p>
                  {d.source && <p className="text-[11px] text-primary/80 mb-2">— {d.source}</p>}
                  <div className="flex items-center justify-between gap-3">
                    <button
                      onClick={() => inc(i, d)}
                      disabled={done}
                      className="flex-1 py-2 rounded-lg bg-gradient-gold/20 hover:bg-gradient-gold/30 border border-primary/30 text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {done ? "✓ تم" : "اضغط للتسبيح"}
                    </button>
                    <span className="font-mono text-sm text-primary min-w-[3rem] text-center">
                      {c} / {d.count}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="tasbeeh"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center"
          >
            <div className="ornament-border rounded-2xl bg-card/50 p-6 mb-4">
              <p className="text-xs text-muted-foreground mb-3">الذكر الحالي</p>
              <h2 className="font-quran text-3xl gold-text mb-6">{tasbeeh.text}</h2>

              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setTasbeehCount((c) => (c + 1 >= tasbeeh.target ? 0 : c + 1))}
                className="relative mx-auto block w-48 h-48 rounded-full bg-gradient-gold shadow-glow animate-glow-pulse"
              >
                <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center flex-col">
                  <span className="font-display text-5xl gold-text">{tasbeehCount}</span>
                  <span className="text-xs text-muted-foreground mt-1">من {tasbeeh.target}</span>
                </div>
              </motion.button>

              <div className="mt-5 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setTasbeehCount(0)}>
                  <RotateCcw className="h-3 w-3 ml-1" /> صفر
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TASBEEH_ITEMS.map((t, i) => (
                <button
                  key={i}
                  onClick={() => { setTasbeehIdx(i); setTasbeehCount(0); }}
                  className={`p-2 rounded-lg text-sm border transition-all ${
                    tasbeehIdx === i
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/40 bg-card/30 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {t.text}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
};

export default Adhkar;
