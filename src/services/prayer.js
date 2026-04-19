import { Coordinates, CalculationMethod, PrayerTimes, Qibla, SunnahTimes } from 'https://cdn.jsdelivr.net/npm/adhan@4.4.3/+esm';
export function prayerPack(lat, lng, date = new Date()) {
  const coordinates = new Coordinates(lat, lng);
  const params = CalculationMethod.MuslimWorldLeague();
  const p = new PrayerTimes(coordinates, date, params);
  const s = new SunnahTimes(p);
  return { fajr: p.fajr, sunrise: p.sunrise, dhuhr: p.dhuhr, asr: p.asr, maghrib: p.maghrib, isha: p.isha, qibla: Qibla(coordinates), middleOfTheNight: s.middleOfTheNight, lastThirdOfTheNight: s.lastThirdOfTheNight };
}
export function fmt(date){ return new Intl.DateTimeFormat('ar-DZ', { hour: '2-digit', minute: '2-digit' }).format(date); }
