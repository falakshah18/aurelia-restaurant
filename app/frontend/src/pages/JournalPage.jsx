import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const categories = ["All", "Seasonal", "Recipes", "Producer Stories", "Beverages", "Behind the Scenes"];

const articles = [
  {
    id: 1,
    cat: "Seasonal",
    date: "July 2026",
    title: "The Monsoon Kitchen: How Rain Changes Our Menu",
    excerpt: "When the clouds roll in over Ahmedabad, our kitchen transforms. The humidity alters how dough rises, how vegetables behave, and how we approach every plate. Here's how we lean into the season instead of fighting it.",
    hero: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=85",
    author: "Laurent Beaumont",
    readTime: "8 min read",
    featured: true,
  },
  {
    id: 2,
    cat: "Producer Stories",
    date: "June 2026",
    title: "Visit to the Organic Farm: Meet the Growers Behind Our Greens",
    excerpt: "We drove forty minutes outside the city to visit the family farm that supplies our weekly vegetables. Their soil-first philosophy mirrors our kitchen's commitment to seasonal authenticity.",
    hero: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1200&q=85",
    author: "Isabelle Beaumont",
    readTime: "12 min read",
    featured: false,
  },
  {
    id: 3,
    cat: "Beverages",
    date: "May 2026",
    title: "Crafting the Perfect Mocktail: Our Beverage Director's Guide",
    excerpt: "Our beverage director Clara Voss explores the art of balancing botanical infusions, fresh citrus, and house-made cordials to create mocktails that rival any cocktail.",
    hero: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=1200&q=85",
    author: "Clara Voss",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: 4,
    cat: "Recipes",
    date: "April 2026",
    title: "The Perfect Margherita: A Study in Restraint",
    excerpt: "Four ingredients. Three minutes in the oven. A lifetime to master. Our pizza station lead breaks down the technique, timing, and temperature behind our signature pizza.",
    hero: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200&q=85",
    author: "Marcus Chen",
    readTime: "10 min read",
    featured: false,
  },
  {
    id: 5,
    cat: "Behind the Scenes",
    date: "March 2026",
    title: "Before the Doors Open: A Night in the Prep Kitchen",
    excerpt: "At 3 PM, the kitchen is quiet. By 5:30, every station is loaded, every sauce is tasting, and the team is locked in. Follow the two hours before service begins.",
    hero: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=85",
    author: "Elena Rodriguez",
    readTime: "7 min read",
    featured: false,
  },
  {
    id: 6,
    cat: "Seasonal",
    date: "February 2026",
    title: "Winter Citrus: The Flavors That Carry Us Through Cold Months",
    excerpt: "Blood oranges, kumquats, and Meyer lemons aren't just garnishes. They're structural ingredients that shape the balance of our winter tasting menu.",
    hero: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=1200&q=85",
    author: "Isabelle Beaumont",
    readTime: "9 min read",
    featured: false,
  },
  {
    id: 7,
    cat: "Beverages",
    date: "January 2026",
    title: "Why We Embraced Botanical Mocktails at Aurelia",
    excerpt: "Fresh, herbaceous, alive. Our decision to craft house-made botanical beverages wasn't just trend-chasing — it was a philosophical alignment with how we cook.",
    hero: "https://images.unsplash.com/photo-1546173159-315724a31696?w=1200&q=85",
    author: "Clara Voss",
    readTime: "5 min read",
    featured: false,
  },
  {
    id: 8,
    cat: "Producer Stories",
    date: "December 2025",
    title: "The Olive Oil Maker: A Two-Hour Drive That Changes Everything",
    excerpt: "Our cold-pressed extra virgin comes from a family press in Gujarat. The drive there taught us more about patience than any cookbook ever could.",
    hero: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1200&q=85",
    author: "Laurent Beaumont",
    readTime: "11 min read",
    featured: false,
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

function ArticleCard({ article, large = false, onOpen }) {
  return (
    <FadeUp className={`${large ? "lg:col-span-2 lg:row-span-2" : ""}`}>
      <article
        onClick={() => onOpen(article)}
        className="group relative overflow-hidden bg-[#161412] border border-[#2A2723] hover:border-[hsl(38,61%,73%)]/40 transition-all duration-700 cursor-pointer h-full"
      >
        <div className={`relative overflow-hidden ${large ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
          <img
            src={article.hero}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0C] via-[#0E0D0C]/20 to-transparent" />
          <div className="absolute top-4 left-4 flex items-center gap-3">
            <span className="bg-gold/90 text-[#0E0D0C] text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1">
              {article.cat}
            </span>
            <span className="text-white/60 text-[11px]">{article.date}</span>
          </div>
        </div>
        <div className="p-6 lg:p-8">
          <h3 className={`font-forum ${large ? "text-3xl lg:text-4xl" : "text-xl lg:text-2xl"} text-white group-hover:text-gold transition-colors duration-500 mb-3 leading-tight`}>
            {article.title}
          </h3>
          <p className="text-white/50 text-sm leading-relaxed mb-5 line-clamp-3">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between border-t border-[#2A2723] pt-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[hsl(38,61%,73%)]/20 flex items-center justify-center">
                <span className="text-gold text-xs font-bold">{article.author.charAt(0)}</span>
              </div>
              <div>
                <p className="text-white/80 text-xs font-bold">{article.author}</p>
                <p className="text-white/40 text-[10px]">{article.readTime}</p>
              </div>
            </div>
            <span className="text-gold text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              Read →
            </span>
          </div>
        </div>
      </article>
    </FadeUp>
  );
}

export default function JournalPage() {
  const [active, setActive] = useState("All");
  const [openArticle, setOpenArticle] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);

  const subscribeNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("You're subscribed to The Journal.");
    setNewsletterEmail("");
    setNewsletterSent(true);
  };

  const filtered = active === "All" ? articles : articles.filter((a) => a.cat === active);
  const featured = filtered.find((a) => a.featured) || filtered[0];
  const rest = filtered.filter((a) => a.id !== featured?.id);

  return (
    <div className="pt-36 pb-24 min-h-screen">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden mb-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1600&q=85"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E0D0C]/60 via-[#0E0D0C]/80 to-[#0E0D0C]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <FadeUp>
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">The Journal</p>
            <h1 className="font-forum text-6xl sm:text-8xl gold-shimmer mb-6">Stories From<br />The Kitchen</h1>
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="h-px w-16 bg-[#2A2723]" />
              <span className="diamond" />
              <span className="h-px w-16 bg-[#2A2723]" />
            </div>
            <p className="text-white/50 max-w-xl mx-auto text-lg leading-relaxed">
              Seasonal ingredient spotlights, recipe essays, producer visits, and beverage stories.
              Each piece is a window into how we think about food.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ═══ CATEGORY FILTER ═══ */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <FadeUp>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-5 py-2.5 text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 border ${
                  active === cat
                    ? "bg-gold text-[#0E0D0C] border-gold"
                    : "bg-transparent text-white/50 border-[#2A2723] hover:border-gold/50 hover:text-gold"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </FadeUp>
      </section>

      {/* ═══ FEATURED ARTICLE ═══ */}
      {featured && (
        <section className="max-w-7xl mx-auto px-6 mb-16">
          <ArticleCard article={featured} large onOpen={setOpenArticle} />
        </section>
      )}

      {/* ═══ ARTICLE GRID ═══ */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} onOpen={setOpenArticle} />
          ))}
        </div>
      </section>

      {/* ═══ NEWSLETTER CTA ═══ */}
      <section className="max-w-4xl mx-auto px-6">
        <FadeUp>
          <div className="bg-[#161412] border border-[#2A2723] p-10 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(38,61%,73%)]/5 to-transparent" />
            <div className="relative z-10">
              <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Stay Informed</p>
              <h2 className="font-forum text-4xl mb-4">Get the Journal</h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                A monthly letter from the kitchen — seasonal notes, new dishes, and the stories behind them.
              </p>
              {newsletterSent ? (
                <p className="text-gold text-sm">You're subscribed. Check your inbox.</p>
              ) : (
                <form onSubmit={subscribeNewsletter} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="bg-[#0E0D0C] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/30 focus:border-gold focus:outline-none transition-colors flex-1 w-full"
                  />
                  <button type="submit" className="btn-gold btn-gold-solid whitespace-nowrap"><span>Subscribe</span></button>
                </form>
              )}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ═══ ARTICLE DETAIL MODAL ═══ */}
      {openArticle && (
        <ArticleDetail article={openArticle} onClose={() => setOpenArticle(null)} />
      )}
    </div>
  );
}

function ArticleDetail({ article, onClose }) {
  const bodyParagraphs = article.excerpt
    ? article.excerpt.split(/(?<=[.!?])\s+/).reduce((acc, sentence, i) => {
        if (i % 3 === 0) acc.push(sentence);
        else acc[acc.length - 1] += " " + sentence;
        return acc;
      }, [])
    : [];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);

  const subscribeNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("You're subscribed to The Journal.");
    setNewsletterEmail("");
    setNewsletterSent(true);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-[#0E0D0C]/95 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-4xl mx-auto py-20 px-6" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="text-white/40 hover:text-gold text-sm tracking-widest uppercase mb-8 block transition-colors">
          ← Back to Journal
        </button>
        <div className="relative aspect-[16/9] mb-10 overflow-hidden">
          <img src={article.hero} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0C] via-transparent to-transparent" />
        </div>
        <div className="flex items-center gap-4 mb-6">
          <span className="bg-gold/90 text-[#0E0D0C] text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1">{article.cat}</span>
          <span className="text-white/40 text-xs">{article.date}</span>
          <span className="text-white/40 text-xs">{article.readTime}</span>
        </div>
        <h1 className="font-forum text-4xl lg:text-5xl text-white mb-6 leading-tight">{article.title}</h1>
        <div className="flex items-center gap-3 mb-10 pb-10 border-b border-[#2A2723]">
          <div className="w-10 h-10 rounded-full bg-[hsl(38,61%,73%)]/20 flex items-center justify-center">
            <span className="text-gold text-sm font-bold">{article.author.charAt(0)}</span>
          </div>
          <div>
            <p className="text-white/80 text-sm font-bold">{article.author}</p>
            <p className="text-white/40 text-xs">Contributing Writer</p>
          </div>
        </div>
        <div className="space-y-6 text-white/60 text-base leading-[1.8]">
          {bodyParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-16 border-t border-[#2A2723] pt-10">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4 text-center">Continue Reading</p>
          <div className="text-center mb-8">
            <button onClick={onClose} className="btn-gold btn-gold-solid"><span>Back to Journal</span></button>
          </div>

          <div className="bg-[#161412] border border-[#2A2723] p-8 lg:p-12 text-center">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-3">Get The Journal</p>
            <h3 className="font-forum text-2xl text-white mb-2">Monthly stories from the kitchen</h3>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
              Seasonal notes, new dishes, and the stories behind them. Delivered monthly.
            </p>
            {newsletterSent ? (
              <p className="text-gold text-sm">You're subscribed. Check your inbox.</p>
            ) : (
              <form onSubmit={subscribeNewsletter} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-[#0E0D0C] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/30 focus:border-gold focus:outline-none transition-colors flex-1 w-full"
                />
                <button type="submit" className="btn-gold btn-gold-solid whitespace-nowrap"><span>Subscribe</span></button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
