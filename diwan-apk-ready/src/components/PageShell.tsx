import { motion } from "framer-motion";
import { ReactNode } from "react";
import patternBg from "@/assets/app-background.jpg";
import { BottomNav } from "./BottomNav";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideThemeToggle?: boolean;
}

export const PageShell = ({ children, title, subtitle, hideThemeToggle }: Props) => (
  <div className="min-h-[100dvh] w-screen relative pb-28 m-0">
    {/* طبقة الزخرفة الأندلسية — تظهر فقط عند اختيار خلفية "andalusi" */}
    <div
      className="fixed inset-0 opacity-[0.08] pointer-events-none andalusi-overlay"
      style={{
        backgroundImage: `url(${patternBg})`,
        backgroundSize: "500px",
        backgroundRepeat: "repeat",
      }}
      aria-hidden
    />
    {/* وميض ذهبي خفيف في الأعلى — يبقى مع كل الخلفيات */}
    <div
      className="fixed top-0 inset-x-0 h-64 pointer-events-none opacity-30"
      style={{ background: "radial-gradient(ellipse at top, hsl(var(--primary) / 0.15), transparent 70%)" }}
      aria-hidden
    />

    <div className="relative z-10">
      {(title || subtitle) && (
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-8 pb-6 px-4"
        >
          {title && <h1 className="font-display text-3xl md:text-4xl gold-text mb-2">{title}</h1>}
          {subtitle && <p className="text-muted-foreground text-sm md:text-base">{subtitle}</p>}
          <div className="divider-andalusi w-32 mt-3"><span>✦</span></div>
        </motion.header>
      )}
      <main className="container max-w-3xl px-4">{children}</main>
    </div>

    {!hideThemeToggle && <ThemeToggle />}
    <BottomNav />
  </div>
);
