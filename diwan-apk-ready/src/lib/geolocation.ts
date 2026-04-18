// تحديد الموقع التلقائي (Capacitor + Web Geolocation fallback)
import { storage } from "./storage";
import { ARAB_CITIES, City } from "./cities";

export interface DetectedLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
}

const LOCATION_KEY = "auto_location";

// أقرب مدينة عربية معروفة لإحداثيات معطاة
export const findNearestCity = (lat: number, lng: number): City => {
  let best = ARAB_CITIES[0];
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of ARAB_CITIES) {
    const dLat = c.lat - lat;
    const dLng = c.lng - lng;
    const d = dLat * dLat + dLng * dLng;
    if (d < bestDist) { bestDist = d; best = c; }
  }
  return best;
};

// محاولة الحصول على الموقع — يستخدم Capacitor إن كان متاحاً
export const getCurrentLocation = async (): Promise<DetectedLocation | null> => {
  // Capacitor (Android/iOS)
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { Geolocation } = await import("@capacitor/geolocation");
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== "granted") {
        const req = await Geolocation.requestPermissions();
        if (req.location !== "granted") return null;
      }
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 15000,
      });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude };
    }
  } catch {
    // continue to web fallback
  }

  // Web Geolocation
  if (typeof navigator !== "undefined" && navigator.geolocation) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60 * 60 * 1000 }
      );
    });
  }
  return null;
};

// كاش الموقع المكتشف
export const getCachedLocation = (): DetectedLocation | null =>
  storage.get<DetectedLocation | null>(LOCATION_KEY, null);

export const setCachedLocation = (loc: DetectedLocation) =>
  storage.set(LOCATION_KEY, loc);

// كشف وحفظ + إرجاع أقرب مدينة
export const detectAndSaveCity = async (): Promise<City | null> => {
  const loc = await getCurrentLocation();
  if (!loc) return null;
  const city = findNearestCity(loc.lat, loc.lng);
  // نخصص الإحداثيات الفعلية للجهاز للحصول على دقة أكبر
  const enriched: City = { ...city, lat: loc.lat, lng: loc.lng };
  setCachedLocation({ ...loc, city: city.name, country: city.country });
  storage.set("city", enriched);
  return enriched;
};
