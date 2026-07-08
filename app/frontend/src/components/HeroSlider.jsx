import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const slides = [
  {
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1880&q=85",
    subtitle: "Fresh & Vibrant",
    title: ["Celebrating the", "art of vegetables"],
    text: "Farm-fresh ingredients crafted into memorable plant-forward dishes.",
  },
  {
    img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1880&q=85",
    subtitle: "A Delightful Experience",
    title: ["Flavors inspired by", "the seasons"],
    text: "Every dish celebrates the best of each season's harvest.",
  },
  {
    img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1880&q=85",
    subtitle: "Elegant & Welcoming",
    title: ["Where every plate", "tells a story"],
    text: "Curated pairings and warm ambience for a perfect evening.",
  },
];

function CinematicCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, particles = [], raf;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * w;
        this.y = h + 20 + Math.random() * 40;
        this.size = 1.5 + Math.random() * 4;
        this.speedY = -(0.4 + Math.random() * 1.2);
        this.speedX = (Math.random() - 0.5) * 0.6;
        this.life = 1;
        this.decay = 0.003 + Math.random() * 0.008;
        this.hue = 15 + Math.random() * 30;
        this.sat = 60 + Math.random() * 30;
        this.light = 45 + Math.random() * 35;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        if (this.life <= 0 || this.y < -20) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, ${this.life * 0.7})`;
        ctx.fill();
        ctx.shadowColor = `hsla(${this.hue}, 80%, 55%, ${this.life * 0.3})`;
        ctx.shadowBlur = 20;
      }
    }

    const init = () => {
      resize();
      particles = Array.from({ length: 120 }, () => new Particle());
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.shadowBlur = 0;
      particles.forEach((p) => { p.update(); p.draw(); });
      raf = requestAnimationFrame(frame);
    };

    init();
    frame();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-cinematic-canvas" />;
}

const MemoizedCinematicCanvas = React.memo(CinematicCanvas);

export default function HeroSlider() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="home" data-testid="hero-section" className="relative h-screen min-h-[720px] w-full overflow-hidden">
      {slides.map((s, idx) => (
        <div key={idx} className={`slide absolute inset-0 ${i === idx ? "active" : ""}`}>
          <div className="slide-bg absolute inset-0">
            <img src={s.img} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E0D0C] via-[#0E0D0C]/80 to-[#0E0D0C]/65" />
          </div>
          <div className="sparkle-container">
            <span className="sparkle-diamond" style={{ "--x": "15%", "--y": "20%", "--delay": "0.5s" }} />
            <span className="sparkle-diamond" style={{ "--x": "75%", "--y": "30%", "--delay": "1.8s" }} />
            <span className="sparkle-diamond" style={{ "--x": "50%", "--y": "15%", "--delay": "3.2s" }} />
            <span className="sparkle-diamond" style={{ "--x": "85%", "--y": "60%", "--delay": "2.4s" }} />
            <span className="sparkle-diamond" style={{ "--x": "10%", "--y": "65%", "--delay": "0.9s" }} />
          </div>
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4 reveal">{s.subtitle}</p>
            <span className="diamond mb-6 reveal reveal-delay-1" />
            <h1 className="font-forum text-5xl sm:text-7xl lg:text-8xl leading-[1] mb-6 max-w-4xl gold-shimmer">
              {s.title[0]}<br />{s.title[1]}
            </h1>
            <p className="max-w-lg text-white/70 mb-8 reveal reveal-delay-2">{s.text}</p>
            <Link data-testid="hero-cta" to="/menu" className="btn-gold breathe reveal reveal-delay-3"><span>View Our Menu</span></Link>
          </div>
        </div>
      ))}

      <MemoizedCinematicCanvas />
      <div className="hero-grain" />
      <div className="hero-vignette" />

      <div className="hero-pizza" aria-hidden="true">
        <img
          src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=420&q=85"
          alt=""
        />
      </div>

      <button
        data-testid="hero-prev"
        onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)}
        className="ripple hidden md:grid absolute left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 place-items-center border border-gold text-gold rotate-45 hover:bg-gold hover:text-black transition-colors"
      >
        <ChevronLeft className="-rotate-45" />
      </button>
      <button
        data-testid="hero-next"
        onClick={() => setI((v) => (v + 1) % slides.length)}
        className="ripple hidden md:grid absolute right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 place-items-center border border-gold text-gold rotate-45 hover:bg-gold hover:text-black transition-colors"
      >
        <ChevronRight className="-rotate-45" />
      </button>

      <Link
        data-testid="hero-book"
        to="/reserve"
        className="ripple absolute top-1/2 right-4 sm:right-8 z-20 -translate-y-1/2 w-20 h-20 sm:w-28 sm:h-28 bg-gold text-black rounded-full flex flex-col items-center justify-center text-[8px] sm:text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-gold/30"
      >
        Book<br />A Table
      </Link>
    </section>
  );
}
