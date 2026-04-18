import { NavLink } from "react-router-dom";
import { Home, BookOpen, Compass, ListChecks, Heart, Library } from "lucide-react";
import { motion } from "framer-motion";

const ITEMS = [
  { to: "/", icon: Home, label: "الرئيسية" },
  { to: "/quran", icon: BookOpen, label: "القرآن" },
  { to: "/adhkar", icon: Heart, label: "الأذكار" },
  { to: "/books", icon: Library, label: "الكتب" },
  { to: "/qibla", icon: Compass, label: "القبلة" },
  { to: "/tasks", icon: ListChecks, label: "المهام" },
];

export const BottomNav = () => (
  <motion.nav
    initial={{ y: 80, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
    className="fixed bottom-0 inset-x-0 z-50"
  >
    <div className="mx-auto max-w-3xl px-3 pb-3 pt-2">
      <div className="ornament-border rounded-2xl bg-card/80 backdrop-blur-xl shadow-deep">
        <ul className="flex items-center justify-between px-2 py-2">
          {ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-1.5 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "text-primary bg-primary/10 shadow-glow"
                      : "text-muted-foreground hover:text-primary"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </motion.nav>
);
