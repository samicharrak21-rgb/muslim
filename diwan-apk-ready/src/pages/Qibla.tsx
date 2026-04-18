import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Compass as CompassIcon, Locate, Loader2 } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { storage } from "@/lib/storage";
import { ARAB_CITIES, City } from "@/lib/cities";
import { fetchQibla } from "@/lib/prayer";
import { detectAndSaveCity } from "@/lib/geolocation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Qibla = () => {
  const [city, setCity] = useState<City>(() => storage.get("city", ARAB_CITIES[0]));
  const [qibla, setQibla] = useState<number | null>(null);
  const [heading, setHeading] = useState(0);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetchQibla(city.lat, city.lng).then(setQibla).catch(() => {});
  }, [city.lat, city.lng]);

  useEffect(() => {
    const handle = (e: DeviceOrientationEvent) => {
      const alpha = (e as any).webkitCompassHeading ?? (360 - (e.alpha ?? 0));
      setHeading(alpha);
    };
    window.addEventListener("deviceorientation", handle, true);
    return () => window.removeEventListener("deviceorientation", handle, true);
  }, []);

  const requestPermission = async () => {
    const DOE: any = (window as any).DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === "function") {
      try { await DOE.requestPermission(); } catch {}
    }
  };

  const detectLocation = async () => {
    setLocating(true);
    try {
      const c = await detectAndSaveCity();
      if (c) { setCity(c); toast.success(`تم تحديث الموقع: ${c.name}`); }
      else toast.error("تعذّر تحديد الموقع");
    } finally { setLocating(false); }
  };

  const rotation = qibla !== null ? qibla - heading : 0;

  return (
    <PageShell title="اتجاه القبلة" subtitle={`من ${city.name} • ${city.country}`}>
      <div className="flex flex-col items-center py-6">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          <Button onClick={requestPermission} variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/10">
            تفعيل البوصلة
          </Button>
          <Button onClick={detectLocation} disabled={locating} variant="outline" size="sm" className="text-xs border-primary/40">
            {locating ? <Loader2 className="h-3 w-3 ml-1 animate-spin" /> : <Locate className="h-3 w-3 ml-1" />}
            تحديد موقعي
          </Button>
        </div>

        <div className="relative w-72 h-72 md:w-80 md:h-80">
          {/* الإطار الزخرفي */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-glow-pulse" />
          <div className="absolute inset-3 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-6 rounded-full bg-card/60 backdrop-blur-md ornament-border" />

          {/* الاتجاهات */}
          {[
            { l: "ش", t: "top-2 left-1/2 -translate-x-1/2" },
            { l: "ج", t: "bottom-2 left-1/2 -translate-x-1/2" },
            { l: "غ", t: "left-2 top-1/2 -translate-y-1/2" },
            { l: "ق", t: "right-2 top-1/2 -translate-y-1/2" },
          ].map((d) => (
            <span key={d.l} className={`absolute ${d.t} text-primary font-display text-lg`}>{d.l}</span>
          ))}

          {/* السهم */}
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative h-56 w-2">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-r-[14px] border-b-[28px] border-l-transparent border-r-transparent border-b-primary drop-shadow-[0_0_10px_hsl(var(--primary))]" />
              <div className="absolute top-7 bottom-7 left-1/2 -translate-x-1/2 w-1 bg-gradient-to-b from-primary to-primary/30" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-muted-foreground" />
            </div>
          </motion.div>

          {/* مركز */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-gradient-gold shadow-glow" />
        </div>

        <div className="mt-8 text-center space-y-2">
          {qibla !== null ? (
            <>
              <p className="text-3xl font-display gold-text">{Math.round(qibla)}°</p>
              <p className="text-sm text-muted-foreground">من الشمال نحو القبلة</p>
              <CompassIcon className="h-5 w-5 text-primary mx-auto mt-3 animate-float" />
            </>
          ) : (
            <p className="text-muted-foreground">جاري الحساب...</p>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default Qibla;
