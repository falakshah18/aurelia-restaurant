import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Footer() {
  const [email, setEmail] = useState("");

  const subscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("You're subscribed! Welcome to the Aurelia community.");
    setEmail("");
  };

  return (
    <footer data-testid="site-footer" className="relative pt-24 pb-10 border-t" style={{ backgroundColor: "var(--bg, #0E0D0C)", borderColor: "var(--card-border, #2A2723)" }}>
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16 items-start">
        <div>
          <span className="font-forum text-4xl text-gold tracking-widest">AURELIA</span>
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            Restaurant St, Ahmedabad 380001,<br /> Gujarat, India
          </p>
          <a href="mailto:booking@aurelia.com" className="block mt-3 text-base hover-underline">
            booking@aurelia.com
          </a>
          <a href="tel:+88123123456" className="block mt-1 text-base hover-underline">
            +88-123-123456
          </a>
          <p className="mt-3 text-sm text-white/60">Open : 09:00 am — 11:00 pm</p>
        </div>

        <div>
          <p className="font-forum text-2xl text-gold">Get News & Offers</p>
          <p className="mt-3 text-sm text-white/70">
            Subscribe & get <span className="text-gold">25% off</span> on your first reservation.
          </p>
          <form className="mt-6 flex" onSubmit={subscribe}>
            <input
              data-testid="footer-newsletter-input"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark rounded-none flex-1"
            />
            <button data-testid="footer-newsletter-btn" className="btn-gold btn-gold-solid ml-2">
              <span>Subscribe</span>
            </button>
          </form>
        </div>

        <div className="md:text-right">
          <p className="font-forum text-2xl text-gold">Quick Links</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover-underline">Home</Link></li>
            <li><Link to="/menu" className="hover-underline">Menu</Link></li>
            <li><Link to="/about" className="hover-underline">About</Link></li>
            <li><Link to="/reserve" className="hover-underline">Reserve</Link></li>
            <li><Link to="/journal" className="hover-underline">Journal</Link></li>
            <li><Link to="/sustainability" className="hover-underline">Sustainability</Link></li>
            <li><Link to="/contact" className="hover-underline">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-6 border-t border-[#2A2723] text-center text-xs text-white/50">
        © 2026 Aurelia. Crafted with care. All Rights Reserved.
      </div>
    </footer>
  );
}
