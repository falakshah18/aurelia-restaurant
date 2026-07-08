import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSlider from "@/components/HeroSlider";
import useFadeInOnScroll from "@/lib/useFadeIn";
import { api } from "@/lib/api";

const services = [
  { title: "Truffle", img: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=600&q=80" },
  { title: "Salads", img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80" },
  { title: "Drinks", img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&q=80" },
];

const features = [
  {
    t: "Hygienic Food",
    d: "Prepared with the highest standards of cleanliness.",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=260&q=80",
  },
  {
    t: "Fresh Environment",
    d: "An ambience curated for a memorable evening.",
    img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=260&q=80",
  },
  {
    t: "Skilled Chefs",
    d: "Michelin-trained artisans behind every plate.",
    img: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=260&q=80",
  },
  {
    t: "Event & Party",
    d: "Host private dinners, tastings & celebrations.",
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=260&q=80",
  },
];

const fallbackMenu = [
  {
    id: "home-fallback-1",
    name: "Truffle Mushroom Pizza",
    price: 895,
    badge: "Signature",
    description: "Wood-fired crust, wild mushrooms, fontina, black truffle cream, and thyme.",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=220&q=85",
  },
  {
    id: "home-fallback-2",
    name: "Wild Mushroom Risotto",
    price: 995,
    badge: "Chef Pick",
    description: "Arborio rice, wild mushrooms, truffle oil, parmesan, and fresh thyme.",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=220&q=85",
  },
  {
    id: "home-fallback-3",
    name: "Herb Ricotta Ravioli",
    price: 795,
    description: "House-made ravioli, ricotta, lemon zest, sage butter, and toasted pine nuts.",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=220&q=85",
  },
  {
    id: "home-fallback-4",
    name: "Burrata & Heirloom Tomato",
    price: 595,
    description: "Creamy burrata, basil oil, aged balsamic, sea salt, and toasted sourdough.",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=220&q=85",
  },
  {
    id: "home-fallback-5",
    name: "Roasted Cauliflower Steak",
    price: 845,
    description: "Herb-crusted cauliflower, romesco sauce, almond gremolata, and micro greens.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=220&q=85",
  },
  {
    id: "home-fallback-6",
    name: "Honey Semifreddo",
    price: 595,
    badge: "Sweet",
    description: "Whipped honey cream, almond crumble, roasted figs, and espresso syrup.",
    image: "https://images.unsplash.com/photo-1509043759401-537742b608eb?w=220&q=85",
  },
];

const events = [
  {
    d: "15/09/2026", cat: "Harvest Dinner",
    t: "A seasonal tasting menu celebrating local farms.",
    img: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=700&q=80",
  },
  {
    d: "08/09/2026", cat: "Wine Pairing",
    t: "An evening of curated organic wine and small plates.",
    img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=700&q=80",
  },
  {
    d: "03/09/2026", cat: "Chef's Table",
    t: "An intimate evening with the chef and seasonal creations.",
    img: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=700&q=80",
  },
];

const experiences = [
  {
    key: "chef",
    label: "Chef Counter",
    title: "A front-row seat to fire, craft, and plating.",
    text: "Settle into the counter while our chefs finish tasting portions, pour sauces tableside, and talk through the evening's best ingredients.",
    img: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=900&q=85",
  },
  {
    key: "terrace",
    label: "Garden Terrace",
    title: "Golden-hour dining with a slower rhythm.",
    text: "A relaxed outdoor table for spritzes, handmade pizza, and long conversations under warm lamps.",
    img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=900&q=85",
  },
  {
    key: "private",
    label: "Private Dining",
    title: "A quiet room for celebrations that matter.",
    text: "Choose a custom tasting menu, wine pairings, floral styling, and a dedicated host for the whole evening.",
    img: "https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=900&q=85",
  },
];

const ambienceSlides = [
  {
    title: "Candlelit Supper",
    text: "Soft light, slow service, and plates designed for sharing.",
    img: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=85",
  },
  {
    title: "Garden Terrace",
    text: "Golden-hour dining surrounded by herbs and seasonal blooms.",
    img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1200&q=85",
  },
  {
    title: "Weekend Brunch",
    text: "Bright plates, fresh juice, and a table full of seasonal delights.",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=85",
  },
];

export default function Home() {
  const ref = useFadeInOnScroll();
  const [menu, setMenu] = useState(fallbackMenu);
  const [activeExperience, setActiveExperience] = useState(experiences[0]);
  const [ambience, setAmbience] = useState(0);

  useEffect(() => {
    api.get("/menu")
      .then(({ data }) => setMenu(data.length ? data.slice(0, 6) : fallbackMenu))
      .catch(() => setMenu(fallbackMenu));
  }, []);

  return (
    <div ref={ref}>
      <HeroSlider />

      {/* SERVICE */}
      <section className="py-24 bg-[#161412] text-center">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Flavors For Royalty</p>
          <span className="diamond my-4 fade-up" />
          <h2 className="font-forum text-5xl sm:text-6xl mb-6 fade-up gold-shimmer">We Offer Top Notch</h2>
          <p className="max-w-xl mx-auto text-white/60 mb-16 fade-up">
            An unforgettable dining experience curated from farm-fresh ingredients and the finest artisanal recipes.
          </p>
          <div className="grid md:grid-cols-3 gap-10">
            {services.map((s) => (
              <div key={s.title} className="fade-up group hover-lift">
                <div className="image-mask overflow-hidden aspect-[5/6]">
                  <img
                    src={s.img}
                    alt={s.title}
                    className="w-full h-full object-cover transition-transform duration-[900ms] group-hover:scale-110"
                  />
                </div>
                <h3 className="font-forum text-3xl mt-6">{s.title}</h3>
                <Link to="/menu" className="hover-underline text-xs uppercase tracking-[0.25em] text-gold mt-2 inline-block">
                  View Menu
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
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
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=85"
                alt=""
              />
            </div>
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=85"
              alt="about"
              className="w-full aspect-[4/5] object-cover chef-mask"
            />
            <div className="absolute -bottom-10 -left-6 w-40 h-40 bg-gold text-black p-4 hidden sm:grid place-items-center text-center">
              <p className="font-forum text-2xl leading-tight">Since<br />1995</p>
            </div>
          </div>
        </div>
      </section>

      {/* SPECIAL DISH */}
      <section className="grid lg:grid-cols-2 bg-[#161412]">
        <img
          src="https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=600&q=80"
          alt="dish"
          className="w-full h-full object-cover min-h-[300px] max-h-[500px]"
        />
        <div className="p-12 lg:p-24 fade-up">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Special Dish</p>
          <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-6">Truffle Mushroom Risotto</h2>
          <p className="text-white/70 mb-6 leading-relaxed">
            Creamy arborio rice simmered with wild mushrooms, finished with black truffle shavings and aged parmesan.
          </p>
          <div className="flex items-center gap-4 mb-8">
            <span className="text-white/40 line-through text-lg">₹1,095</span>
            <span className="text-gold font-forum text-3xl">₹995</span>
          </div>
          <Link to="/menu" className="btn-gold"><span>View All Menu</span></Link>
        </div>
      </section>

      {/* EXPERIENCE TABS */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Choose Your Evening</p>
            <h2 className="font-forum text-5xl sm:text-6xl mt-4 fade-up">Dining Experiences</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-12 fade-up" role="tablist" aria-label="Dining experiences">
            {experiences.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={activeExperience.key === item.key}
                onClick={() => setActiveExperience(item)}
                className={`experience-tab ${activeExperience.key === item.key ? "active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div className="fade-up image-mask">
              <img
                src={activeExperience.img}
                alt={activeExperience.label}
                className="w-full aspect-[16/11] object-cover transition-all duration-700"
              />
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

      {/* MENU */}
      <section id="menu" className="py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gold text-sm font-bold tracking-[0.35em] uppercase fade-up">Special Selection</p>
          <h2 className="font-forum text-6xl sm:text-7xl mt-4 mb-12 fade-up">Delicious Menu</h2>
          <div className="grid md:grid-cols-2 gap-10 text-left">
            {menu.map((m) => (
              <div data-testid="home-menu-card" key={m.id} className="flex gap-6 group menu-hover-line">
                <img
                  src={m.image || "https://images.unsplash.com/photo-1546241072-48010ad2862c?w=200&q=80"}
                  alt={m.name}
                  className="w-24 h-24 object-cover rounded-full transition-transform group-hover:scale-105"
                />
                <div className="flex-1 border-b border-[#2A2723] pb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-forum text-2xl group-hover:text-gold transition-colors">{m.name}</h3>
                    <span className="text-gold font-forum text-xl">₹{m.price}</span>
                  </div>
                  {m.badge && (
                    <span className="text-xs uppercase tracking-widest bg-gold text-black px-3 py-1 mr-2">
                      {m.badge}
                    </span>
                  )}
                  <p className="text-base text-white/70 mt-2 leading-relaxed">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link to="/menu" className="btn-gold breathe"><span>View All Menu</span></Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-14 bg-[#161412] text-center">
        <div className="max-w-3xl mx-auto px-6">
          <p className="font-forum text-6xl text-gold leading-none mb-2">"</p>
          <p className="font-forum text-2xl sm:text-3xl leading-snug fade-up">
            I wanted to thank you for inviting me down for that amazing dinner the other night. The food was extraordinary.
          </p>
          <img
            src="https://images.pexels.com/photos/5108952/pexels-photo-5108952.jpeg?auto=compress&w=200"
            alt="Sam"
            className="w-16 h-16 rounded-full mx-auto object-cover mt-6"
          />
          <p className="mt-3 text-gold text-xs uppercase tracking-[0.3em] font-bold">Sam Johnson</p>
        </div>
      </section>

      {/* BLUR SLIDER */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Ambience Slider</p>
          <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-12 fade-up">Scenes From The Table</h2>
          <div className="blur-slider fade-up">
            {ambienceSlides.map((slide, idx) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setAmbience(idx)}
                className={`blur-slide ${idx === ambience ? "active" : ""}`}
                aria-label={`Show ${slide.title}`}
              >
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

      {/* FEATURES */}
      <section className="py-24 strength-section">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Why Choose Us</p>
          <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-16 fade-up">Our Strength</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, idx) => (
              <div
                key={f.t}
                className={`fade-up p-8 border border-[#2A2723] hover-lift feature-card ${
                  idx % 2 === 0 ? "bg-[#161412]" : "bg-[#0E0D0C]"
                } hover:border-gold transition-colors`}
              >
                <div className="strength-orbit mx-auto mb-6">
                  <div className="strength-diamond">
                    <img src={f.img} alt="" />
                  </div>
                  <span className="strength-number">{idx + 1}</span>
                </div>
                <h3 className="font-forum text-3xl mb-3">{f.t}</h3>
                <p className="text-base text-white/65 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="py-24 bg-[#161412]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase fade-up">Recent Updates</p>
          <h2 className="font-forum text-5xl sm:text-6xl mt-4 mb-16 fade-up">Upcoming Events</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((e) => (
              <div key={e.d} className="fade-up relative overflow-hidden group image-mask">
                <img
                  src={e.img}
                  alt={e.t}
                  className="w-full aspect-[3/4] object-cover transition-transform duration-[900ms] group-hover:scale-105"
                />
                <span className="absolute top-6 left-6 bg-black text-gold px-3 py-1 text-xs font-bold tracking-widest">
                  {e.d}
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-16 text-left">
                  <p className="text-gold text-[10px] uppercase tracking-widest">{e.cat}</p>
                  <p className="font-forum text-2xl mt-2">{e.t}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
