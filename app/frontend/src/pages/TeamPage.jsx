import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const team = [
  {
    name: "Laurent Beaumont",
    role: "Founder & Executive Chef",
    specialty: "Fire-driven botanical cuisine",
    bio: "After two decades in Michelin-starred kitchens across Lyon and Paris, Laurent envisioned a space where vegetables command the same reverence as any fine protein. His fire-driven, botanical-forward cuisine has earned Aurelia its reputation as Ahmedabad's most distinctive dining experience.",
    quote: "A carrot, treated with the same respect as a wagyu ribeye, can be just as memorable.",
    img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=85",
  },
  {
    name: "Isabelle Beaumont",
    role: "Head Chef",
    specialty: "Seasonal tasting menus",
    bio: "Isabelle's palate was forged in the herb gardens of Provence and refined in the pastry ateliers of Paris. She orchestrates every service with the quiet intensity of a conductor, ensuring each plate honours the season's finest with unwavering precision.",
    quote: "Cooking is listening — to the ingredient, to the season, to the diner.",
    img: "https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=800&q=85",
  },
  {
    name: "Clara Voss",
    role: "Beverage Director",
    specialty: "Artisanal mocktails & wellness elixirs",
    bio: "Clara's beverage programme is a curated journey from botanical infusions and house-made cordials to seasonal wellness elixirs. Her intuitive pairings elevate every course, transforming a meal into a narrative told through glass.",
    quote: "The best pairing is the one that makes you forget about the drink — and remember the moment.",
    img: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=85",
  },
  {
    name: "Marcus Chen",
    role: "Pastry Chef",
    specialty: "Architectural desserts",
    bio: "Marcus reimagines the boundary between dessert and fine art, sculpting confections that are as visually arresting as they are exquisite on the tongue. Trained at Le Cordon Bleu, he brings an obsessive reverence for texture and seasonal produce to every creation.",
    quote: "Dessert should make you pause. That moment of hesitation before the first bite — that's where magic lives.",
    img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&q=85",
  },
  {
    name: "Elena Rodriguez",
    role: "Sous Chef",
    specialty: "Fermentation & spice layering",
    bio: "Elena is the calm nerve centre of the kitchen, translating Laurent's vision into flawless execution under the most intense service pressure. Her mastery of spice layering and fermentation techniques has become a quiet signature woven throughout the menu.",
    quote: "Fermentation is patience made edible. You can't rush flavour.",
    img: "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800&q=85",
  },
  {
    name: "James Whitfield",
    role: "Front of House Manager",
    specialty: "Guest experience & hospitality",
    bio: "James orchestrates the dining room with the grace of a seasoned host and the precision of a stage manager. From remembering every regular's preference to calming a packed Saturday service, he ensures Aurelia feels like an evening well spent before the first course arrives.",
    quote: "Hospitality isn't a service — it's a feeling you carry home with you.",
    img: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=85",
  },
];

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

function ChefCard({ member, index }) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  };

  return (
    <FadeUp delay={index * 80}>
      <div
        ref={cardRef}
        className={`group relative bg-[#161412] border border-[#2A2723] overflow-hidden transition-all duration-700 hover:border-[hsl(38,61%,73%)] cursor-pointer ${expanded ? "lg:col-span-2" : ""}`}
        onMouseMove={handleMouseMove}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="card-sparkle pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className={`relative overflow-hidden shrink-0 ${expanded ? "sm:w-48 aspect-[3/4] sm:aspect-auto sm:h-full" : "sm:w-44 h-52 sm:h-auto"}`}>
            <img
              src={member.img}
              alt={member.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0C]/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <span className="bg-gold/90 text-[#0E0D0C] text-[8px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 inline-block">
                {member.specialty}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-5 lg:p-6 flex flex-col justify-between min-w-0">
            <div>
              <p className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-1">{member.role}</p>
              <h3 className="font-forum text-xl lg:text-2xl text-white group-hover:text-gold transition-colors duration-500 mb-3">
                {member.name}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{member.bio}</p>
            </div>

            {/* Quote */}
            <div className="mt-6 pt-4 border-t border-[#2A2723] group-hover:border-gold/20 transition-colors duration-500">
              <p className="text-white/30 text-xs italic leading-relaxed">
                &ldquo;{member.quote}&rdquo;
              </p>
            </div>

            {/* Expand indicator */}
            <div className="absolute top-4 right-4 w-6 h-6 border border-[#2A2723] group-hover:border-gold/40 flex items-center justify-center transition-all duration-300">
              <span className="text-white/20 group-hover:text-gold/60 text-xs transition-colors">{expanded ? "−" : "+"}</span>
            </div>
          </div>
        </div>
      </div>
    </FadeUp>
  );
}

