import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Share2, ChevronRight, Heart } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { DUA_CATEGORIES, DuaCategory } from "@/lib/duas";
import { toast } from "sonner";

const Duas = () => {
  const [selected, setSelected] = useState<DuaCategory | null>(null);
  const [favorites, setFavorites] = useState<string[]>(
    () => JSON.parse(localStorage.getItem("diwan_dua_favs") || "[]")
  );

  const toggleFav = (text: string) => {
    const next = favorites.includes(text)
      ? favorites.filter((f) => f !== text)
      : [...favorites, text];
    setFavorites(next);
    localStorage.setItem("diwan_dua_favs", JSON.stringify(next));
  };

  const copyDua = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("نُسخ الدعاء");
  };

  const shareDua = async (text: string, source?: string) => {
    const content = source ? `${text}\n\n— ${source}\n\nمن تطبيق ديوان الأندلس` : text;
    if (navigator.share) {
      try { await navigator.share({ text: content }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(content);
      toast.success("نُسخ للمشاركة");
    }
  };

  if (selected) {
    return (
      <PageShell title={selected.title} subtitle={`${selected.duas.length} دعاء مأثور`}>
        <button
          onClick={() => setSelected(null)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ChevronRight className="h-4 w-4" /> العودة للأقسام
        </button>

        <div className="space-y-3">
          {selected.duas.map((d, i) => {
            const isFav = favorites.includes(d.text);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="ornament-border rounded-xl bg-card/50 p-4"
              >
                <p className="font-quran text-lg leading-loose text-foreground text-justify mb-3">
                  {d.text}
                </p>
                {d.source && (
                  <p className="text-[11px] text-primary/80 mb-3">— {d.source}</p>
                )}
                <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                  <button
                    onClick={() => copyDua(d.text)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-card/40 hover:bg-card/70 text-xs text-muted-foreground hover:text-primary transition-all"
                  >
                    <Copy className="h-3 w-3" /> نسخ
                  </button>
                  <button
                    onClick={() => shareDua(d.text, d.source)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-card/40 hover:bg-card/70 text-xs text-muted-foreground hover:text-primary transition-all"
                  >
                    <Share2 className="h-3 w-3" /> مشاركة
                  </button>
                  <button
                    onClick={() => toggleFav(d.text)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg transition-all text-xs ${
                      isFav
                        ? "bg-primary/20 text-primary"
                        : "bg-card/40 text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <Heart className={`h-3 w-3 ${isFav ? "fill-current" : ""}`} />
                    {isFav ? "محفوظ" : "حفظ"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="الأدعية المأثورة" subtitle="من القرآن والسنة">
      <AnimatePresence>
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {DUA_CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(cat)}
              className="andalusi-frame text-right group"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{cat.icon}</span>
                <div className="flex-1">
                  <h3 className="font-display text-lg text-foreground">{cat.title}</h3>
                  <p className="text-[11px] text-muted-foreground">{cat.duas.length} دعاء</p>
                </div>
                <ChevronRight className="h-4 w-4 text-primary group-hover:-translate-x-1 transition-transform rotate-180" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>

      {favorites.length > 0 && (
        <div className="mt-6 text-center text-xs text-muted-foreground">
          ❤️ لديك {favorites.length} دعاء محفوظ
        </div>
      )}
    </PageShell>
  );
};

export default Duas;
