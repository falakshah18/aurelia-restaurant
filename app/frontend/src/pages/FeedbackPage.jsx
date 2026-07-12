import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Star, Heart, Send, MessageCircle } from "lucide-react";

function FadeUp({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in"); obs.unobserve(el); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`fade-up ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const moods = [
  { value: "exceptional", emoji: "😍", label: "Exceptional", color: "#FFD700", desc: "Beyond expectations" },
  { value: "good", emoji: "😊", label: "Great", color: "#7EB57E", desc: "Really enjoyed it" },
  { value: "neutral", emoji: "😐", label: "Okay", color: "#B5A642", desc: "It was fine" },
  { value: "disappointed", emoji: "😕", label: "Disappointed", color: "#E8A87C", desc: "Not what I expected" },
  { value: "unsatisfied", emoji: "😞", label: "Unsatisfied", color: "#C97070", desc: "Needs improvement" },
];

const aspects = [
  { key: "food", label: "Food Quality", icon: "🍽" },
  { key: "service", label: "Service", icon: "🤝" },
  { key: "ambience", label: "Ambience", icon: "✨" },
  { key: "value", label: "Value for Money", icon: "💎" },
  { key: "beverage", label: "Beverage Selection", icon: "🥤" },
];

const recommendOptions = [
  { value: "absolutely", label: "Absolutely!", icon: "💯", color: "#7EB57E" },
  { value: "probably", label: "Probably", icon: "👍", color: "#B5A642" },
  { value: "not_sure", label: "Not Sure", icon: "🤔", color: "#E8A87C" },
  { value: "no", label: "No", icon: "👎", color: "#C97070" },
];

function StarRating({ rating, hovered, onRate, onHover, onLeave }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || rating);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            onMouseEnter={() => onHover(star)}
            onMouseLeave={onLeave}
            className="cursor-pointer transition-all duration-200 hover:scale-125 active:scale-95"
          >
            <Star
              size={28}
              stroke="hsl(38,61%,73%)"
              fill={filled ? "hsl(38,61%,73%)" : "none"}
              strokeWidth={1.5}
              className={`transition-all duration-200 ${filled ? "drop-shadow-[0_0_6px_rgba(228,197,144,0.5)]" : "opacity-30"}`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function FeedbackPage() {
  const [step, setStep] = useState(1);
  const [overall, setOverall] = useState(null);
  const [ratings, setRatings] = useState({
    food: 0, service: 0, ambience: 0, value: 0, beverage: 0,
  });
  const [hoveredStar, setHoveredStar] = useState({ aspect: null, star: 0 });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [comments, setComments] = useState("");
  const [recommend, setRecommend] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const setRating = (aspect, val) => setRatings((prev) => ({ ...prev, [aspect]: val }));

  const handleDateChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return setDate(digits);
    if (digits.length <= 4) return setDate(digits.slice(0, 2) + "-" + digits.slice(2));
    setDate(digits.slice(0, 2) + "-" + digits.slice(2, 4) + "-" + digits.slice(4));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/feedback", { overall, ratings, name, email, date, comments, recommend, source: "web" });
      toast.success("Thank you for your feedback — it means the world to us.");
      setDone(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="pt-40 pb-24 min-h-screen grid place-items-center">
        <div className="text-center max-w-lg px-6">
          <FadeUp>
            <div className="relative inline-block mb-8">
              <div className="text-8xl animate-bounce">🙏</div>
              <div className="absolute -top-2 -right-2 text-2xl animate-ping" style={{ animationDuration: "2s" }}>✨</div>
              <div className="absolute -bottom-1 -left-3 text-xl animate-pulse">💛</div>
            </div>
            <h1 className="font-forum text-6xl gold-shimmer mb-6">Thank You</h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Your feedback helps us refine every detail of your experience. We read every word and cherish every insight.
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-16 bg-[#2A2723]" />
              <span className="diamond" />
              <span className="h-px w-16 bg-[#2A2723]" />
            </div>
          </FadeUp>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-36 pb-24 min-h-screen">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden mb-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=85"
            alt=""
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E0D0C]/60 via-[#0E0D0C]/80 to-[#0E0D0C]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <FadeUp>
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Share Your Experience</p>
            <h1 className="font-forum text-6xl sm:text-8xl gold-shimmer mb-6">We Value<br />Your Voice</h1>
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="h-px w-16 bg-[#2A2723]" />
              <span className="diamond" />
              <span className="h-px w-16 bg-[#2A2723]" />
            </div>
            <p className="text-white/50 max-w-xl mx-auto text-lg leading-relaxed">
              Every detail matters to us. Your thoughts help us craft a better experience for every guest who walks through our doors.
            </p>
          </FadeUp>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6">

        {/* ═══ PROGRESS STEPS ═══ */}
        <FadeUp className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[
              { n: 1, label: "Mood", icon: "😊" },
              { n: 2, label: "Ratings", icon: "⭐" },
              { n: 3, label: "Details", icon: "📝" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-4">
                <button
                  onClick={() => s.n <= step && setStep(s.n)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase border transition-all duration-300 ${
                    step === s.n
                      ? "bg-gold text-[#0E0D0C] border-gold"
                      : step > s.n
                      ? "bg-gold/20 text-gold border-gold/40"
                      : "bg-transparent text-white/30 border-[#2A2723]"
                  }`}
                >
                  <span className="text-base">{s.icon}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < 2 && <div className={`w-8 h-px ${step > s.n ? "bg-gold" : "bg-[#2A2723]"} transition-colors duration-500`} />}
              </div>
            ))}
          </div>
        </FadeUp>

        <form onSubmit={submit} className="space-y-10">

          {/* ═══ STEP 1: MOOD ═══ */}
          {step === 1 && (
            <FadeUp>
              <div className="bg-[#161412] border border-[#2A2723] p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                <div className="text-center mb-8">
                  <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-3">Step 1 of 3</p>
                  <h2 className="font-forum text-3xl mb-2">How was your visit?</h2>
                  <p className="text-white/40 text-sm">Select the emotion that best captures your experience.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {moods.map((m) => {
                    const selected = overall === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => { setOverall(m.value); setStep(2); }}
                        className={`flex flex-col items-center gap-3 px-6 py-8 rounded-xl border transition-all duration-500 cursor-pointer min-w-[120px] group ${
                          selected
                            ? "border-gold bg-gold/10 scale-110 shadow-[0_0_30px_rgba(228,197,144,0.2)]"
                            : "border-[#2A2723] bg-[#0E0D0C] hover:border-gold/50 hover:bg-[#1A1816] hover:scale-105"
                        }`}
                      >
                        <span className={`text-5xl transition-transform duration-500 ${selected ? "scale-125" : "group-hover:scale-110"}`}>
                          {m.emoji}
                        </span>
                        <span className={`text-xs uppercase tracking-widest font-bold ${selected ? "text-gold" : "text-white/50"}`}>
                          {m.label}
                        </span>
                        <span className="text-[10px] text-white/25">{m.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </FadeUp>
          )}

          {/* ═══ STEP 2: RATINGS ═══ */}
          {step === 2 && (
            <FadeUp>
              <div className="bg-[#161412] border border-[#2A2723] p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                <div className="text-center mb-8">
                  <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-3">Step 2 of 3</p>
                  <h2 className="font-forum text-3xl mb-2">Rate each aspect</h2>
                  <p className="text-white/40 text-sm">Click the stars to rate your experience in each area.</p>
                </div>

                <div className="space-y-1">
                  {aspects.map((a) => (
                    <div key={a.key} className="flex items-center justify-between px-4 py-5 border-b border-[#2A2723] last:border-0 hover:bg-[#0E0D0C]/50 transition-colors rounded-lg group">
                      <div className="flex items-center gap-3">
                        <span className="text-xl group-hover:scale-110 transition-transform">{a.icon}</span>
                        <span className="text-sm text-white/70">{a.label}</span>
                      </div>
                      <StarRating
                        rating={ratings[a.key]}
                        hovered={hoveredStar.aspect === a.key ? hoveredStar.star : 0}
                        onRate={(v) => setRating(a.key, v)}
                        onHover={(s) => setHoveredStar({ aspect: a.key, star: s })}
                        onLeave={() => setHoveredStar({ aspect: null, star: 0 })}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <button type="button" onClick={() => setStep(1)} className="text-white/40 text-xs tracking-widest uppercase hover:text-gold transition-colors">
                    ← Back
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="btn-gold btn-gold-solid">
                    <span>Continue</span>
                  </button>
                </div>
              </div>
            </FadeUp>
          )}

          {/* ═══ STEP 3: DETAILS ═══ */}
          {step === 3 && (
            <>
              <FadeUp>
                <div className="bg-[#161412] border border-[#2A2723] p-8 sm:p-10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                  <div className="text-center mb-8">
                    <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-3">Step 3 of 3</p>
                    <h2 className="font-forum text-3xl mb-2">Any final thoughts?</h2>
                    <p className="text-white/40 text-sm">Share details to help us understand your experience better.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Your Name</label>
                        <input
                          type="text"
                          placeholder="Optional"
                          className="bg-[#0E0D0C] border border-[#2A2723] px-5 py-3 text-white placeholder-white/30 focus:border-gold focus:outline-none transition-colors w-full"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Email (for follow-up)</label>
                        <input
                          type="email"
                          placeholder="Optional"
                          className="bg-[#0E0D0C] border border-[#2A2723] px-5 py-3 text-white placeholder-white/30 focus:border-gold focus:outline-none transition-colors w-full"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Date of Visit</label>
                      <input
                        type="text"
                        placeholder="dd-mm-yyyy"
                        className="bg-[#0E0D0C] border border-[#2A2723] px-5 py-3 text-white placeholder-white/30 focus:border-gold focus:outline-none transition-colors w-full"
                        value={date}
                        onChange={handleDateChange}
                        maxLength={10}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Your Comments</label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about your experience — what stood out, what could improve..."
                        className="bg-[#0E0D0C] border border-[#2A2723] px-5 py-3 text-white placeholder-white/30 focus:border-gold focus:outline-none transition-colors w-full resize-none"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/40 uppercase tracking-widest mb-4 block">Would you recommend Aurelia?</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {recommendOptions.map((opt) => {
                          const active = recommend === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setRecommend(opt.value)}
                              className={`py-4 px-4 rounded-xl border text-center transition-all duration-300 cursor-pointer group ${
                                active
                                  ? "border-gold bg-gold/10 scale-105 shadow-[0_0_20px_rgba(228,197,144,0.15)]"
                                  : "border-[#2A2723] bg-[#0E0D0C] hover:border-gold/50 hover:scale-105"
                              }`}
                            >
                              <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{opt.icon}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? "text-gold" : "text-white/40"}`}>
                                {opt.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeUp>

              <FadeUp>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <button type="button" onClick={() => setStep(2)} className="text-white/40 text-xs tracking-widest uppercase hover:text-gold transition-colors order-2 sm:order-1">
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold btn-gold-solid w-full sm:w-auto group flex items-center justify-center gap-3 order-1 sm:order-2"
                  >
                    <span>{submitting ? "Submitting..." : "Submit Feedback"}</span>
                    {!submitting && <Send size={16} className="group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
              </FadeUp>
            </>
          )}
        </form>

        {/* ═══ TRUST INDICATORS ═══ */}
        <FadeUp delay={200}>
          <div className="mt-16 grid grid-cols-3 gap-6 text-center">
            {[
              { icon: <Shield size={18} />, text: "Your data is secure" },
              { icon: <Heart size={18} />, text: "We read every review" },
              { icon: <MessageCircle size={18} />, text: "Response within 24h" },
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-gold/40">{t.icon}</span>
                <span className="text-white/25 text-[10px] uppercase tracking-widest">{t.text}</span>
              </div>
            ))}
          </div>
        </FadeUp>
      </div>
    </div>
  );
}

function Shield({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
