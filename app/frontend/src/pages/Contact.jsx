import { useState, useEffect, useRef } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail, Clock, ArrowRight, Send } from "lucide-react";

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

export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/contact", f);
      setTimeout(() => {
        toast.success("Message received — we'll respond within 24 hours.");
      }, 900);
      setF({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed to send message");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-36 pb-24 min-h-screen">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden mb-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=85"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0E0D0C]/60 via-[#0E0D0C]/80 to-[#0E0D0C]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <FadeUp>
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-4">Get In Touch</p>
            <h1 className="font-forum text-6xl sm:text-8xl gold-shimmer mb-6">Contact Us</h1>
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="h-px w-16 bg-[#2A2723]" />
              <span className="diamond" />
              <span className="h-px w-16 bg-[#2A2723]" />
            </div>
            <p className="text-white/50 max-w-xl mx-auto text-lg leading-relaxed">
              Whether you're planning an intimate dinner, a celebration, or simply have a question — we'd love to hear from you.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ═══ QUICK CONTACT STRIP ═══ */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <MapPin size={20} />, label: "Visit Us", text: "SG Highway, Ahmedabad\nGujarat 380015", delay: 0 },
            { icon: <Phone size={20} />, label: "Call Us", text: "+88-123-123456\nMon–Sat, 10am–10pm", delay: 80 },
            { icon: <Mail size={20} />, label: "Email Us", text: "booking@aurelia.com\nevents@aurelia.com", delay: 160 },
            { icon: <Clock size={20} />, label: "Hours", text: "Lunch: 11am–2:30pm\nDinner: 5:30pm–11pm", delay: 240 },
          ].map((item, i) => (
            <FadeUp key={i} delay={item.delay}>
              <div className="group bg-[#161412] border border-[#2A2723] p-6 h-full text-center hover:border-[hsl(38,61%,73%)]/40 transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[hsl(38,61%,73%)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="w-12 h-12 mx-auto mb-4 border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold/10 transition-all duration-500">
                  {item.icon}
                </div>
                <p className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-2">{item.label}</p>
                <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{item.text}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ═══ TWO-COLUMN: FORM + MAP ═══ */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-10">
          {/* LEFT — Form */}
          <FadeUp>
            <div className="bg-[#161412] border border-[#2A2723] p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase mb-2">Send a Message</p>
                  <h2 className="font-forum text-3xl">Write to Us</h2>
                </div>
                <Send size={24} className="text-gold/30" />
              </div>

              <form onSubmit={submit} data-testid="contact-form" className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Your Name</label>
                    <input
                      data-testid="contact-name"
                      required
                      placeholder="John Doe"
                      className="bg-[#0E0D0C] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/30 focus:border-gold focus:outline-none transition-colors w-full"
                      value={f.name}
                      onChange={(e) => setF({ ...f, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Email Address</label>
                    <input
                      data-testid="contact-email"
                      required
                      type="email"
                      placeholder="you@example.com"
                      className="bg-[#0E0D0C] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/30 focus:border-gold focus:outline-none transition-colors w-full"
                      value={f.email}
                      onChange={(e) => setF({ ...f, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Subject</label>
                  <input
                    data-testid="contact-subject"
                    placeholder="Reservation inquiry, private event, feedback..."
                    className="bg-[#0E0D0C] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/30 focus:border-gold focus:outline-none transition-colors w-full"
                    value={f.subject}
                    onChange={(e) => setF({ ...f, subject: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-widest mb-2 block">Message</label>
                  <textarea
                    data-testid="contact-message"
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className="bg-[#0E0D0C] border border-[#2A2723] px-5 py-3.5 text-white placeholder-white/30 focus:border-gold focus:outline-none transition-colors w-full resize-none"
                    value={f.message}
                    onChange={(e) => setF({ ...f, message: e.target.value })}
                  />
                </div>
                <button
                  data-testid="contact-submit"
                  disabled={busy}
                  className="btn-gold btn-gold-solid w-full group flex items-center justify-center gap-3"
                >
                  <span>{busy ? "Sending..." : "Send Message"}</span>
                  {!busy && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          </FadeUp>

          {/* RIGHT — Map + Info */}
          <div className="space-y-6">
            <FadeUp delay={100}>
              <div className="overflow-hidden border border-[#2A2723] relative" style={{ height: "300px" }}>
                <iframe
                  src="https://maps.google.com/maps?q=SG+Highway+Ahmedabad+Gujarat+India&output=embed&z=13"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "grayscale(0.5) contrast(1.1)" }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Aurelia Restaurant Location"
                />
                <div className="absolute inset-0 pointer-events-none border border-gold/10" />
              </div>
              <a
                href="https://www.google.com/maps/search/SG+Highway+Ahmedabad+Gujarat+India"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 mt-3 text-gold text-xs font-bold tracking-[0.25em] uppercase hover:underline"
              >
                <MapPin size={14} /> Open in Google Maps
              </a>
            </FadeUp>

            {/* Social Links */}
            <FadeUp delay={200}>
              <div className="bg-[#161412] border border-[#2A2723] p-6">
                <p className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-5">Follow Aurelia</p>
                <div className="space-y-3">
                  {[
                    { icon: <Instagram size={16} />, label: "@aurelia_ahmedabad", href: "https://instagram.com/aurelia_ahmedabad" },
                    { icon: <Facebook size={16} />, label: "Aurelia Ahmedabad", href: "https://facebook.com/AureliaAhmedabad" },
                    { icon: <Twitter size={16} />, label: "@aurelialnd", href: "https://twitter.com/aurelialnd" },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-white/50 text-sm hover:text-gold transition-colors group"
                    >
                      <span className="text-gold/60 group-hover:text-gold transition-colors">{s.icon}</span>
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </FadeUp>

            {/* Quick note */}
            <FadeUp delay={300}>
              <div className="bg-gradient-to-br from-[hsl(38,61%,73%)]/10 to-transparent border border-[hsl(38,61%,73%)]/20 p-6 text-center">
                <p className="font-forum text-xl text-gold mb-2">Prefer to Call?</p>
                <p className="text-white/40 text-sm mb-4">Our team is available during opening hours.</p>
                <a href="tel:+88123123456" className="btn-gold"><span>+88-123-123456</span></a>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL CARDS ═══ */}
      <section className="max-w-7xl mx-auto px-6">
        <FadeUp>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: <Instagram size={22} />, title: "Instagram", handle: "@aurelia_ahmedabad", href: "https://instagram.com/aurelia_ahmedabad" },
              { icon: <Facebook size={22} />, title: "Facebook", handle: "Aurelia Ahmedabad", href: "https://facebook.com/AureliaAhmedabad" },
              { icon: <Twitter size={22} />, title: "Twitter", handle: "@aurelialnd", href: "https://twitter.com/aurelialnd" },
            ].map((s, i) => (
              <a
                key={i}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#161412] border border-[#2A2723] p-6 flex items-center gap-4 hover:border-[hsl(38,61%,73%)]/40 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-0 bg-gold group-hover:h-full transition-all duration-700" />
                <span className="text-gold group-hover:scale-110 transition-transform">{s.icon}</span>
                <div>
                  <p className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-0.5">{s.title}</p>
                  <p className="text-white/50 text-sm">{s.handle}</p>
                </div>
              </a>
            ))}
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
