import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { storage } from "@/lib/storage";
import { detectAndSaveCity } from "@/lib/geolocation";
import { startBackgroundPrefetch } from "@/lib/auto-prefetch";
import { initSettings } from "@/lib/settings";
import Index from "./pages/Index";
import Quran from "./pages/Quran";
import Adhkar from "./pages/Adhkar";
import Books from "./pages/Books";
import Qibla from "./pages/Qibla";
import Tasks from "./pages/Tasks";
import Journal from "./pages/Journal";
import Diwans from "./pages/Diwans";
import AsmaHusna from "./pages/AsmaHusna";
import Duas from "./pages/Duas";
import About from "./pages/About";
import Hisn from "./pages/Hisn";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initSettings();
    const hasCity = storage.get<unknown>("city_auto_detected", null);
    if (!hasCity) {
      detectAndSaveCity().then((c) => {
        if (c) storage.set("city_auto_detected", true);
      }).catch(() => {});
    }
    startBackgroundPrefetch();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Toaster />
          <Sonner richColors position="top-center" dir="rtl" />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/quran" element={<Quran />} />
            <Route path="/adhkar" element={<Adhkar />} />
            <Route path="/books" element={<Books />} />
            <Route path="/qibla" element={<Qibla />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/diwans" element={<Diwans />} />
            <Route path="/asma-husna" element={<AsmaHusna />} />
            <Route path="/duas" element={<Duas />} />
            <Route path="/about" element={<About />} />
            <Route path="/hisn" element={<Hisn />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
