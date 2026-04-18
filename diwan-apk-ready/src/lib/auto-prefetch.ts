// تنزيل المحتوى تلقائياً في الخلفية عند تشغيل التطبيق — بدون أي UI أو سؤال
import { downloadFullQuran, isQuranDownloaded } from "./quran-downloader";
import { storage } from "./storage";

let started = false;

// يبدأ التحميل تلقائياً بعد ثانية واحدة من التشغيل
// يعمل بصمت في الخلفية، التطبيق يبقى صالحاً للاستخدام
export const startBackgroundPrefetch = () => {
  if (started) return;
  started = true;

  setTimeout(async () => {
    try {
      const ready = await isQuranDownloaded();
      if (ready) {
        storage.set("quran_offline_ready", true);
        return;
      }

      // اعمل بصمت — لا تفعل شيئاً يظهر للمستخدم
      await downloadFullQuran(
        (p) => {
          // احفظ التقدم محلياً (يمكن لصفحة "حول" قراءته)
          storage.set("prefetch_progress", { done: p.done, total: p.total, phase: p.phase });
        }
      );
      storage.set("quran_offline_ready", true);
    } catch {
      // تجاهل بصمت — سيُحاول مرة أخرى في التشغيل القادم
    }
  }, 1500);
};
