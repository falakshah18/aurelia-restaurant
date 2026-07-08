import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import Chatbot from "@/components/Chatbot";
import LiquidGlass from "@/components/LiquidGlass";
import CursorTrail from "@/components/CursorTrail";
import ScrollRing from "@/components/ScrollRing";
import Dish3DViewer from "@/components/Dish3DViewer";
import MoodDetector from "@/components/MoodDetector";
import AudioMuteBtn from "@/components/AudioMuteBtn";
import ProtectedRoute from "@/components/ProtectedRoute";
import useAmbientAudio from "@/hooks/useAmbientAudio";
import usePredictivePreload from "@/hooks/usePredictivePreload";
import Home from "@/pages/Home";
import MenuPage from "@/pages/MenuPage";
import About from "@/pages/About";
import Reserve from "@/pages/Reserve";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Admin from "@/pages/Admin";
import TeamPage from "@/pages/TeamPage";
import RestaurantInfoPage, { restaurantPages } from "@/pages/RestaurantInfoPage";
import WaitlistPage from "@/pages/WaitlistPage";
import FeedbackPage from "@/pages/FeedbackPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function GlobalRippleHandler() {
  useEffect(() => {
    const handler = (e) => {
      const btn = e.currentTarget;
      if (btn.classList.contains("ripple")) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple-wave";
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    };
    const observer = new MutationObserver(() => {
      document.querySelectorAll("button:not(.no-ripple), a:not(.no-ripple)").forEach((el) => {
        if (!el.dataset.rippleAttached) {
          el.dataset.rippleAttached = "1";
          el.classList.add("ripple");
          el.addEventListener("click", handler);
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll("button:not(.no-ripple), a:not(.no-ripple)").forEach((el) => {
      if (!el.dataset.rippleAttached) {
        el.dataset.rippleAttached = "1";
        el.classList.add("ripple");
        el.addEventListener("click", handler);
      }
    });
    return () => observer.disconnect();
  }, []);
  return null;
}

function GlobalFeatures() {
  const { muted, toggleMute } = useAmbientAudio();
  usePredictivePreload();

  return (
    <>
      <CursorTrail />
      <ScrollRing />
      <Dish3DViewer />
      <MoodDetector />
      <AudioMuteBtn muted={muted} onToggle={toggleMute} />
    </>
  );
}

function ThemeDots() {
  const { theme, switchTheme, themes } = useTheme();
  if (!themes) return null;
  return (
    <div className="theme-switcher">
      {themes.map((t) => (
        <button
          key={t.label}
          onClick={() => switchTheme(t.label)}
          className={`theme-dot ${theme.label === t.label ? "active" : ""}`}
          style={{
            backgroundColor: t.vars["--gold"],
          }}
          title={t.label}
        />
      ))}
      <button
        onClick={() => switchTheme("auto")}
        className="theme-dot"
        style={{ borderStyle: "dashed" }}
        title="Auto"
      >
        <span style={{ fontSize: 10, display: "grid", placeItems: "center", width: "100%", height: "100%" }}>A</span>
      </button>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <div id="theme-root" className="min-h-screen text-white" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
            <LiquidGlass />
            <GlobalRippleHandler />
            <Preloader />
            <Navbar />
            <ScrollToTop />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/reserve" element={<Reserve />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/waitlist" element={<WaitlistPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
                {restaurantPages.filter((p) => p.to !== "/team").map((page) => (
                  <Route
                    key={page.to}
                    path={page.to}
                    element={<RestaurantInfoPage pageKey={page.key} />}
                  />
                ))}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <Chatbot />
            <GlobalFeatures />
            <ThemeDots />
            <Toaster theme="dark" position="top-right" richColors />
          </div>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
