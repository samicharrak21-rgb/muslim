import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// تفعيل وضع ملء الشاشة وإخفاء شريط الحالة على الأجهزة (Capacitor)
const initNativeFeatures = async () => {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;

    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const { SplashScreen } = await import("@capacitor/splash-screen");

    // وضع ملء الشاشة الكامل
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0a0e27" });
    await StatusBar.hide();

    // إخفاء شاشة البداية الأصلية فورًا بمجرد جاهزية WebView (شاشة React تتولى البقية)
    await SplashScreen.hide({ fadeOutDuration: 200 });
  } catch {
    // متجاهل: نحن في المتصفح وليس داخل التطبيق
  }
};

initNativeFeatures();

createRoot(document.getElementById("root")!).render(<App />);
