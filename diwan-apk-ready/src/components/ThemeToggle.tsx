import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

const KEY = "diwan_theme";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem(KEY) as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
};

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.08, rotate: 12 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)", left: "0.75rem" }}
      className="fixed z-40 h-9 w-9 rounded-full bg-card/80 backdrop-blur-xl border border-primary/40 shadow-glow flex items-center justify-center text-primary hover:bg-card transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -15, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 15, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.25 }}
          className="absolute"
        >
          {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};
