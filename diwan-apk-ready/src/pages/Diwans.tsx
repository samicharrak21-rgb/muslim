import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ScrollText, Feather } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { DIWANS, Diwan, Poem } from "@/lib/diwans";

const Diwans = () => {
  const [diwan, setDiwan] = useState<Diwan | null>(null);
  const [poem, setPoem] = useState<Poem | null>(null);

  if (poem && diwan) {
    return (
      <PageShell title={poem.title} subtitle={`${poem.poet} • ${diwan.era}`}>
        <button onClick={() => setPoem(null)} className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4" /> رجوع لقصائد الديوان
        </button>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="ornament-border rounded-2xl bg-card/60 backdrop-blur-md p-6 md:p-8"
        >
          <div className="text-center mb-6">
            <Feather className="h-6 w-6 text-primary mx-auto mb-2 animate-float" />
            <h2 className="font-display text-2xl gold-text">{poem.title}</h2>
          </div>
          <div className="space-y-4">
            {poem.lines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="font-quran text-xl md:text-2xl text-center text-foreground leading-loose tracking-wide"
              >
                {line}
              </motion.p>
            ))}
          </div>
          <div className="mt-8 text-center text-primary/50">✦ ✦ ✦</div>
        </motion.div>
      </PageShell>
    );
  }

  if (diwan) {
    return (
      <PageShell title={`ديوان ${diwan.poet}`} subtitle={diwan.era}>
        <button onClick={() => setDiwan(null)} className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4" /> كل الدواوين
        </button>
        <div className="ornament-border rounded-xl bg-card/40 p-4 mb-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{diwan.bio}</p>
        </div>
        <h3 className="font-display text-lg gold-text mb-3">قصائد الديوان</h3>
        <div className="space-y-2">
          {diwan.poems.map((p, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setPoem(p)}
              className="w-full text-right p-4 rounded-xl ornament-border bg-card/50 hover:bg-card/80 glow-on-hover flex items-center gap-3"
            >
              <ScrollText className="h-5 w-5 text-primary shrink-0" />
              <div className="flex-1">
                <h4 className="font-display text-base text-foreground">{p.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.lines[0]}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="الأدب والدواوين" subtitle="من عيون الشعر العربي والأندلسي">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <AnimatePresence>
          {DIWANS.map((d) => (
            <motion.button
              key={d.id}
              variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
              onClick={() => setDiwan(d)}
              className="text-right p-5 rounded-xl ornament-border bg-card/50 hover:bg-card/80 glow-on-hover"
            >
              <div className="flex items-center gap-2 mb-2">
                <Feather className="h-4 w-4 text-primary" />
                <span className="text-[10px] text-primary/70 px-2 py-0.5 rounded-full bg-primary/10">{d.poems.length} قصيدة</span>
              </div>
              <h3 className="font-display text-xl gold-text mb-1">{d.poet}</h3>
              <p className="text-[11px] text-muted-foreground">{d.era}</p>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
    </PageShell>
  );
};

export default Diwans;
