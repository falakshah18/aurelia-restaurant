import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { Menu, X, LogOut, User as UserIcon, ShieldCheck, PanelTopOpen, ChevronDown, ShoppingCart } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 40);
      setHidden(currentY > 180 && currentY > lastY + 8 && !open);
      if (currentY < lastY - 12 || currentY < 80) setHidden(false);
      lastY = currentY;
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 280));
    await logout();
    setOpen(false);
    setHidden(false);
    setLoggingOut(false);
    nav("/");
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/menu", label: "Menus" },
    { to: "/reserve", label: "Reserve" },
  ];

  const moreLinks = [
    { to: "/team", label: "Chef" },
    { to: "/private-dining", label: "Events" },
    { to: "/journal", label: "Journal" },
    { to: "/sustainability", label: "Sustainability" },
    { to: "/waitlist", label: "Waitlist" },
    { to: "/contact", label: "Contact" },
    { to: "/feedback", label: "Feedback" },
  ];

  return (
    <>
      <header
        data-testid="site-header"
        className={`site-header fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled ? "backdrop-blur-xl border-b py-4 shrunk" : "py-6"
        } ${hidden ? "nav-hidden" : ""}`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
          <Link to="/" data-testid="nav-logo" className="font-forum text-3xl tracking-widest text-gold shrink-0">
            AURELIA
          </Link>

          <nav className="hidden lg:flex items-center gap-5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                data-testid={`nav-link-${l.label.toLowerCase()}`}
                 className={({ isActive }) =>
                   `hover-underline text-base font-bold uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${
                     isActive ? "text-gold active" : "text-white hover:text-gold"
                   }`
                 }
                end={l.to === "/"}
              >
                {l.label}
              </NavLink>
            ))}
            <div className="nav-more shrink-0">
              <button type="button" className="nav-more-button">
                More <ChevronDown size={14} />
              </button>
              <div className="nav-more-menu">
                {moreLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) =>
                      `nav-more-link ${isActive ? "active" : ""}`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              data-testid="nav-cart"
              to="/cart"
              className="relative text-base uppercase tracking-[0.15em] text-white hover:text-gold flex items-center gap-2 whitespace-nowrap"
            >
              <ShoppingCart size={18} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-3 bg-gold text-black text-[10px] font-bold rounded-full w-4 h-4 grid place-items-center">
                  {count}
                </span>
              )}
            </Link>
            {user && user.role === "admin" && (
              <Link
                data-testid="nav-admin"
                to="/admin"
                className="text-base uppercase tracking-[0.15em] text-gold hover-underline flex items-center gap-2 whitespace-nowrap"
              >
                <ShieldCheck size={16} /> Admin
              </Link>
            )}
            {user ? (
              <div className={`auth-pill flex items-center gap-3 ${loggingOut ? "logging-out" : ""}`}>
                <span className="text-base text-white/70 uppercase tracking-[0.15em] flex items-center gap-2 whitespace-nowrap">
                  <UserIcon size={16} /> {user.name}
                </span>
                <button
                  data-testid="nav-logout"
                  onClick={handleLogout}
                  className="text-base uppercase tracking-[0.15em] hover:text-gold flex items-center gap-1 whitespace-nowrap"
                >
                  <LogOut size={16} /> {loggingOut ? "Leaving" : "Logout"}
                </button>
              </div>
            ) : (
              <div className="auth-pill flex items-center gap-3">
                <Link data-testid="nav-login" to="/login" className="text-base uppercase tracking-[0.2em] hover:text-gold whitespace-nowrap">
                  Log In
                </Link>
                <Link data-testid="nav-reserve-cta" to="/reserve" className="btn-gold btn-gold-solid breathe whitespace-nowrap" style={{ fontSize: "18px", padding: "18px 44px" }}>
                  <span>Find A Table</span>
                </Link>
              </div>
            )}
          </div>

          <button
            data-testid="nav-open"
            onClick={() => setOpen(true)}
            className="lg:hidden text-white p-2"
            aria-label="open menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      <button
        type="button"
        onClick={() => setHidden(false)}
        style={{ backgroundColor: "var(--nav-bg, rgba(14,13,12,0.9))" }}
        className={`nav-reveal fixed top-3 right-4 z-50 w-11 h-11 place-items-center border border-gold text-gold backdrop-blur-lg transition-all duration-500 ${
          hidden ? "grid opacity-100 translate-y-0" : "grid opacity-0 -translate-y-8 pointer-events-none"
        }`}
        aria-label="Show navigation"
      >
        <PanelTopOpen size={18} />
      </button>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-500 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/80" />
        <div
          style={{ backgroundColor: "var(--bg, #0E0D0C)", borderColor: "var(--card-border, #2A2723)" }}
          className={`absolute top-0 right-0 h-full w-[85%] max-w-sm border-l p-8 transition-transform duration-500 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-12">
            <span className="font-forum text-3xl text-gold tracking-widest">AURELIA</span>
            <button data-testid="nav-close" onClick={() => setOpen(false)} className="p-2 border border-white/20 rounded-full">
              <X size={20} />
            </button>
          </div>
          <ul className="space-y-5 mb-12">
            {[...links, ...moreLinks].map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `font-forum text-3xl transition-colors ${isActive ? "text-gold" : "text-white"}`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="border-t border-[#2A2723] pt-6 space-y-3 text-sm">
            <Link onClick={() => setOpen(false)} to="/cart" className="block uppercase tracking-widest flex items-center gap-2">
              <ShoppingCart size={16} /> Cart {count > 0 ? `(${count})` : ""}
            </Link>
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    data-testid="mnav-admin"
                    onClick={() => setOpen(false)}
                    to="/admin"
                    className="block text-gold uppercase tracking-widest"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  data-testid="mnav-logout"
                  onClick={handleLogout}
                  className="block uppercase tracking-widest"
                >
                  {loggingOut ? "Leaving" : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link onClick={() => setOpen(false)} to="/login" className="block uppercase tracking-widest">
                  Log In
                </Link>
                <Link onClick={() => setOpen(false)} to="/register" className="block text-gold uppercase tracking-widest">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
