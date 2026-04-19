#!/usr/bin/env bash
set -e
npm install
npx cap add android || true
npx cap sync android
cd android
chmod +x ./gradlew
./gradlew assembleDebug
cd ..
echo "APK path: android/app/build/outputs/apk/debug/app-debug.apk"
