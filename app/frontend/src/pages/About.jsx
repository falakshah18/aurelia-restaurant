import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const timeline = [
  { year: "1995", title: "Aurelia Founded", desc: "Andrew Joe opens the doors to a small 30-seat restaurant in Ahmedabad, driven by a love for seasonal vegetarian cuisine." },
  { year: "2001", title: "First Michelin Star", desc: "Recognised for exceptional quality and a commitment to local sourcing." },
  { year: "2005", title: "Four AA Rosettes", desc: "Awarded the highest rating for culinary excellence and hospitality." },
  { year: "2015", title: "Forbes Five Star", desc: "Awarded for outstanding service, ambience, and dining experience." },
  { year: "2018", title: "Best Beverage Programme", desc: "Recognised for our 350-label artisanal beverage programme featuring mocktails, elixirs, and wellness drinks." },
  { year: "2021", title: "Tatler Best New Chef", desc: "Isabelle Beaumont recognised for redefining modern vegetarian cuisine." },
  { year: "2024", title: "Continuing Legacy", desc: "Three decades in, and our passion for craft, provenance, and hospitality burns brighter than ever." },
];

const philosophy = [
  { symbol: "\u25C6", label: "Provenance", text: "Every ingredient is traceable to the farm, the boat, or the forager. We visit our producers personally before committing to a relationship." },
  { symbol: "\u25C7", label: "Craft", text: "Classical technique is the foundation upon which we build \u2014 never a shortcut, always a reason. Each dish is rehearsed dozens of times before service." },
  { symbol: "\u25C6", label: "Restraint", text: "We believe less is more. Every element on the plate has earned its place. Simplicity at this level demands more from the cook, not less." },
  { symbol: "\u25C7", label: "Hospitality", text: "A guest at Aurelia is a guest in our home. The service team trains for months before their first evening, because care cannot be improvised." },
];

const awards = [
  { name: "Michelin Star", year: "2001\u20132024", note: "Retained every year since first award" },
  { name: "Forbes Five Star", year: "2015\u20132024", note: "Awarded for service and experience" },
  { name: "Best Beverage Programme", year: "2018\u20132024", note: "Award of Excellence" },
  { name: "James Beard Recognition", year: "2019", note: "Outstanding Restaurant \u2014 International" },
  { name: "AA Rosettes \u25C6\u25C6\u25C6\u25C6", year: "2005\u20132024", note: "Four Rosettes for culinary excellence" },
  { name: "Tatler Best New Chef", year: "2021", note: "Chef Isabelle Beaumont" },
];

function useFadeUp() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in"); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function FadeUpDiv({ children, className = "", ...props }) {
  const ref = useFadeUp();
  return <div ref={ref} className={`fade-up ${className}`} {...props}>{children}</div>;
}

