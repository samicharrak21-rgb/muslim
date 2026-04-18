import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { ASMA_HUSNA } from "@/lib/asma-husna";

const AsmaHusna = () => (
  <PageShell title="أسماء الله الحسنى" subtitle="«وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا»">
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.02 } } }}
      className="grid grid-cols-2 md:grid-cols-3 gap-3"
    >
      {ASMA_HUSNA.map((n, i) => (
        <motion.div
          key={i}
          variants={{ hidden: { opacity: 0, scale: 0.85 }, show: { opacity: 1, scale: 1 } }}
          className="andalusi-frame text-center group glow-on-hover"
        >
          <div className="flex items-center justify-center gap-1 text-[10px] text-primary/60 mb-1">
            <Sparkles className="h-2.5 w-2.5" />
            <span>{i + 1}</span>
          </div>
          <h3 className="font-display text-xl gold-text mb-2">{n.name}</h3>
          <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">{n.meaning}</p>
        </motion.div>
      ))}
    </motion.div>
  </PageShell>
);

export default AsmaHusna;
