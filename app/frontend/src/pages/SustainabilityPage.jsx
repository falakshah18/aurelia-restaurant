import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const FadeUp = ({ children, delay = 0, className = "" }) => {
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
};

const commitments = [
  { icon: "◆", stat: "87%", label: "Ingredients sourced within 100 km", detail: "Weekly deliveries from farms in Gujarat, Rajasthan, and Maharashtra reduce transport emissions significantly." },
  { icon: "◇", stat: "Zero", label: "Single-use plastic in kitchen", detail: "We switched to compostable wrap, reusable containers, and bulk purchasing to eliminate plastic from our prep." },
  { icon: "◆", stat: "3 ton", label: "Food waste composted monthly", detail: "All vegetable trimmings, coffee grounds, and bread ends are collected by our composting partner weekly." },
  { icon: "◇", stat: "40%", label: "Reduction in water use since 2020", detail: "Low-flow fixtures, vegetable-wash recycling, and rainwater harvesting cut our consumption almost in half." },
  { icon: "◆", stat: "100%", label: "Renewable energy by 2027", detail: "Solar panels on the rooftop now cover 65% of our electricity needs. Full transition is planned within eighteen months." },
  { icon: "◇", stat: "2.1 ton", label: "CO₂ offset annually", detail: "Tree-planting credits and local sourcing offsets cover our remaining footprint while we work toward net zero." },
];

