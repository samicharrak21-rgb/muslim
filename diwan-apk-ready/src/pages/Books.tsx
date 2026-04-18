import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, BookMarked } from "lucide-react";
import { PageShell } from "@/components/PageShell";

interface Hadith { number: number; arab: string; id?: string }
interface BookData { name: string; id: string; available: number; requested: number; hadiths: Hadith[] }

// كتب من api.hadith.gading.dev
const BOOKS = [
  { id: "bukhari", name: "صحيح البخاري", author: "الإمام البخاري", category: "صحاح" },
  { id: "muslim", name: "صحيح مسلم", author: "الإمام مسلم", category: "صحاح" },
  { id: "tirmidzi", name: "سنن الترمذي", author: "الإمام الترمذي", category: "سنن" },
  { id: "abu-daud", name: "سنن أبي داود", author: "أبو داود السجستاني", category: "سنن" },
  { id: "nasai", name: "سنن النسائي", author: "الإمام النسائي", category: "سنن" },
  { id: "ibnu-majah", name: "سنن ابن ماجه", author: "ابن ماجه القزويني", category: "سنن" },
  { id: "malik", name: "موطأ الإمام مالك", author: "الإمام مالك", category: "موطأ ومسند" },
  { id: "ahmad", name: "مسند الإمام أحمد", author: "الإمام أحمد بن حنبل", category: "موطأ ومسند" },
  { id: "darimi", name: "سنن الدارمي", author: "الإمام الدارمي", category: "سنن" },
];

const PAGE_SIZE = 20;

const Books = () => {
  const [selected, setSelected] = useState<typeof BOOKS[0] | null>(null);
  const [data, setData] = useState<BookData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!selected) return;
    setLoading(true); setError(false); setData(null);
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = start + PAGE_SIZE - 1;
    fetch(`https://api.hadith.gading.dev/books/${selected.id}?range=${start}-${end}`)
      .then((r) => r.json())
      .then((j) => setData(j.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [selected, page]);

  const grouped = BOOKS.reduce((acc, b) => {
    (acc[b.category] = acc[b.category] || []).push(b);
    return acc;
  }, {} as Record<string, typeof BOOKS>);

  if (selected) {
    const totalPages = data ? Math.ceil(data.available / PAGE_SIZE) : 1;
    return (
      <PageShell title={selected.name} subtitle={selected.author}>
        <button onClick={() => { setSelected(null); setPage(1); }} className="flex items-center gap-1 text-sm text-primary mb-4 hover:underline">
          <ChevronLeft className="h-4 w-4" /> العودة للمكتبة
        </button>

        {loading && <p className="text-center text-muted-foreground py-8">جاري تحميل الأحاديث...</p>}
        {error && <p className="text-center text-destructive py-8 text-sm">تعذّر الاتصال. حاول مرة أخرى.</p>}

        {data?.hadiths && data.hadiths.length > 0 && (
          <>
            <p className="text-center text-xs text-primary/70 mb-4">إجمالي الأحاديث: {data.available.toLocaleString("ar-EG")}</p>
            <div className="space-y-3">
              {data.hadiths.map((h, i) => (
                <motion.div
                  key={h.number}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="ornament-border rounded-xl bg-card/50 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <BookMarked className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs text-primary">حديث رقم {h.number}</span>
                  </div>
                  <p className="font-quran text-lg leading-loose text-foreground text-justify">{h.arab}</p>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 py-6">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 rounded-lg bg-card/50 border border-primary/30 text-sm disabled:opacity-40">السابق</button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 rounded-lg bg-card/50 border border-primary/30 text-sm disabled:opacity-40">التالي</button>
            </div>
          </>
        )}
      </PageShell>
    );
  }

  return (
    <PageShell title="المكتبة الإسلامية" subtitle="كتب الحديث والسنة المطهرة">
      {Object.entries(grouped).map(([cat, books]) => (
        <div key={cat} className="mb-6">
          <h2 className="font-display text-lg gold-text mb-3 flex items-center gap-2">
            <span className="text-primary">✦</span> {cat}
          </h2>
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {books.map((b) => (
              <motion.button
                key={b.id}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                onClick={() => setSelected(b)}
                className="text-right p-4 rounded-xl ornament-border bg-card/50 hover:bg-card/80 glow-on-hover"
              >
                <h3 className="font-display text-lg text-foreground mb-1">{b.name}</h3>
                <p className="text-xs text-muted-foreground">{b.author}</p>
              </motion.button>
            ))}
          </motion.div>
        </div>
      ))}
    </PageShell>
  );
};

export default Books;
