// قائمة المؤذنين المتوفرين مع روابط CDN موثوقة
export type AdhanVoiceId = "mishary" | "abdulbasit" | "makkah" | "madinah";

export interface AdhanVoice {
  id: AdhanVoiceId;
  name: string;
  desc: string;
  /** يُجرَّب بالترتيب — أول مصدر يعمل يُستخدم */
  sources: string[];
}

export const ADHAN_VOICES: Record<AdhanVoiceId, AdhanVoice> = {
  mishary: {
    id: "mishary",
    name: "مشاري راشد العفاسي",
    desc: "أذان كامل بصوت العفاسي",
    sources: [
      "https://www.islamcan.com/audio/adhan/azan2.mp3",
      "https://server8.mp3quran.net/afs/Almuaiqly128kbps/001.mp3",
    ],
  },
  abdulbasit: {
    id: "abdulbasit",
    name: "عبد الباسط عبد الصمد",
    desc: "أذان مرتل تقليدي",
    sources: [
      "https://www.islamcan.com/audio/adhan/azan1.mp3",
    ],
  },
  makkah: {
    id: "makkah",
    name: "أذان الحرم المكي",
    desc: "بصوت الشيخ علي ملا",
    sources: [
      "https://www.islamcan.com/audio/adhan/azan3.mp3",
    ],
  },
  madinah: {
    id: "madinah",
    name: "أذان الحرم النبوي",
    desc: "من المسجد النبوي الشريف",
    sources: [
      "https://www.islamcan.com/audio/adhan/azan4.mp3",
    ],
  },
};

export const getVoice = (id: string): AdhanVoice =>
  ADHAN_VOICES[id as AdhanVoiceId] ?? ADHAN_VOICES.mishary;
