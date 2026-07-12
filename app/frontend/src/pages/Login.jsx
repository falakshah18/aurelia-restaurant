import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

const sparkles = [
  { x: "12%", y: "18%", delay: "0s" },
  { x: "35%", y: "42%", delay: "1.2s" },
  { x: "58%", y: "25%", delay: "2.4s" },
  { x: "22%", y: "65%", delay: "0.6s" },
  { x: "48%", y: "55%", delay: "3.1s" },
  { x: "70%", y: "38%", delay: "1.8s" },
  { x: "15%", y: "80%", delay: "3.8s" },
];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="hsl(38,61%,73%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
    </svg>
  );
}

function Logo() {
  return (
    <div className="mb-10 reveal" style={{ animationDelay: "0ms" }}>
      <div className="mb-4">
        <span className="text-gold text-2xl">✦</span>
      </div>
      <h1 className="font-forum text-3xl gold-shimmer tracking-widest mb-1">AURELIA</h1>
      <p className="text-[9px] tracking-[0.5em] text-gold/50 uppercase">London · Est. 1995</p>
    </div>
  );
}

export default function Login() {
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [activeTab, setActiveTab] = useState("signin");
  const [f, setF] = useState({ email: "", password: "", name: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [eyeFading, setEyeFading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const formRef = useRef(null);
  const timersRef = useRef([]);

  const safeSet = useCallback((fn) => {
    const id = setTimeout(fn, 0);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    setErr("");
    setShake(false);
  }, [activeTab, forgotMode]);

  const handleShowPass = () => {
    setEyeFading(true);
    safeSet(() => {
      setShowPass(!showPass);
      setEyeFading(false);
    }, 100);
  };

  const triggerShake = () => {
    setShake(true);
    safeSet(() => setShake(false), 400);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await login(f.email, f.password);
    setBusy(false);
    if (r.ok) {
      toast.success(`Welcome back, ${r.user.name}`);
      nav(r.user.role === "admin" ? "/admin" : "/");
    } else {
      setErr(r.error || "Invalid credentials. Please try again.");
      triggerShake();
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setForgotSent(true);
      setBusy(false);
    } catch {
      setBusy(false);
      toast.error("Something went wrong.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await register(f.name, f.email, f.password);
    setBusy(false);
    if (r.ok) {
      toast.success("Account created! Welcome to Aurelia.");
      nav(r.user.role === "admin" ? "/admin" : "/");
    } else {
      setErr(r.error || "Registration failed.");
      triggerShake();
    }
  };

  const handleGoogle = () => {
    toast.info("Google sign-in is not configured. Please use email & password.");
  };

  return (
    <div className="min-h-screen pt-20 flex flex-col lg:flex-row">
      {/* ═══ LEFT PANEL — Cinematic Image ═══ */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=85"
          alt=""
          className="absolute inset-0 w-full h-full object-cover login-ken-burns"
        />

        {/* Fog Layer 1: Bottom-to-top gradient */}
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to top, rgba(14,13,12,0.95) 0%, transparent 50%)" }} />

        {/* Fog Layer 2: Right-side feather */}
        <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(to right, transparent 60%, #0E0D0C 100%)" }} />

        {/* Fog Layer 3: Radial vignette */}
        <div className="absolute inset-0 z-[1]" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />

        {/* Floating sparkle particles */}
        <div className="sparkle-container z-[2]">
          {sparkles.map((s, i) => (
            <div key={i} className="sparkle-diamond" style={{ left: s.x, top: s.y, "--delay": s.delay }} />
          ))}
        </div>

        {/* Brand quote — bottom left */}
        <div className="absolute bottom-12 left-12 z-[3] max-w-sm" style={{ animation: "revealUp 800ms ease 600ms both" }}>
          <div className="border-l-2 border-gold pl-4">
            <p className="font-forum text-2xl text-gold italic leading-snug mb-2">
              "Where every dinner<br />becomes a memory."
            </p>
            <p className="text-gold/50 text-xs tracking-[0.3em] uppercase">
              — Aurelia, Est. 1995
            </p>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Form ═══ */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 lg:py-0 bg-[#0E0D0C] relative">
        <div className="login-glow" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10 reveal" style={{ animationDelay: "0ms" }}>
            <span className="text-gold text-2xl">✦</span>
            <Link to="/" className="block font-forum text-3xl text-gold tracking-widest mt-2 gold-shimmer">AURELIA</Link>
            <p className="text-[9px] tracking-[0.5em] text-gold/50 uppercase mt-1">London · Est. 1995</p>
          </div>

          {/* Desktop logo */}
          <div className="hidden lg:block">
            <Logo />
          </div>

          {/* Tab switcher */}
          <div className="flex mb-10 border-b border-[#2A2723]" style={{ animation: "revealUp 800ms ease 100ms both" }}>
            <button
              type="button"
              onClick={() => { setActiveTab("signin"); setForgotMode(false); }}
              className={`flex-1 pb-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 border-b-2 ${
                activeTab === "signin" && !forgotMode
                  ? "border-gold text-gold"
                  : "border-transparent text-white/40 hover:text-white/60"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab("register"); setForgotMode(false); }}
              className={`flex-1 pb-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 border-b-2 ${
                activeTab === "register"
                  ? "border-gold text-gold"
                  : "border-transparent text-white/40 hover:text-white/60"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ═══ FORGOT PASSWORD FLOW ═══ */}
          {forgotMode ? (
            <div className="login-form-card">
              <div className="reveal" style={{ animationDelay: "0ms" }}>
                <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-2">Reset Password</p>
                <h2 className="font-forum text-3xl mb-2">Forgot Password?</h2>
                <p className="text-white/50 text-sm mb-8">
                  {forgotSent
                    ? "Check your inbox for a reset link."
                    : "Enter your email and we'll send a reset link."}
                </p>
              </div>

              {forgotSent ? (
                <div className="reveal text-center py-8" style={{ animationDelay: "200ms" }}>
                  <span className="text-4xl block mb-4">✉️</span>
                  <p className="text-gold text-sm font-bold">Check your inbox</p>
                  <p className="text-white/40 text-xs mt-2">We sent a password reset link to {forgotEmail}</p>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }}
                    className="mt-8 text-gold text-xs tracking-widest uppercase hover:text-gold/80 transition-colors"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-6">
                  <div className="reveal" style={{ animationDelay: "200ms" }}>
                    <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="you@example.com"
                      className="login-input"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-gold btn-gold-solid w-full reveal"
                    style={{ animationDelay: "400ms" }}
                  >
                    <span>{busy ? "Sending..." : "Send Reset Link"}</span>
                  </button>
                  <div className="reveal text-center" style={{ animationDelay: "600ms" }}>
                    <button
                      type="button"
                      onClick={() => setForgotMode(false)}
                      className="text-gold text-xs tracking-widest uppercase hover:text-gold/80 transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : activeTab === "signin" ? (
            /* ═══ SIGN IN FORM ═══ */
            <div className={`login-form-card ${shake ? "login-shake" : ""}`}>
              <div className="reveal" style={{ animationDelay: "100ms" }}>
                <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-2">Welcome Back</p>
                <h2 className="font-forum text-3xl mb-1">Sign In</h2>
                <p className="text-white/50 text-sm mb-8">Enter your credentials to continue.</p>
              </div>

              <form onSubmit={submit} className="space-y-6">
                <div className="reveal" style={{ animationDelay: "400ms" }}>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Email Address</label>
                  <input
                    data-testid="login-email"
                    required
                    type="email"
                    placeholder="you@example.com"
                    className="login-input"
                    value={f.email}
                    onChange={(e) => setF({ ...f, email: e.target.value })}
                  />
                </div>

                <div className="reveal" style={{ animationDelay: "500ms" }}>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Password</label>
                  <div className="relative">
                    <input
                      data-testid="login-password"
                      required
                      type={showPass ? "text" : "password"}
                      placeholder="Enter your password"
                      className="login-input login-input-eye"
                      value={f.password}
                      onChange={(e) => setF({ ...f, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={handleShowPass}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold transition-colors no-ripple"
                    >
                      <span className={`inline-block transition-opacity duration-100 ${eyeFading ? "opacity-0" : "opacity-100"}`}>
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </button>
                  </div>
                </div>

                {err && (
                  <p data-testid="login-error" className="login-error-text reveal" style={{ animationDelay: "0ms" }}>
                    {err}
                  </p>
                )}

                <div className="flex items-center justify-between reveal" style={{ animationDelay: "550ms" }}>
                  <label className="flex items-center gap-2 text-white/50 text-sm cursor-pointer select-none">
                    <input type="checkbox" className="accent-[hsl(38,61%,73%)]" />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setForgotEmail(f.email); }}
                    className="text-gold/70 text-sm hover:text-gold transition-colors no-ripple"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  data-testid="login-submit"
                  disabled={busy}
                  className="btn-gold btn-gold-solid w-full reveal"
                  style={{ animationDelay: "600ms" }}
                >
                  <span className={`inline-flex items-center gap-2 transition-opacity duration-200 ${busy ? "opacity-0" : "opacity-100"}`}>
                    Sign In
                  </span>
                  {busy && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="login-spinner" />
                    </span>
                  )}
                </button>
              </form>

              {/* Or divider */}
              <div className="reveal flex items-center gap-4 my-8" style={{ animationDelay: "700ms" }}>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] whitespace-nowrap">or continue with</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={handleGoogle}
                className="login-google-btn reveal"
                style={{ animationDelay: "800ms" }}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <p className="text-center text-sm text-white/40 mt-8 reveal" style={{ animationDelay: "900ms" }}>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-gold font-bold hover:text-gold/80 transition-colors no-ripple"
                >
                  Create one
                </button>
              </p>
            </div>
          ) : (
            /* ═══ REGISTER FORM ═══ */
            <div className={`login-form-card ${shake ? "login-shake" : ""}`}>
              <div className="reveal" style={{ animationDelay: "100ms" }}>
                <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-2">Join Us</p>
                <h2 className="font-forum text-3xl mb-1">Create Account</h2>
                <p className="text-white/50 text-sm mb-8">Begin your Aurelia journey today.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="reveal" style={{ animationDelay: "200ms" }}>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Your name"
                    className="login-input"
                    value={f.name}
                    onChange={(e) => setF({ ...f, name: e.target.value })}
                  />
                </div>

                <div className="reveal" style={{ animationDelay: "300ms" }}>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="you@example.com"
                    className="login-input"
                    value={f.email}
                    onChange={(e) => setF({ ...f, email: e.target.value })}
                  />
                </div>

                <div className="reveal" style={{ animationDelay: "400ms" }}>
                  <label className="text-xs text-white/50 uppercase tracking-widest block mb-2">Password</label>
                  <div className="relative">
                    <input
                      required
                      type={showPass ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      className="login-input login-input-eye"
                      value={f.password}
                      onChange={(e) => setF({ ...f, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={handleShowPass}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-gold transition-colors no-ripple"
                    >
                      <span className={`inline-block transition-opacity duration-100 ${eyeFading ? "opacity-0" : "opacity-100"}`}>
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </button>
                  </div>
                </div>

                {err && (
                  <p className="login-error-text reveal" style={{ animationDelay: "0ms" }}>
                    {err}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="btn-gold btn-gold-solid w-full reveal"
                  style={{ animationDelay: "600ms" }}
                >
                  <span className={`inline-flex items-center gap-2 transition-opacity duration-200 ${busy ? "opacity-0" : "opacity-100"}`}>
                    Create Account
                  </span>
                  {busy && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="login-spinner" />
                    </span>
                  )}
                </button>
              </form>

              {/* Or divider */}
              <div className="reveal flex items-center gap-4 my-8" style={{ animationDelay: "700ms" }}>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] whitespace-nowrap">or continue with</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                className="login-google-btn reveal"
                style={{ animationDelay: "800ms" }}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>

              <p className="text-center text-sm text-white/40 mt-8 reveal" style={{ animationDelay: "900ms" }}>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className="text-gold font-bold hover:text-gold/80 transition-colors no-ripple"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}

          <div className="mt-12 text-center reveal" style={{ animationDelay: "1000ms" }}>
            <Link to="/" className="text-white/25 text-xs uppercase tracking-widest hover:text-gold transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
