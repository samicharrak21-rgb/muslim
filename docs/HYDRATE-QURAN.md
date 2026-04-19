# تعبئة النص الكامل

هذه الحزمة تسلم مشروعاً محلياً نهائياً ومنظماً. ملفات السور جاهزة بالترقيم والهيكلة.
للتعبئة بالنص الكامل، استخدم مصدراً منظماً لملفات JSON الكاملة مثل:
- https://raw.githubusercontent.com/semarketir/quranjson/master/source/surah/surah_1.json
- https://raw.githubusercontent.com/semarketir/quranjson/master/source/surah.json

بعد الجلب، حوّل البنية لتصبح متوافقة مع:
{
  "id": 1,
  "name": "الفاتحة",
  "versesCount": 7,
  "ayahs": ["...", "..."]
}

ثم شغّل:
npm run doctor
npm run build
