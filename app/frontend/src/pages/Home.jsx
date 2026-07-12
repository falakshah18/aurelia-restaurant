import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import HeroSlider from "@/components/HeroSlider";
import useFadeInOnScroll from "@/lib/useFadeIn";
import { api } from "@/lib/api";
import { GlassWater, Utensils, Music, Monitor, Clock, Users, Star, MapPin } from "lucide-react";

const services = [
  { title: "Gourmet Plating", img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=85" },
  { title: "Fresh Greens", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=85" },
  { title: "Seasonal Harvest", img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&q=85" },
  { title: "Artisan Breads", img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=85" },
];

const features = [
  { t: "Hygienic Food", d: "Prepared with the highest standards of cleanliness.", img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=260&q=85" },
  { t: "Fresh Environment", d: "An ambience curated for a memorable evening.", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=260&q=85" },
  { t: "Skilled Chefs", d: "Michelin-trained artisans behind every plate.", img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=260&q=85" },
  { t: "Event & Party", d: "Host private dinners, tastings & celebrations.", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=260&q=85" },
  { t: "Farm-to-Table", d: "Ingredients sourced daily from trusted local farms.", img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=260&q=85" },
  { t: "Curated Pairings", d: "Artisanal mocktails and wellness drinks crafted for each course.", img: "https://images.unsplash.com/photo-1546173159-315724a31696?w=260&q=80" },
];

const fallbackMenu = [
  { id: "home-fallback-1", name: "Truffle Mushroom Pizza", price: 895, badge: "Signature", description: "Wood-fired crust, wild mushrooms, fontina, black truffle cream, and thyme.", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=220&q=85" },
  { id: "home-fallback-2", name: "Wild Mushroom Risotto", price: 995, badge: "Chef Pick", description: "Arborio rice, wild mushrooms, truffle oil, parmesan, and fresh thyme.", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=220&q=85" },
  { id: "home-fallback-3", name: "Herb Ricotta Ravioli", price: 795, description: "House-made ravioli, ricotta, lemon zest, sage butter, and toasted pine nuts.", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=220&q=85" },
  { id: "home-fallback-4", name: "Burrata & Heirloom Tomato", price: 595, description: "Creamy burrata, basil oil, aged balsamic, sea salt, and toasted sourdough.", image: "https://images.unsplash.com/photo-1546241072-48010ad2862c?w=220&q=85" },
  { id: "home-fallback-5", name: "Roasted Cauliflower Steak", price: 845, description: "Herb-crusted cauliflower, romesco sauce, almond gremolata, and micro greens.", image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=220&q=85" },
  { id: "home-fallback-6", name: "Honey Semifreddo", price: 595, badge: "Sweet", description: "Whipped honey cream, almond crumble, roasted figs, and espresso syrup.", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=220&q=85" },
];

const events = [
  { d: "15/09/2026", cat: "Harvest Dinner", t: "A seasonal tasting menu celebrating local farms.", img: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=700&q=85" },
  { d: "08/09/2026", cat: "Mocktail Evening", t: "An evening of artisanal mocktails and seasonal small plates.", img: "https://images.unsplash.com/photo-1546173159-315724a31696?w=700&q=85" },
  { d: "03/09/2026", cat: "Chef's Table", t: "An intimate evening with the chef and seasonal creations.", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=85" },
];

const experiences = [
  { key: "chef", label: "Chef Counter", title: "A front-row seat to fire, craft, and plating.", text: "Settle into the counter while our chefs finish tasting portions, pour sauces tableside, and talk through the evening's best ingredients.", img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&q=85" },
  { key: "terrace", label: "Garden Terrace", title: "Golden-hour dining with a slower rhythm.", text: "A relaxed outdoor table for spritzes, handmade pizza, and long conversations under warm lamps.", img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=900&q=85" },
  { key: "private", label: "Private Dining", title: "A quiet room for celebrations that matter.", text: "Choose a custom tasting menu, beverage pairings, floral styling, and a dedicated host for the whole evening.", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=85" },
  { key: "rooftop", label: "Rooftop Lounge", title: "Skyline views and twilight bites.", text: "Ascend to our rooftop for artisanal mocktails, shareable plates, and panoramic city views as the sun goes down.", img: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=900&q=85" },
];

const ambienceSlides = [
  { title: "Candlelit Supper", text: "Soft light, slow service, and plates designed for sharing.", img: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=85" },
  { title: "Garden Terrace", text: "Golden-hour dining surrounded by herbs and seasonal blooms.", img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1200&q=85" },
  { title: "Weekend Brunch", text: "Bright plates, fresh juice, and a table full of seasonal delights.", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=85" },
];

const eventIncludes = [
  { icon: GlassWater, label: "Beverage Expert" },
  { icon: Utensils, label: "Bespoke Menu Design" },
  { icon: Music, label: "Live Music Options" },
  { icon: Monitor, label: "AV & Presentation" },
  { icon: Clock, label: "Extended Hours" },
  { icon: Users, label: "Dedicated Event Host" },
];

const galleryImages = [
  { src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=85", cat: "Ambience" },
  { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=85", cat: "Ambience" },
  { src: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=500&q=85", cat: "Ambience" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=85", cat: "Ambience" },
  { src: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500&q=85", cat: "Ambience" },
  { src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=500&q=85", cat: "Events" },
  { src: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&q=85", cat: "Events" },
  { src: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=85", cat: "Team" },
  { src: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&q=85", cat: "Team" },
];

const testimonials = [
  { name: "Arjun Mehta", loc: "Ahmedabad", stars: 5, text: "The truffle risotto was otherworldly. Every bite felt like a celebration of flavour." },
  { name: "Priya Sharma", loc: "Mumbai", stars: 5, text: "Aurelia redefined what fine dining means to me. The ambience, the service — flawless." },
  { name: "Vikram Patel", loc: "Delhi", stars: 5, text: "From the amuse-bouche to the petit fours, every course was a masterpiece." },
  { name: "Nisha Kapoor", loc: "Bangalore", stars: 5, text: "The beverage pairing was impeccable. We didn't have to think — just enjoy." },
  { name: "Rohan Gupta", loc: "Pune", stars: 4, text: "An intimate evening with stunning plating. The chef counter experience is a must." },
  { name: "Ananya Desai", loc: "Jaipur", stars: 5, text: "The garden terrace at sunset is pure magic. We'll be back every season." },
];
const allTestimonials = [...testimonials, ...testimonials];

const stats = [
  { label: "Years of Excellence", value: 30, suffix: "+" },
  { label: "Seats Available", value: 68, suffix: "" },
  { label: "Michelin Stars", value: 1, suffix: "" },
  { label: "Dishes Per Season", value: 120, suffix: "+" },
];

function TiltCard({ children, className }) {
  const cardRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, []);
  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (card) card.style.transform = "perspective(800px) rotateX(0) rotateY(0)";
  }, []);
  return (
    <div ref={cardRef} className={className} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ transition: "transform 80ms ease" }}>
      {children}
    </div>
  );
}

function Counter({ value, suffix, delay }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let rafId;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const startTime = performance.now() + delay;
          const animate = (now) => {
            const elapsed = now - startTime;
            if (elapsed < 0) { rafId = requestAnimationFrame(animate); return; }
            const t = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - t, 4);
            setCount(Math.round(eased * value));
            if (t < 1) rafId = requestAnimationFrame(animate);
          };
          rafId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); if (rafId) cancelAnimationFrame(rafId); };
  }, [value, delay]);

  return (
    <span ref={ref} className="font-forum text-5xl text-gold">
      {count}{suffix}
    </span>
  );
}

export default function Home() {
  const ref = useFadeInOnScroll();
  const [menu, setMenu] = useState(fallbackMenu);
  const [activeExperience, setActiveExperience] = useState(experiences[0]);
  const [ambience, setAmbience] = useState(0);
  const [galleryTab, setGalleryTab] = useState("All");
  const [gift, setGift] = useState({ cardStyle: "Classic Gold", amount: 5000, fromName: "", toName: "", toEmail: "", message: "" });
  const [quote, setQuote] = useState({ name: "", email: "", phone: "", guests: 2, date: "", occasion: "", notes: "" });
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [quoteDone, setQuoteDone] = useState(false);

  const submitQuote = async (e) => {
    e.preventDefault();
    setQuoteBusy(true);
    try {
      await api.post("/quote", quote);
      setQuoteDone(true);
    } catch {
      alert("Something went wrong sending your request. Please call us at +88-123-123456.");
    } finally {
      setQuoteBusy(false);
    }
  };

  useEffect(() => {
    api.get("/menu")
      .then(({ data }) => setMenu(data.length ? data.slice(0, 6) : fallbackMenu))
      .catch(() => setMenu(fallbackMenu));
  }, []);

  const filteredGallery = galleryTab === "All" ? galleryImages : galleryImages.filter((g) => g.cat === galleryTab);
  const presetAmounts = [500, 1000, 2000, 3000, 5000, 7500, 10000, 15000];

  return (
    <div ref={ref}>
      {/* 1. HERO */}
      <HeroSlider />

      {/* 2. SERVICE */}
      <section className="py-24 bg-[#161412] text-center">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Flavors For Royalty</p>
          <h2 className="font-forum text-5xl sm:text-6xl mb-6 fade-up gold-shimmer">We Offer Top Notch</h2>
          <p className="max-w-xl mx-auto text-white/60 mb-16 fade-up">
            An unforgettable dining experience curated from farm-fresh ingredients and the finest artisanal recipes.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((s) => (
              <div key={s.title} className="fade-up group hover-lift">
                <div className="image-mask overflow-hidden aspect-[5/6]">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-110" loading="lazy" />
                </div>
                <h3 className="font-forum text-3xl mt-6">{s.title}</h3>
                <Link to="/menu" className="hover-underline text-xs uppercase tracking-[0.25em] text-gold mt-2 inline-block">View Menu</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ABOUT */}
      <section id="about" className="py-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="fade-up">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Our Story</p>
            <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-6 gold-shimmer">Every flavor tells a story</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              Since 1995, Aurelia has been a sanctuary for lovers of exquisite cuisine. Our chefs source seasonal ingredients
              from trusted local farms and transform them into unforgettable plates. Sit down, unwind, and let every course
              tell you a story.
            </p>
            <p className="text-sm uppercase tracking-widest text-white/60">Book Through Call</p>
            <a href="tel:+804001234567" className="font-forum text-3xl text-gold hover-underline">+80 (400) 123 4567</a>
            <div className="mt-8">
              <Link to="/about" className="btn-gold breathe"><span>Read More</span></Link>
            </div>
          </div>
          <div className="fade-up relative">
            <div className="pizza-orbit hidden md:block" aria-hidden="true">
              <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=85" alt="" />
            </div>
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=85" alt="about" className="w-full aspect-[4/5] object-cover chef-mask" />
            <div className="absolute -bottom-10 -left-6 w-40 h-40 bg-gold text-black p-4 hidden sm:grid place-items-center text-center">
              <p className="font-forum text-2xl leading-tight">Since<br />1995</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SPECIAL DISH */}
      <section className="grid lg:grid-cols-2 bg-[#161412]">
        <img src="https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=85" alt="dish" className="w-full h-full object-cover min-h-[300px] max-h-[500px] transition-transform duration-[1200ms] hover:scale-105" />
        <div className="p-12 lg:p-24 fade-up">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Special Dish</p>
          <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-6">Charred Broccoli & Burrata</h2>
          <p className="text-white/70 mb-6 leading-relaxed">Wood-fired tenderstem broccoli with creamy burrata, romesco sauce, chili flakes, and aged balsamic reduction.</p>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-white/40 line-through text-lg">₹895</span>
            <span className="text-gold font-forum text-3xl">₹745</span>
          </div>
          <Link to="/menu" className="btn-gold"><span>View All Menu</span></Link>
        </div>
      </section>

      {/* 4b. COUNTER STATS STRIP */}
      <section className="py-16 bg-[#0E0D0C] border-y border-[#2A2723]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center counter-animate">
            {stats.map((s, idx) => (
              <div key={s.label} className="flex flex-col items-center gap-3">
                <Counter value={s.value} suffix={s.suffix} delay={idx * 120} />
                <p className="text-white/60 text-sm uppercase tracking-[0.2em]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EXPERIENCE TABS */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Choose Your Evening</p>
            <h2 className="font-forum text-5xl sm:text-6xl mt-4 fade-up">Dining Experiences</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-12 fade-up" role="tablist" aria-label="Dining experiences">
            {experiences.map((item) => (
              <button key={item.key} type="button" role="tab" aria-selected={activeExperience.key === item.key} onClick={() => setActiveExperience(item)} className={`experience-tab ${activeExperience.key === item.key ? "active" : ""}`}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div className="fade-up image-mask">
              <img src={activeExperience.img} alt={activeExperience.label} className="w-full aspect-[16/11] object-cover transition-all duration-700" />
            </div>
            <div className="fade-up">
              <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">{activeExperience.label}</p>
              <h3 className="font-forum text-4xl sm:text-5xl mt-4 mb-5">{activeExperience.title}</h3>
              <p className="text-white/70 leading-relaxed mb-8">{activeExperience.text}</p>
              <Link to="/reserve" className="btn-gold breathe"><span>Reserve This Experience</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. MENU */}
      <section id="menu" className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gold text-sm font-bold tracking-[0.35em] uppercase fade-up">Special Selection</p>
          <h2 className="font-forum text-6xl sm:text-7xl mt-4 mb-12 fade-up">Delicious Menu</h2>
          <div className="grid md:grid-cols-2 gap-10 text-left">
            {menu.map((m) => (
              <TiltCard data-testid="home-menu-card" key={m.id} className="flex gap-6 group menu-hover-line">
                <img
                  src={m.image || "https://images.unsplash.com/photo-1546241072-48010ad2862c?w=200&q=80"}
                  alt={m.name}
                  className="w-24 h-24 object-cover rounded-full transition-all duration-300 group-hover:scale-110 group-hover:saturate-110"
                  style={{ filter: "saturate(0.85)" }}
                />
                <div className="flex-1 border-b border-[#2A2723] pb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-forum text-2xl group-hover:text-gold transition-colors">{m.name}</h3>
                    <span className="text-gold font-forum text-xl">₹{m.price}</span>
                  </div>
                  {m.badge && <span className="text-xs uppercase tracking-widest bg-gold text-black px-3 py-1 mr-2">{m.badge}</span>}
                  <p className="text-base text-white/70 mt-2 leading-relaxed">{m.description}</p>
                </div>
              </TiltCard>
            ))}
          </div>
          <div className="mt-12">
            <Link to="/menu" className="btn-gold breathe"><span>View All Menu</span></Link>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIAL MARQUEE */}
      <section className="py-20 overflow-hidden bg-[#161412]">
        <div className="max-w-6xl mx-auto px-6 text-center mb-12">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Guest Voices</p>
          <h2 className="font-forum text-5xl sm:text-6xl mt-4 fade-up">What They Say</h2>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #161412, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #161412, transparent)" }} />
          <div className="testimonial-track flex gap-6" style={{ width: "max-content" }}>
            {allTestimonials.map((t, idx) => (
              <div key={idx} className="flex-shrink-0 w-[380px] bg-[#0E0D0C] border border-[#2A2723] p-8 hover:border-gold transition-colors duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < t.stars ? "text-gold fill-gold" : "text-white/20"}`} />
                  ))}
                </div>
                <p className="text-white/70 italic leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full border border-gold/50 flex items-center justify-center bg-[#161412]">
                    <span className="text-gold font-forum text-lg">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-white/40 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BLUR SLIDER */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Ambience Slider</p>
          <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-12 fade-up">Scenes From The Table</h2>
          <div className="blur-slider fade-up">
            {ambienceSlides.map((slide, idx) => (
              <button key={slide.title} type="button" onClick={() => setAmbience(idx)} className={`blur-slide ${idx === ambience ? "active" : ""}`} aria-label={`Show ${slide.title}`}>
                <img src={slide.img} alt={slide.title} />
                <span>
                  <strong>{slide.title}</strong>
                  <small>{slide.text}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FEATURES */}
      <section className="py-24 strength-section">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Why Choose Us</p>
          <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-16 fade-up">Our Strength</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, idx) => (
              <div key={f.t} className={`fade-up p-8 border border-[#2A2723] hover-lift feature-card ${idx % 2 === 0 ? "bg-[#161412]" : "bg-[#0E0D0C]"} hover:border-gold transition-colors`}>
                <div className="strength-orbit mx-auto mb-6">
                  <div className="strength-diamond"><img src={f.img} alt="" /></div>
                  <span className="strength-number">{idx + 1}</span>
                </div>
                <h3 className="font-forum text-3xl mb-3">{f.t}</h3>
                <p className="text-base text-white/65 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. EVENTS */}
      <section className="py-24 bg-[#161412]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Recent Updates</p>
          <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-16 fade-up">Upcoming Events</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((e) => (
              <div key={e.d} className="fade-up relative overflow-hidden group image-mask">
                <img src={e.img} alt={e.t} className="w-full aspect-[3/4] object-cover transition-transform duration-[900ms] group-hover:scale-105" loading="lazy" />
                <span className="absolute top-6 left-6 bg-black text-gold px-3 py-1 text-xs font-bold tracking-widest">{e.d}</span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-20 text-left">
                  <p className="text-gold text-[11px] uppercase tracking-widest font-bold mb-2">{e.cat}</p>
                  <p className="font-forum text-2xl text-white leading-tight">{e.t}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. EVERY EVENT INCLUDES */}
      <section className="py-24 bg-[#161412]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Every Event Includes</p>
          <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-16 fade-up">All-Inclusive Service</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {eventIncludes.map((item) => (
              <div key={item.label} className="fade-up bg-[#0E0D0C] border border-[#2A2723] p-8 text-center hover:border-gold transition-colors hover-lift group">
                <div className="w-14 h-14 mx-auto mb-4 border border-gold/40 rounded-full flex items-center justify-center group-hover:bg-gold/10 transition-colors">
                  <item.icon className="w-6 h-6 text-gold" />
                </div>
                <p className="font-forum text-xl">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. PRIVATE DINING REQUEST */}
      <section className="py-24 bg-[#0E0D0C]">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
          <div className="fade-up">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Reserve Your Space</p>
            <h2 className="font-forum text-4xl sm:text-5xl mb-8">Private Dining Request</h2>
            {quoteDone ? (
              <div className="bg-[#161412] border border-gold/40 p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-gold flex items-center justify-center text-gold text-2xl">✓</div>
                <h3 className="font-forum text-2xl mb-2">Request Received</h3>
                <p className="text-white/60 leading-relaxed">
                  Thank you, {quote.name || "guest"}! Our events team will craft a bespoke proposal and reach out within 24 hours.
                </p>
                <button type="button" onClick={() => { setQuoteDone(false); setQuote({ name: "", email: "", phone: "", guests: 2, date: "", occasion: "", notes: "" }); }} className="btn-gold mt-6"><span>Send Another</span></button>
              </div>
            ) : (
              <form onSubmit={submitQuote} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <input type="text" placeholder="Full Name *" required value={quote.name} onChange={(e) => setQuote({ ...quote, name: e.target.value })} className="bg-[#161412] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors" />
                  <input type="email" placeholder="Email *" required value={quote.email} onChange={(e) => setQuote({ ...quote, email: e.target.value })} className="bg-[#161412] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors" />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <input type="tel" placeholder="Phone *" required value={quote.phone} onChange={(e) => setQuote({ ...quote, phone: e.target.value })} className="bg-[#161412] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors" />
                  <input type="number" placeholder="Number of Guests *" min="1" required value={quote.guests} onChange={(e) => setQuote({ ...quote, guests: Number(e.target.value) })} className="bg-[#161412] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors" />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <input type="date" value={quote.date} onChange={(e) => setQuote({ ...quote, date: e.target.value })} className="bg-[#161412] border border-[#2A2723] px-5 py-3.5 text-white/70 focus:border-gold focus:outline-none transition-colors" />
                  <select value={quote.occasion} onChange={(e) => setQuote({ ...quote, occasion: e.target.value })} className="bg-[#161412] border border-[#2A2723] px-5 py-3.5 text-white/70 focus:border-gold focus:outline-none transition-colors appearance-none">
                    <option value="">Occasion</option>
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="corporate">Corporate</option>
                    <option value="wedding">Wedding</option>
                    <option value="celebration">Celebration</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <textarea placeholder="Additional Notes" rows="4" value={quote.notes} onChange={(e) => setQuote({ ...quote, notes: e.target.value })} className="w-full bg-[#161412] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors resize-none" />
                <button type="submit" disabled={quoteBusy} className="btn-gold w-full sm:w-auto breathe"><span>{quoteBusy ? "Sending…" : "Request Quote"}</span></button>
              </form>
            )}
          </div>
          <div className="fade-up lg:pt-12">
            <h3 className="font-forum text-3xl mb-4">Request Private Dining</h3>
            <p className="text-white/60 leading-relaxed mb-8">
              Tell us about your occasion and our dedicated events team will create a bespoke proposal within 24 hours.
            </p>
            <ul className="space-y-4">
              {[
                "Minimum spend applies per room and evening",
                "Booking required at least 2 weeks in advance",
                "Dietary and allergen accommodations available",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-white/70">
                  <span className="text-gold mt-1 text-xs">&#9670;</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 13. GALLERY */}
      <section className="py-24 bg-[#161412]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Visual Stories</p>
            <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-10 fade-up">Gallery</h2>
            <div className="flex flex-wrap justify-center gap-3 fade-up" role="tablist" aria-label="Gallery filter">
              {["All", "Ambience", "Events", "Team"].map((tab) => (
                <button key={tab} type="button" role="tab" aria-selected={galleryTab === tab} onClick={() => setGalleryTab(tab)} className={`experience-tab ${galleryTab === tab ? "active" : ""}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGallery.map((img, idx) => (
              <div key={idx} className="fade-up relative overflow-hidden group cursor-pointer">
                <img src={img.src} alt={img.cat} className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/80 transition-all duration-500 flex items-center justify-center">
                  <span className="text-black text-xs uppercase tracking-[0.3em] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0">{img.cat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. GIFTS */}
      <section className="py-24 bg-[#0E0D0C]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Gift Cards</p>
            <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-6 fade-up gold-shimmer">Gift the Experience</h2>
            <p className="text-white/60 max-w-xl mx-auto fade-up">
              Share the Aurelia experience with those you love. Redeemable for dining, beverages, or private events.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Card Preview */}
            <div className="fade-up flex items-center justify-center lg:sticky lg:top-32">
              <div className="w-full max-w-sm border border-gold bg-[#161412] p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
                <p className="text-gold text-xs tracking-[0.4em] uppercase font-bold">Aurelia</p>
                <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mt-1">Fine Dining &middot; Ahmedabad</p>
                <div className="my-8">
                  <div className="w-px h-8 bg-gold/30 mx-auto" />
                </div>
                <p className="text-white/50 text-xs uppercase tracking-[0.25em]">Gift Card</p>
                <p className="font-forum text-5xl text-gold mt-3 gold-shimmer">₹{gift.amount.toLocaleString("en-IN")}</p>
                <div className="my-8">
                  <div className="w-px h-8 bg-gold/30 mx-auto" />
                </div>
                {gift.toName && <p className="text-white/60 text-sm">For: <span className="text-white">{gift.toName}</span></p>}
                {!gift.toName && <p className="text-white/30 text-sm italic">For: Recipient Name</p>}
              </div>
            </div>

            {/* Form */}
            <div className="fade-up space-y-8">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-[0.25em] mb-3">Card Style</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "Classic Gold", bg: "bg-gradient-to-br from-[#B8973A] to-[#8B6914]", ring: "border-gold" },
                    { name: "Midnight Black", bg: "bg-[#0E0D0C]", ring: "border-white/30" },
                    { name: "Marble White", bg: "bg-[#E8E4DD]", ring: "border-white/50" },
                  ].map((style) => (
                    <button key={style.name} type="button" onClick={() => setGift((p) => ({ ...p, cardStyle: style.name }))} className={`border-2 ${gift.cardStyle === style.name ? style.ring + " border-opacity-100" : "border-transparent"} p-3 transition-all`}>
                      <div className={`w-full aspect-[3/2] ${style.bg} mb-2`} />
                      <p className="text-xs text-white/60 text-center">{style.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white/50 text-xs uppercase tracking-[0.25em] mb-3">Select Amount</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {presetAmounts.map((a) => (
                    <button key={a} type="button" onClick={() => setGift((p) => ({ ...p, amount: a }))} className={`py-2.5 text-sm border transition-all ${gift.amount === a && !gift.customAmount ? "border-gold bg-gold/10 text-gold" : "border-[#2A2723] text-white/60 hover:border-gold/50"}`}>
                      ₹{a.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
                <input type="number" placeholder="Custom amount" min="500" className="w-full bg-[#161412] border border-[#2A2723] px-5 py-3 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors text-sm" onChange={(e) => { const v = parseInt(e.target.value) || 0; if (v > 0) setGift((p) => ({ ...p, amount: v, customAmount: true })); }} />
              </div>

              <div>
                <p className="text-white/50 text-xs uppercase tracking-[0.25em] mb-3">Purchase Details</p>
                <div className="space-y-3">
                  <input type="text" placeholder="Your Name (From) *" required className="w-full bg-[#161412] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors" value={gift.fromName} onChange={(e) => setGift((p) => ({ ...p, fromName: e.target.value }))} />
                  <input type="text" placeholder="Recipient's Name (To) *" required className="w-full bg-[#161412] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors" value={gift.toName} onChange={(e) => setGift((p) => ({ ...p, toName: e.target.value }))} />
                  <input type="email" placeholder="Recipient's Email *" required className="w-full bg-[#161412] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors" value={gift.toEmail} onChange={(e) => setGift((p) => ({ ...p, toEmail: e.target.value }))} />
                  <textarea placeholder="Personal Message (Optional)" rows="3" className="w-full bg-[#161412] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/40 focus:border-gold focus:outline-none transition-colors resize-none" value={gift.message} onChange={(e) => setGift((p) => ({ ...p, message: e.target.value }))} />
                </div>
              </div>

              <div className="border border-[#2A2723] bg-[#161412] p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Gift Card Value</span>
                  <span className="text-white">₹{gift.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Processing Fee</span>
                  <span className="text-gold">Free</span>
                </div>
                <div className="border-t border-[#2A2723] pt-3 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-gold font-forum text-2xl">₹{gift.amount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button type="button" onClick={(e) => e.preventDefault()} className="btn-gold w-full breathe text-center"><span>Purchase Gift Card — ₹{gift.amount.toLocaleString("en-IN")}</span></button>
              <p className="text-white/40 text-xs leading-relaxed text-center">
                Gift cards are valid for 12 months from purchase and may be used for dining, events, or tasting sessions. Non-refundable.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