export default function TeamPage() {
  return (
    <div className="pt-36 pb-24 min-h-screen">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden mb-24">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600&q=85"
            alt=""
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E0D0C]/60 via-[#0E0D0C]/80 to-[#0E0D0C]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <FadeUp>
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Our Team</p>
            <h1 className="font-forum text-6xl sm:text-8xl gold-shimmer mb-6">Meet The Hands<br />Behind The Flame</h1>
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="h-px w-16 bg-[#2A2723]" />
              <span className="diamond" />
              <span className="h-px w-16 bg-[#2A2723]" />
            </div>
            <p className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
              The people who shape every service with craft, calm, and an obsessive attention to detail.
              Each plate, each pour, each moment at your table is their life's work.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ═══ TEAM GRID ═══ */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {team.map((member, i) => (
            <ChefCard key={member.name} member={member} index={i} />
          ))}
        </div>
      </section>

      {/* ═══ TEAM VALUES ═══ */}
      <section className="bg-[#161412] border-y border-[#2A2723] mb-24 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <FadeUp className="text-center mb-16">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Our Values</p>
            <h2 className="font-forum text-5xl gold-shimmer">What Drives Us</h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className="h-px w-16 bg-[#2A2723]" />
              <span className="diamond" />
              <span className="h-px w-16 bg-[#2A2723]" />
            </div>
          </FadeUp>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { symbol: "◆", title: "Craft Over Speed", text: "Every dish is made with intention. We don't rush — we refine. The difference is on the plate." },
              { symbol: "◇", title: "Seasonal Honour", text: "We cook what the earth gives us, when it gives us. Our menu changes because nature does." },
              { symbol: "◆", title: "Hospitality First", text: "Before we are chefs and beverage experts, we are hosts. Every guest should feel the warmth of our kitchen." },
            ].map((v, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="group text-center p-8 bg-[#0E0D0C] border border-[#2A2723] hover:border-[hsl(38,61%,73%)]/40 transition-all duration-500">
                  <span className="text-[hsl(38,61%,73%)] text-xl block mb-4">{v.symbol}</span>
                  <h3 className="font-forum text-xl text-white mb-3 group-hover:text-gold transition-colors duration-500">{v.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{v.text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CAREERS ═══ */}
      <section className="max-w-5xl mx-auto px-6">
        <FadeUp>
          <div className="relative bg-[#161412] border border-[#2A2723] px-8 py-16 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[hsl(38,61%,73%)] to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-[hsl(38,61%,73%)] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(38,61%,73%)]/5 to-transparent" />

            <div className="relative z-10">
              <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Join Our Team</p>
              <h2 className="font-forum text-4xl mb-4">Want to join our brigade?</h2>
              <p className="max-w-lg mx-auto text-white/50 mb-8 leading-relaxed">
                We are always looking for passionate individuals who share our commitment to excellence.
                If fire, flavour, and craft drive you, we want to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="mailto:careers@aurelia.com" className="btn-gold btn-gold-solid"><span>Apply Now</span></a>
                <Link to="/careers" className="btn-gold"><span>View Open Positions</span></Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
