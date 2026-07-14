import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import Chatbot from "@/components/Chatbot";
import LiquidGlass from "@/components/LiquidGlass";
import CursorTrail from "@/components/CursorTrail";
import ScrollRing from "@/components/ScrollRing";
import Dish3DViewer from "@/components/Dish3DViewer";
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
import JournalPage from "@/pages/JournalPage";
import SustainabilityPage from "@/pages/SustainabilityPage";
import WaitlistPage from "@/pages/WaitlistPage";
import FeedbackPage from "@/pages/FeedbackPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrdersPage from "@/pages/OrdersPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function GlobalRippleHandler() {
  useEffect(() => {
    const fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            fadeObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".fade-up").forEach((el) => fadeObserver.observe(el));

    const scanFadeUps = () => {
      document.querySelectorAll(".fade-up:not(.in)").forEach((el) => fadeObserver.observe(el));
    };
    const domObserver = new MutationObserver(scanFadeUps);
    domObserver.observe(document.body, { childList: true, subtree: true });

    const rippleHandler = (e) => {
      const btn = e.currentTarget;
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
    const rippleDelegate = (e) => {
      const btn = e.target.closest("button:not(.no-ripple), a:not(.no-ripple)");
      if (btn) rippleHandler({ ...e, currentTarget: btn });
    };
    document.addEventListener("click", rippleDelegate, { capture: true });

    return () => {
      fadeObserver.disconnect();
      domObserver.disconnect();
      document.removeEventListener("click", rippleDelegate, { capture: true });
    };
  }, []);
  return null;
}

function GlobalFeatures() {
  const { muted, toggleMute, volume, changeVolume, playNoise } = useAmbientAudio();
  usePredictivePreload();

  return (
    <>
      <CursorTrail />
      <ScrollRing />
      <Dish3DViewer />
      <AudioMuteBtn muted={muted} onToggle={toggleMute} volume={volume} onChangeVolume={changeVolume} playNoise={playNoise} />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <CartProvider>
            <div className="min-h-screen text-white" style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}>
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
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="/sustainability" element={<SustainabilityPage />} />
                  {restaurantPages.filter((p) => p.to !== "/team" && p.to !== "/journal" && p.to !== "/sustainability").map((page) => (
                    <Route
                      key={page.to}
                      path={page.to}
                      element={<RestaurantInfoPage pageKey={page.key} />}
                    />
                  ))}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={["admin", "manager", "chef", "cashier", "waiter"]}>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
              <Chatbot />
              <GlobalFeatures />
              <Toaster theme="dark" position="top-right" richColors />
            </div>
          </CartProvider>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
