import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, Heart, Library, Compass, ListChecks, NotebookPen, Sparkles, Feather, Star, Instagram, Shield, Settings as SettingsIcon } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { PrayerCard } from "@/components/PrayerCard";
import { DailyAyahCard } from "@/components/DailyAyahCard";
import heroMosque from "@/assets/hero-crescent.jpg";
import logo from "@/assets/app-icon.png";

const FEATURES = [
  { to: "/quran", icon: BookOpen, label: "القرآن الكريم", desc: "السور كاملة بالتلاوة" },
  { to: "/adhkar", icon: Heart, label: "الأذكار والتسبيح", desc: "الصباح والمساء" },
  { to: "/hisn", icon: Shield, label: "حصن المسلم", desc: "كل أبواب الأذكار" },
  { to: "/duas", icon: Sparkles, label: "الأدعية المأثورة", desc: "من القرآن والسنة" },
  { to: "/asma-husna", icon: Star, label: "أسماء الله الحسنى", desc: "٩٩ اسماً بمعانيها" },
  { to: "/books", icon: Library, label: "كتب الحديث", desc: "الصحاح والسنن" },
  { to: "/diwans", icon: Feather, label: "الأدب والدواوين", desc: "شعر العرب والأندلس" },
  { to: "/qibla", icon: Compass, label: "اتجاه القبلة", desc: "بوصلة دقيقة" },
  { to: "/tasks", icon: ListChecks, label: "المهام والعادات", desc: "تتبع يومي" },
  { to: "/journal", icon: NotebookPen, label: "الكُنّاشة", desc: "خواطر وملاحظات" },
  { to: "/settings", icon: SettingsIcon, label: "الإعدادات", desc: "ثيم • خط • إشعارات" },
];

const Index = () => (
  <PageShell>
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative -mx-4 mb-8 overflow-hidden"
    >
      <div className="relative h-80 md:h-[440px]">
        <img
          src={heroMosque}
          alt="هلال أندلسي فوق قصر الحمراء"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920} height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.img
            src={logo}
            alt="ديوان الأندلس"
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 100, damping: 12 }}
            className="w-24 h-24 md:w-28 md:h-28 mb-3 rounded-3xl drop-shadow-[0_0_25px_hsl(var(--primary)/0.6)] animate-float"
            width={512} height={512}
          />

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="font-display text-5xl md:text-7xl gold-text mb-2 tracking-wide"
          >
            دِيوَانُ الأَنْدَلُس
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 1 }}
            className="divider-andalusi w-48 mb-3"
          >
            <Sparkles className="h-3 w-3" />
          </motion.div>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-foreground/80 text-sm md:text-lg max-w-md font-poem leading-relaxed"
          >
            مَجْلِسُكَ لِتَهْذِيبِ النَّفْسِ، تِلَاوَةِ القُرْآنِ،
            <br />
            ومُسَامَرَةِ شُعَرَاءِ العَرَبِ والأَنْدَلُس
          </motion.p>
        </div>
      </div>
    </motion.section>

    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <DailyAyahCard />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <PrayerCard />
      </motion.div>

      <motion.section
        initial="hidden" animate="show"
        variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.4 } } }}
      >
        <div className="text-center mb-5">
          <h2 className="font-display text-2xl gold-text mb-1">أَبْوَابُ الدِّيوَان</h2>
          <div className="divider-andalusi w-32"><span>✦</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {FEATURES.map(({ to, icon: Icon, label, desc }) => (
            <motion.div
              key={to}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
            >
              <Link
                to={to}
                className="group relative block h-full overflow-hidden rounded-2xl p-4 border border-primary/30 bg-gradient-to-br from-card via-card/90 to-secondary/20 shadow-deep hover:shadow-glow hover:border-primary/70 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-1.5 left-1.5 text-primary/40 text-[10px] group-hover:text-primary/80 transition-colors">✦</div>
                <div className="absolute bottom-1.5 right-1.5 text-primary/40 text-[10px] group-hover:text-primary/80 transition-colors">✦</div>
                <div className="relative flex flex-col items-center text-center">
                  <div className="flex items-center justify-center h-16 w-16 mb-3 moorish-arch bg-gradient-to-br from-primary/30 via-primary/15 to-secondary/20 border border-primary/50 shadow-[inset_0_1px_0_hsl(var(--primary-glow)/0.4)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Icon className="h-7 w-7 text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
                  </div>
                  <h3 className="font-display text-sm md:text-base text-foreground mb-1 group-hover:gold-text transition-all">{label}</h3>
                  <p className="text-[10px] md:text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center py-8 space-y-4"
      >
        <div className="divider-andalusi"><span>✦</span></div>
        <p className="text-xs text-muted-foreground font-poem italic">
          «وَمَا اللَّذَّاتُ إِلَّا فِي الكُتُبِ»
        </p>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <motion.a
            href="https://www.instagram.com/o.yex/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-gold/15 border border-primary/40 text-sm text-primary hover:shadow-glow transition-all"
          >
            <Instagram className="h-4 w-4" />
            <span className="font-display">المطور: o.yex</span>
          </motion.a>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 border border-border/40 text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
          >
            <span className="font-display">حول التطبيق</span>
          </Link>
        </div>
        <p className="text-[10px] text-muted-foreground/70">صُنع بـ ♥ في ديوان الأندلس</p>
      </motion.div>
    </div>
  </PageShell>
);

export default Index;
