# ديوان الأندلس — Diwan Al-Andalus

تطبيق إسلامي وأدبي شامل يجمع بين القرآن الكريم، الأذكار، الأدعية، كتب الحديث، أسماء الله الحسنى، ودواوين الشعر العربي والأندلسي.

## خطوات بناء APK

### المتطلبات
- Node.js 20+
- Java JDK 17
- Android Studio + Android SDK

### الخطوات

```bash
# 1. تثبيت المكتبات
npm install --legacy-peer-deps

# 2. بناء التطبيق
npm run build

# 3. تثبيت Capacitor CLI
npm install -g @capacitor/cli

# 4. إضافة منصة Android (مرة واحدة فقط)
npx cap add android

# 5. مزامنة الملفات
npx cap sync android

# 6. بناء APK
cd android
chmod +x gradlew
./gradlew assembleDebug

# الملف سيكون في:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### GitHub Actions
يوجد ملف `.github/workflows/build-apk.yml` جاهز لبناء APK تلقائياً عند كل push.

### توقيع APK للنشر على Google Play
أضف هذه الـ Secrets في إعدادات مستودع GitHub:
- `KEYSTORE_BASE64`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

ثم فعّل الجزء المعلّق في ملف workflow.