const suppliers = [
  { name: "Green Valley Organic Farm", location: "Anand, Gujarat", km: 85, specialty: "Seasonal vegetables, microgreens, edible flowers", img: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=600&q=85" },
  { name: "Malhar Artisan Cheese", location: "Pune, Maharashtra", km: 420, specialty: "Handmade ricotta, burrata, aged pecorino", img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&q=85" },
  { name: "Heritage Grain Mill", location: "Jaipur, Rajasthan", km: 340, specialty: "Stone-ground flour, ancient wheat, semolina", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=85" },
  { name: "Spice Route Collective", location: "Kutch, Gujarat", km: 460, specialty: "Single-origin turmeric, cumin, coriander, chili", img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=85" },
  { name: "Sunrise Olive Estate", location: "Gir, Gujarat", km: 380, specialty: "Cold-pressed extra virgin olive oil, table olives", img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=85" },
  { name: "Riverside Citrus Grove", location: "Nashik, Maharashtra", km: 500, specialty: "Blood oranges, kumquats, Meyer lemons, yuzu", img: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600&q=85" },
];

const seasonalCalendar = [
  { month: "Jan", produce: ["Blood Orange", "Kumquat", "Winter Greens", "Beetroot"], color: "#E8A87C" },
  { month: "Feb", produce: ["Meyer Lemon", "Turnip", "Fennel", "Purple Carrot"], color: "#D4AF37" },
  { month: "Mar", produce: ["Spring Pea", "Asparagus", "Radish", "Fresh Herb"], color: "#7EB57E" },
  { month: "Apr", produce: ["Artichoke", "Ramp", "Morel", "Nettle"], color: "#98D4A6" },
  { month: "May", produce: ["Strawberry", "Fava Bean", "Zucchini Flower", "Basil"], color: "#E07A7A" },
  { month: "Jun", produce: ["Heirloom Tomato", "Corn", "Bell Pepper", "Eggplant"], color: "#E07A5F" },
  { month: "Jul", produce: ["Monsoon Greens", "Jackfruit", "Taro Leaf", "Green Chili"], color: "#4A9E7B" },
  { month: "Aug", produce: ["Mango", "Ridge Gourd", "Drumstick", "Curry Leaf"], color: "#F0C040" },
  { month: "Sep", produce: ["Fig", "Pear", "Amaranth", "Sweet Potato"], color: "#C4954A" },
  { month: "Oct", produce: ["Pumpkin", "Pomegranate", "Cauliflower", "Okra"], color: "#D4652F" },
  { month: "Nov", produce: ["Carrot", "Spinach", "Mustard Green", "Ginger"], color: "#8B6914" },
  { month: "Dec", produce: ["Guava", "Peanut", "Fenugreek", "Sweet Lime"], color: "#6B8E5A" },
];

function CountUp({ end, suffix = "", duration = 2000 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rafId;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const step = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 4);
            setVal(Math.round(ease * end));
            if (t < 1) rafId = requestAnimationFrame(step);
          };
          rafId = requestAnimationFrame(step);
          obs.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => { obs.disconnect(); if (rafId) cancelAnimationFrame(rafId); };
  }, [end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export default function SustainabilityPage() {
  const [activeMonth, setActiveMonth] = useState(new Date().getMonth());

  return (
    <div className="pt-36 pb-24 min-h-screen">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden mb-24">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1600&q=85"
            alt=""
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E0D0C]/50 via-[#0E0D0C]/80 to-[#0E0D0C]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <FadeUp>
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Sustainability & Sourcing</p>
            <h1 className="font-forum text-6xl sm:text-8xl gold-shimmer mb-6">From Soil<br />To Plate</h1>
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="h-px w-16 bg-[#2A2723]" />
              <span className="diamond" />
              <span className="h-px w-16 bg-[#2A2723]" />
            </div>
            <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
              We build menus around responsible farms, seasonal produce, and producers close enough to know by name.
              Every dish begins long before it reaches the plate.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ═══ COMMITMENTS STATS ═══ */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <FadeUp className="text-center mb-16">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Our Commitment</p>
          <h2 className="font-forum text-5xl gold-shimmer">Measurable Impact</h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="h-px w-16 bg-[#2A2723]" />
            <span className="diamond" />
            <span className="h-px w-16 bg-[#2A2723]" />
          </div>
        </FadeUp>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {commitments.map((c, i) => (
            <FadeUp key={i} delay={i * 80}>
              <div className="group bg-[#161412] border border-[#2A2723] p-8 h-full hover:border-[hsl(38,61%,73%)]/40 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[hsl(38,61%,73%)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <span className="text-[hsl(38,61%,73%)] text-lg block mb-4">{c.icon}</span>
                <p className="font-forum text-4xl text-gold mb-2">{c.stat}</p>
                <h3 className="text-white font-bold text-sm mb-3">{c.label}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{c.detail}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ═══ SUPPLIER MAP ═══ */}
      <section className="bg-[#161412] border-y border-[#2A2723] mb-24 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Our Producers</p>
            <h2 className="font-forum text-5xl gold-shimmer">The People Behind Our Ingredients</h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className="h-px w-16 bg-[#2A2723]" />
              <span className="diamond" />
              <span className="h-px w-16 bg-[#2A2723]" />
            </div>
          </FadeUp>

          <div className="grid lg:grid-cols-[1fr_1fr] gap-10">
            {/* Map placeholder with pins */}
            <FadeUp>
              <div className="bg-[#0E0D0C] border border-[#2A2723] aspect-square relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=85"
                  alt="Map of Gujarat and surrounding regions"
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-3 h-3 bg-gold rounded-full mx-auto mb-2 animate-ping" style={{ animationDuration: "2s" }} />
                    <p className="text-gold text-xs font-bold tracking-widest uppercase">Aurelia Kitchen</p>
                    <p className="text-white/40 text-[10px]">Ahmedabad, Gujarat</p>
                  </div>
                </div>
                {suppliers.map((s, i) => {
                  const positions = [
                    { top: "25%", left: "40%" },
                    { top: "55%", left: "30%" },
                    { top: "15%", left: "20%" },
                    { top: "70%", left: "45%" },
                    { top: "40%", left: "55%" },
                    { top: "50%", left: "60%" },
                  ];
                  return (
                    <div
                      key={i}
                      className="absolute group/pin"
                      style={positions[i]}
                    >
                      <div className="w-2.5 h-2.5 bg-gold rounded-full border-2 border-[#0E0D0C] cursor-pointer hover:scale-150 transition-transform" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-[#161412] border border-[#2A2723] px-3 py-2 opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        <p className="text-gold text-[10px] font-bold">{s.name}</p>
                        <p className="text-white/50 text-[9px]">{s.location} · {s.km} km</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </FadeUp>

            {/* Supplier cards */}
            <div className="space-y-4">
              {suppliers.map((s, i) => (
                <FadeUp key={i} delay={i * 60}>
                  <div className="group flex gap-4 bg-[#0E0D0C] border border-[#2A2723] p-4 hover:border-[hsl(38,61%,73%)]/40 transition-all duration-500 cursor-pointer">
                    <img src={s.img} alt={s.name} className="w-20 h-20 object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-bold text-white text-sm group-hover:text-gold transition-colors truncate">{s.name}</h3>
                        <span className="text-gold text-[10px] font-bold whitespace-nowrap">{s.km} km</span>
                      </div>
                      <p className="text-white/40 text-[11px] mb-1">{s.location}</p>
                      <p className="text-white/50 text-xs leading-relaxed">{s.specialty}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SEASONAL PRODUCE CALENDAR ═══ */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <FadeUp className="text-center mb-16">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Seasonal Calendar</p>
          <h2 className="font-forum text-5xl gold-shimmer">What's Growing Now</h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="h-px w-16 bg-[#2A2723]" />
            <span className="diamond" />
            <span className="h-px w-16 bg-[#2A2723]" />
          </div>
        </FadeUp>

        {/* Month selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {seasonalCalendar.map((m, i) => (
            <button
              key={m.month}
              onClick={() => setActiveMonth(i)}
              className={`px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${
                activeMonth === i
                  ? "bg-gold text-[#0E0D0C] border-gold"
                  : "bg-transparent text-white/40 border-[#2A2723] hover:border-gold/40 hover:text-gold"
              }`}
            >
              {m.month}
            </button>
          ))}
        </div>

        {/* Active month produce */}
        <FadeUp key={activeMonth}>
          <div className="bg-[#161412] border border-[#2A2723] p-10 lg:p-14">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {seasonalCalendar[activeMonth].produce.map((item, i) => (
                <div key={i} className="bg-[#0E0D0C] border border-[#2A2723] p-6 text-center hover:border-[hsl(38,61%,73%)]/40 transition-all duration-500 group">
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                    style={{ backgroundColor: `${seasonalCalendar[activeMonth].color}15`, border: `1px solid ${seasonalCalendar[activeMonth].color}30` }}
                  >
                    <span className="text-2xl" style={{ color: seasonalCalendar[activeMonth].color }}>✦</span>
                  </div>
                  <h4 className="font-forum text-xl text-white group-hover:text-gold transition-colors">{item}</h4>
                  <p className="text-white/30 text-[10px] tracking-widest uppercase mt-2">{seasonalCalendar[activeMonth].month} 2026</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ═══ PRACTICES ═══ */}
      <section className="bg-[#161412] border-y border-[#2A2723] mb-24 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Our Practices</p>
            <h2 className="font-forum text-5xl gold-shimmer">How We Work</h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className="h-px w-16 bg-[#2A2723]" />
              <span className="diamond" />
              <span className="h-px w-16 bg-[#2A2723]" />
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Farm-First Menu Design", text: "We call our farmers before we write the menu. Ingredients at peak flavor don't need much — just fire, salt, and restraint.", symbol: "◇" },
              { title: "Zero-Waste Kitchen", text: "Vegetable peels become stock. Bread ends become croutons. Coffee grounds become compost. Nothing leaves without purpose.", symbol: "◆" },
              { title: "Seasonal Over Constant", text: "If it's not in season, we don't force it. Our menu shifts with the harvest, not the calendar. This is flavor by patience.", symbol: "◇" },
              { title: "Local Transport", text: "Short supply chains mean fresher produce, lower emissions, and relationships with the people who grow our food.", symbol: "◆" },
              { title: "Community Composting", text: "We partner with local composting services to turn kitchen waste into soil that feeds the same farms we buy from.", symbol: "◇" },
              { title: "Transparent Sourcing", text: "Every dish on our menu lists its origin. We believe diners deserve to know where their food comes from.", symbol: "◆" },
            ].map((p, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div className="group bg-[#0E0D0C] border border-[#2A2723] p-8 h-full hover:border-[hsl(38,61%,73%)]/40 transition-all duration-500 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-0 bg-gold group-hover:h-full transition-all duration-700" />
                  <span className="text-[hsl(38,61%,73%)] text-lg block mb-4">{p.symbol}</span>
                  <h3 className="font-forum text-2xl text-white mb-3 group-hover:text-gold transition-colors duration-500">{p.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{p.text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CARBON FOOTPRINT ═══ */}
      <section className="max-w-5xl mx-auto px-6 mb-24">
        <FadeUp className="text-center mb-16">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Carbon Footprint</p>
          <h2 className="font-forum text-5xl gold-shimmer">Our Progress</h2>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="h-px w-16 bg-[#2A2723]" />
            <span className="diamond" />
            <span className="h-px w-16 bg-[#2A2723]" />
          </div>
        </FadeUp>

        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { year: "2023", co2: "8.2 ton", status: "Baseline measurement", bar: 100 },
            { year: "2025", co2: "5.1 ton", status: "Solar + local sourcing", bar: 62 },
            { year: "2027*", co2: "2.8 ton", status: "Target: net-zero operations", bar: 34 },
          ].map((yr, i) => (
            <FadeUp key={i} delay={i * 100}>
              <div className="bg-[#161412] border border-[#2A2723] p-8 text-center">
                <p className="text-gold font-forum text-2xl mb-1">{yr.year}</p>
                <p className="font-forum text-5xl text-white mb-2">{yr.co2}</p>
                <p className="text-white/40 text-xs mb-6">{yr.status}</p>
                <div className="h-2 bg-[#0E0D0C] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[hsl(38,61%,73%)] to-[hsl(38,40%,50%)] rounded-full transition-all duration-1000"
                    style={{ width: `${yr.bar}%` }}
                  />
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="max-w-4xl mx-auto px-6">
        <FadeUp>
          <div className="bg-[#161412] border border-[#2A2723] p-10 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(38,61%,73%)]/5 to-transparent" />
            <div className="relative z-10">
              <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Ask Us Anything</p>
              <h2 className="font-forum text-4xl mb-4">Questions About Sourcing?</h2>
              <p className="text-white/50 mb-8 max-w-lg mx-auto">
                We're happy to share where any ingredient on our menu comes from. Reach out to learn more about our producers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/contact" className="btn-gold btn-gold-solid"><span>Get In Touch</span></Link>
                <Link to="/journal" className="btn-gold"><span>Read Our Journal</span></Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
