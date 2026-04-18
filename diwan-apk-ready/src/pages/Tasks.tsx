import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";

interface Task {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

interface Habit {
  id: string;
  name: string;
  log: Record<string, boolean>; // YYYY-MM-DD -> done
}

const today = () => new Date().toISOString().slice(0, 10);

const DEFAULT_HABITS: Habit[] = [
  { id: "fajr", name: "صلاة الفجر في وقتها", log: {} },
  { id: "quran", name: "ورد القرآن", log: {} },
  { id: "adhkar", name: "أذكار الصباح والمساء", log: {} },
  { id: "sadaqah", name: "صدقة اليوم", log: {} },
];

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() => storage.get("tasks", []));
  const [habits, setHabits] = useState<Habit[]>(() => storage.get("habits", DEFAULT_HABITS));
  const [text, setText] = useState("");

  useEffect(() => storage.set("tasks", tasks), [tasks]);
  useEffect(() => storage.set("habits", habits), [habits]);

  const add = () => {
    if (!text.trim()) return;
    setTasks((p) => [{ id: crypto.randomUUID(), text: text.trim(), done: false, createdAt: Date.now() }, ...p]);
    setText("");
  };

  const toggle = (id: string) => setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: string) => setTasks((p) => p.filter((t) => t.id !== id));

  const toggleHabit = (id: string) => {
    const d = today();
    setHabits((p) => p.map((h) => (h.id === id ? { ...h, log: { ...h.log, [d]: !h.log[d] } } : h)));
  };

  const streak = (h: Habit) => {
    let s = 0;
    const dt = new Date();
    while (true) {
      const k = dt.toISOString().slice(0, 10);
      if (h.log[k]) { s++; dt.setDate(dt.getDate() - 1); } else break;
    }
    return s;
  };

  return (
    <PageShell title="المهام والعادات" subtitle="جاهد نفسك يوماً بيوم">
      {/* العادات */}
      <section className="mb-6">
        <h2 className="font-display text-lg gold-text mb-3">عادات يومية</h2>
        <div className="space-y-2">
          {habits.map((h) => {
            const done = h.log[today()];
            const s = streak(h);
            return (
              <motion.button
                key={h.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleHabit(h.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${
                  done ? "bg-secondary/30 border-secondary" : "bg-card/40 border-border/40 hover:border-primary/40"
                }`}
              >
                <div
                  className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                    done ? "bg-gradient-gold shadow-glow" : "border border-primary/30"
                  }`}
                >
                  {done && <Check className="h-5 w-5 text-primary-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm">{h.name}</p>
                  {s > 0 && <p className="text-[11px] text-primary">🔥 {s} يوم متتالي</p>}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* المهام */}
      <section>
        <h2 className="font-display text-lg gold-text mb-3">مهام اليوم</h2>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="أضف مهمة جديدة..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            className="bg-card/50 border-primary/20"
          />
          <Button onClick={add} className="bg-gradient-gold text-primary-foreground shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <AnimatePresence>
          {tasks.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground text-sm py-6">
              لا مهام بعد — أَضِفْ أوَّلَ مَقْصِدٍ لهذا اليوم
            </motion.p>
          )}
          {tasks.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              layout
              className={`flex items-center gap-3 p-3 rounded-xl border mb-2 ${
                t.done ? "bg-muted/30 border-border/30 opacity-60" : "bg-card/50 border-border/40"
              }`}
            >
              <button
                onClick={() => toggle(t.id)}
                className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                  t.done ? "bg-gradient-gold" : "border border-primary/40"
                }`}
              >
                {t.done && <Check className="h-4 w-4 text-primary-foreground" />}
              </button>
              <p className={`flex-1 text-sm ${t.done ? "line-through" : ""}`}>{t.text}</p>
              <button onClick={() => remove(t.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </section>
    </PageShell>
  );
};

export default Tasks;