function Counter({ end, suffix = "", label, delay = 0 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const numRef = useRef(null);

  useEffect(() => {
    const el = numRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.unobserve(el); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let rafId;
    const duration = 1800;
    const startTime = performance.now() + delay;

    function animate(now) {
      const elapsed = now - startTime;
      if (elapsed < 0) { rafId = requestAnimationFrame(animate); return; }
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setCount(Math.round(eased * end));
      if (t < 1) rafId = requestAnimationFrame(animate);
    }
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [started, end, delay]);

  return (
    <div className="text-center">
      <p ref={numRef} className={`font-forum text-5xl text-gold count-up`}>
        {count}{suffix}
      </p>
      <p className="text-white/60 text-sm mt-2">{label}</p>
    </div>
  );
}

function TimelineItem({ item, index }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("in"); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className={`timeline-item fade-up relative flex items-start gap-0 mb-0 last:mb-0 group`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Left content — year */}
      <div className={`flex-1 ${isEven ? "text-right pr-10" : "text-right pr-10 hidden md:block"}`}>
        <span className="font-forum text-4xl text-white/20 group-hover:text-gold transition-colors duration-700 leading-none block">
          {item.year}
        </span>
      </div>

      {/* Center node */}
      <div className="relative flex-shrink-0 flex flex-col items-center z-10">
        <div className="w-5 h-5 bg-[#161412] border-2 border-[#2A2723] group-hover:border-gold group-hover:bg-gold/20 transform rotate-45 transition-all duration-500 relative z-10">
          <div className="absolute inset-0.5 bg-gold/0 group-hover:bg-gold/30 transition-colors duration-500" />
        </div>
      </div>

      {/* Right content — card */}
      <div className={`flex-1 ${isEven ? "pl-10" : "pl-10"}`}>
        <div className="bg-[#161412] border border-[#2A2723] p-6 relative overflow-hidden group-hover:border-gold/40 transition-all duration-500">
          <div className="absolute top-0 left-0 w-1 h-0 bg-gold group-hover:h-full transition-all duration-700" />
          <span className="text-gold text-xs font-bold tracking-[0.3em] uppercase block mb-2">{item.year}</span>
          <h3 className="font-bold text-white text-lg mb-2 group-hover:text-gold transition-colors duration-500">{item.title}</h3>
          <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <div className="pt-40 pb-24">

      {/* ═══════════════════════════════════════════════════
          SECTION 1 — HERO
          ═══════════════════════════════════════════════════ */}
      <section className="bg-[#0E0D0C]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          <FadeUpDiv>
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-6">Who We Are</p>
            <h1 className="font-forum text-6xl sm:text-7xl mb-8">About<br />Aurelia</h1>
            <blockquote className="border-l-2 border-[hsl(38,61%,73%)] pl-6 mb-8">
              <p className="font-forum text-xl text-white/90 italic leading-relaxed">
                &ldquo;We set out to prove that a meal without meat could be just as memorable, just as luxurious, and just as human. Nearly three decades later, I believe the plate speaks for itself.&rdquo;
              </p>
              <p className="text-gold font-forum text-2xl mt-4">
                Andrew Joe{" "}
                <span className="text-white/50 text-base not-italic">&mdash; Founder</span>
              </p>
            </blockquote>
            <Link to="/reserve" className="btn-gold btn-gold-solid inline-flex mb-12"><span>Book A Table</span></Link>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { title: "Lunch", detail: "Monday to Sunday\n11:00 am \u2013 2:30 pm" },
                { title: "Dinner", detail: "Monday to Sunday\n5:30 pm \u2013 11:30 pm" },
                { title: "Contact", detail: "SG Highway, Ahmedabad\nGujarat 380015, India" },
              ].map((card, i) => (
                <div key={i} className="p-6 bg-[#161412] border border-[#2A2723] text-center hover-lift transition-all duration-500 hover:border-[hsl(38,61%,73%)]">
                  <p className="text-gold font-forum text-lg mb-2">{card.title}</p>
                  <p className="text-xs text-white/60 whitespace-pre-line leading-relaxed">{card.detail}</p>
                </div>
              ))}
            </div>
          </FadeUpDiv>

          <FadeUpDiv className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-lg">
              <img
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=85"
                alt="Chef at Aurelia"
                className="chef-mask w-full aspect-[3/4] object-cover"
              />
              <div className="absolute bottom-8 left-0 bg-[hsl(38,61%,73%)] px-6 py-3">
                <p className="font-forum text-[#0E0D0C] text-sm font-bold tracking-widest uppercase">Since 1995</p>
              </div>
            </div>
          </FadeUpDiv>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 2 — STATS COUNTER STRIP
          ═══════════════════════════════════════════════════ */}
      <section className="bg-[#161412] py-20 border-y border-[#2A2723]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          <Counter end={30} suffix="+" label="Years of Excellence" delay={0} />
          <Counter end={68} suffix="" label="Seats Available" delay={120} />
          <Counter end={1} suffix="" label="Michelin Star" delay={240} />
          <Counter end={120} suffix="+" label="Dishes Per Season" delay={360} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 3 — TIMELINE
          ═══════════════════════════════════════════════════ */}
      <section className="bg-[#0E0D0C] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 py-32">
          <FadeUpDiv className="text-center mb-20">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Our Journey</p>
            <h2 className="font-forum text-5xl sm:text-6xl gold-shimmer">Three Decades in Time</h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className="h-px w-16 bg-[#2A2723]"></span>
              <span className="diamond"></span>
              <span className="h-px w-16 bg-[#2A2723]"></span>
            </div>
          </FadeUpDiv>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical gold line — draws on scroll */}
            <div
              className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px timeline-line"
              style={{ background: "linear-gradient(to bottom, hsl(38,61%,73%) 0%, #2A2723 40%, #2A2723 60%, hsl(38,61%,73%) 100%)" }}
            />
            <div className="space-y-16">
              {timeline.map((item, i) => (
                <TimelineItem key={i} item={item} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 4 — PHILOSOPHY
          ═══════════════════════════════════════════════════ */}
      <section className="bg-[#161412] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-32">
          <FadeUpDiv className="text-center mb-20">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">The Aurelia Philosophy</p>
            <h2 className="font-forum text-5xl sm:text-6xl gold-shimmer">What We Believe</h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className="h-px w-16 bg-[#2A2723]"></span>
              <span className="diamond"></span>
              <span className="h-px w-16 bg-[#2A2723]"></span>
            </div>
          </FadeUpDiv>

          <div className="grid md:grid-cols-2 gap-8">
            {philosophy.map((p, i) => (
              <FadeUpDiv key={i}>
                <div className="group bg-[#0E0D0C] border border-[#2A2723] p-10 sm:p-12 h-full transition-all duration-500 hover:border-[hsl(38,61%,73%)] hover-lift relative overflow-hidden">
                  <span className="text-[hsl(38,61%,73%)] text-2xl block mb-4">{p.symbol}</span>
                  <h3 className="font-forum text-2xl text-white mb-4 group-hover:text-gold transition-colors duration-500">{p.label}</h3>
                  <p className="text-white/70 leading-relaxed text-[15px]">{p.text}</p>
                  <div className="mt-8 h-px w-0 bg-[hsl(38,61%,73%)] group-hover:w-full transition-all duration-700" />
                </div>
              </FadeUpDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 5 — AWARDS
          ═══════════════════════════════════════════════════ */}
      <section className="bg-[#0E0D0C] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 py-32">
          <FadeUpDiv className="text-center mb-20">
            <h2 className="font-forum text-5xl sm:text-6xl gold-shimmer">Awards &amp; Honours</h2>
            <div className="flex items-center justify-center gap-4 mt-6">
              <span className="h-px w-16 bg-[#2A2723]"></span>
              <span className="diamond"></span>
              <span className="h-px w-16 bg-[#2A2723]"></span>
            </div>
          </FadeUpDiv>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {awards.map((a, i) => (
              <FadeUpDiv key={i}>
                <div className="group bg-[#161412] border border-[#2A2723] p-8 h-full flex flex-col transition-all duration-500 hover:border-[hsl(38,61%,73%)] hover-lift relative overflow-hidden">
                  <div className="inline-flex self-start items-center bg-[hsl(38,61%,73%,0.15)] px-4 py-1.5 mb-6 rounded-sm">
                    <span className="text-gold text-xs font-bold tracking-[0.2em] uppercase">{a.year}</span>
                  </div>
                  <h3 className="font-forum text-xl text-gold mb-3">{a.name}</h3>
                  <p className="text-white/60 text-sm leading-relaxed flex-1">{a.note}</p>
                </div>
              </FadeUpDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 6 — CLOSING CTA
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=85"
          alt="Aurelia restaurant interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0E0D0C]/70" />
        <div className="relative max-w-6xl mx-auto px-6 py-32 text-center">
          <FadeUpDiv>
            <h2 className="font-forum text-5xl sm:text-6xl lg:text-7xl gold-shimmer mb-10">
              Three Decades of<br />Culinary Excellence
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/reserve" className="btn-gold btn-gold-solid breathe"><span>Reserve a Table</span></Link>
              <Link to="/menu" className="btn-gold"><span>View Our Menu</span></Link>
            </div>
          </FadeUpDiv>
        </div>
      </section>

    </div>
  );
}
