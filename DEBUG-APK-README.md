# نسخة Debug APK

هذه الحزمة مجهزة لإخراج نسخة debug قابلة للتثبيت على الهاتف.

## المتطلبات
- Node.js
- Java JDK 17 أو أحدث
- Android SDK

## الأوامر
```bash
chmod +x scripts/build-debug-apk.sh
./scripts/build-debug-apk.sh
```

## مكان ملف التطبيق
بعد نجاح البناء ستجد الملف هنا:
`android/app/build/outputs/apk/debug/app-debug.apk`

## ملاحظات
- نسخة debug مخصصة للتجربة الشخصية.
- لا تحتاج Play Store.
- يتم توقيعها عادة بشهادة debug أثناء البناء.
