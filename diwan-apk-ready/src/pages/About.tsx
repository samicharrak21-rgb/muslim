import { motion } from "framer-motion";
import { Instagram, Github, Heart, Code2, Sparkles, BookOpen } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import logo from "@/assets/app-icon.png";

const FEATURES = [
  { icon: BookOpen, text: "القرآن الكريم بـ 10 قراء" },
  { icon: Heart, text: "أذكار الصباح والمساء كاملة" },
  { icon: Sparkles, text: "أسماء الله الحسنى" },
  { icon: Code2, text: "كتب الحديث الصحيحة" },
];

const About = () => (
  <PageShell title="حول التطبيق" subtitle="ديوان الأندلس">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-8"
    >
      <motion.img
        src={logo}
        alt="ديوان الأندلس"
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 mx-auto mb-4 rounded-2xl drop-shadow-[0_0_25px_hsl(var(--primary)/0.6)]"
        width={512}
        height={512}
      />
      <h2 className="font-display text-3xl gold-text mb-2">دِيوَانُ الأَنْدَلُس</h2>
      <p className="text-sm text-muted-foreground">الإصدار 1.0.0</p>
      <div className="divider-andalusi w-32 mt-4"><span>✦</span></div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="ornament-border rounded-2xl bg-card/50 p-5 mb-6"
    >
      <h3 className="font-display text-lg text-primary mb-3">رسالة التطبيق</h3>
      <p className="text-sm text-foreground/80 leading-loose font-poem">
        تطبيق إسلامي وأدبي شامل يجمع بين تلاوة القرآن، الأذكار، الأدعية،
        كتب الحديث، أسماء الله الحسنى، ودواوين الشعر العربي والأندلسي.
        صُمّم بروح أندلسية كلاسيكية ليكون جليسًا لروحك وعقلك.
      </p>
    </motion.div>

    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
      className="grid grid-cols-2 gap-3 mb-6"
    >
      {FEATURES.map(({ icon: Icon, text }, i) => (
        <motion.div
          key={i}
          variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }}
          className="flex items-center gap-2 p-3 rounded-xl bg-card/40 border border-primary/20"
        >
          <Icon className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs text-foreground/80">{text}</span>
        </motion.div>
      ))}
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="ornament-border rounded-2xl bg-card/50 p-5 mb-6 text-center"
    >
      <h3 className="font-display text-lg gold-text mb-3">المطور</h3>
      <p className="text-sm text-foreground/80 mb-4">صُنع بـ ♥ من قِبَل</p>

      <a
        href="https://www.instagram.com/o.yex/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-gold/20 border border-primary/40 text-primary hover:shadow-glow transition-all"
      >
        <Instagram className="h-4 w-4" />
        <span className="font-display">o.yex</span>
      </a>

      <p className="mt-4 text-[11px] text-muted-foreground/70">
        لأي اقتراح أو ملاحظة، تواصل معنا عبر إنستغرام
      </p>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="text-center text-xs text-muted-foreground/70 py-4"
    >
      <div className="divider-andalusi w-24 mb-3"><span>✦</span></div>
      <p>© 2026 ديوان الأندلس — جميع الحقوق محفوظة</p>
    </motion.div>
  </PageShell>
);

export default About;
