import { motion } from "framer-motion";
import { BookOpen, Share2 } from "lucide-react";
import { getDailyAyah, getWeeklyHadith } from "@/lib/daily-content";
import { toast } from "sonner";

export const DailyAyahCard = () => {
  const ayah = getDailyAyah();
  const hadith = getWeeklyHadith();

  const share = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("تم نسخ النص");
      }
    } catch { /* المستخدم ألغى */ }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="andalusi-frame relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-xs font-display gold-text">آية اليوم</span>
          </div>
          <button
            onClick={() => share(`${ayah.text}\n\n[${ayah.surah} - ${ayah.number}]`)}
            className="text-muted-foreground hover:text-primary transition"
            aria-label="مشاركة"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="font-quran text-base md:text-lg leading-loose text-center text-foreground/95 my-3">
          {ayah.text}
        </p>
        <p className="text-[11px] text-center text-primary/80 font-display">
          ﴿ {ayah.surah} — آية {ayah.number} ﴾
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="andalusi-frame relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-primary text-sm">✦</span>
            <span className="text-xs font-display gold-text">حديث الأسبوع</span>
          </div>
          <button
            onClick={() => share(`${hadith.text}\n\n— ${hadith.source}${hadith.narrator ? ` (عن ${hadith.narrator})` : ""}`)}
            className="text-muted-foreground hover:text-primary transition"
            aria-label="مشاركة"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="font-poem text-sm md:text-base leading-loose text-center text-foreground/95 my-3">
          «{hadith.text}»
        </p>
        <p className="text-[11px] text-center text-primary/80 font-display">
          {hadith.source}{hadith.narrator && ` — عن ${hadith.narrator}`}
        </p>
      </motion.div>
    </div>
  );
};
