import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { storage } from "@/lib/storage";

interface Note {
  id: string;
  title: string;
  body: string;
  date: number;
}

const Journal = () => {
  const [notes, setNotes] = useState<Note[]>(() => storage.get("notes", []));
  const [editing, setEditing] = useState<Note | null>(null);

  useEffect(() => storage.set("notes", notes), [notes]);

  const newNote = () => setEditing({ id: crypto.randomUUID(), title: "", body: "", date: Date.now() });
  const save = () => {
    if (!editing) return;
    if (!editing.title.trim() && !editing.body.trim()) { setEditing(null); return; }
    setNotes((p) => {
      const without = p.filter((n) => n.id !== editing.id);
      return [{ ...editing, date: Date.now() }, ...without];
    });
    setEditing(null);
  };
  const remove = (id: string) => setNotes((p) => p.filter((n) => n.id !== id));

  if (editing) {
    return (
      <PageShell title="كُنّاشة جديدة" subtitle="دوّن خاطرة">
        <div className="ornament-border rounded-2xl bg-card/60 p-4 space-y-3">
          <Input
            placeholder="العنوان..."
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            className="bg-transparent border-primary/20 text-lg font-display"
          />
          <Textarea
            placeholder="اكتب خاطرتك هنا..."
            value={editing.body}
            onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            rows={12}
            className="bg-transparent border-primary/20 leading-loose"
          />
          <div className="flex gap-2">
            <Button onClick={save} className="bg-gradient-gold text-primary-foreground flex-1">
              <Save className="h-4 w-4 ml-2" /> حفظ
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>إلغاء</Button>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="الكُنّاشة" subtitle="دفتر خواطرك الأندلسي">
      <Button onClick={newNote} className="w-full bg-gradient-gold text-primary-foreground mb-4">
        <Plus className="h-4 w-4 ml-2" /> خاطرة جديدة
      </Button>

      <AnimatePresence>
        {notes.length === 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground text-sm py-8">
            كُنّاشتك فارغة — ابدأ بالتدوين
          </motion.p>
        )}

        <div className="space-y-3">
          {notes.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="ornament-border rounded-xl bg-card/50 p-4 group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-display text-lg text-foreground flex-1 cursor-pointer" onClick={() => setEditing(n)}>
                  {n.title || "بلا عنوان"}
                </h3>
                <button onClick={() => remove(n.id)} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {n.body && <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{n.body}</p>}
              <p className="text-[11px] text-primary/70 mt-2">
                {new Date(n.date).toLocaleDateString("ar-EG", { dateStyle: "medium" })}
              </p>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </PageShell>
  );
};

export default Journal;
