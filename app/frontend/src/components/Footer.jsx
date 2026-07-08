import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="relative bg-[#0E0D0C] pt-24 pb-10 border-t border-[#2A2723]">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-16 items-start">
        <div>
          <span className="font-forum text-4xl text-gold tracking-widest">AURELIA</span>
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            Restaurant St, Delicious City,<br /> London 9578, UK
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
          <form className="mt-6 flex" onSubmit={(e) => e.preventDefault()}>
            <input
              data-testid="footer-newsletter-input"
              type="email"
              placeholder="Your email"
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
