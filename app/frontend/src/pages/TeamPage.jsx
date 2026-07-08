import { useRef } from "react";
import { Link } from "react-router-dom";

const chefs = [
  {
    name: "Arman Vale",
    role: "Executive Chef",
    bio: "Leads the kitchen with a focus on open-fire cooking and coastal ingredients. Trained in Michelin-starred kitchens across Europe.",
    img: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=85",
  },
  {
    name: "Mira Stone",
    role: "Pastry Chef",
    bio: "Pastry chef behind the honey semifreddo, citrus tarts, and celebration cakes. Trained at Le Cordon Bleu with a passion for delicate textures.",
    img: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800&q=85",
  },
  {
    name: "Leo Hart",
    role: "Sommelier",
    bio: "Building thoughtful pairings from boutique and old-world producers. Curates a 350-label wine list with rare finds and approachable gems.",
    img: "https://images.unsplash.com/photo-1512484776495-a09d92e87c3b?w=800&q=85",
  },
  {
    name: "Sage Chen",
    role: "Sous Chef",
    bio: "Oversees every plate that leaves the pass. Known for precise execution, calm leadership, and an obsession with seasoning balance.",
    img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=85",
  },
  {
    name: "Olivia Grant",
    role: "Head Baker",
    bio: "Wakes before dawn to feed the sourdough starter. Bakes everything from focaccia to brioche, always with a touch of local grain.",
    img: "https://images.unsplash.com/photo-1604085764840-5c14244adf6b?w=800&q=85",
  },
  {
    name: "Marcus Bell",
    role: "Maître d'",
    bio: "The first and last face you see. Marcus leads front-of-house with warmth, precision, and an encyclopedic memory for regulars' preferences.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=85",
  },
];

export default function TeamPage() {
  const sectionRef = useRef(null);

  const handleMouseMove = (e, card) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  };

  return (
    <div ref={sectionRef} className="pt-40 pb-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">
            Our Team
          </p>
          <h1 className="font-forum text-6xl sm:text-7xl mt-4">
            Meet The Hands Behind The Flame
          </h1>
          <p className="max-w-xl mx-auto text-white/60 mt-4 leading-relaxed">
            The people who shape every service with craft, calm, and an obsessive
            attention to detail.
          </p>
        </div>

        <div className="team-grid">
          {chefs.map((chef) => (
            <div
              key={chef.name}
              className="team-card"
              onMouseMove={(e) => handleMouseMove(e, e.currentTarget)}
            >
              <div className="team-card-image">
                <img src={chef.img} alt={chef.name} loading="lazy" />
              </div>
              <div className="card-sparkle" />
              <div className="team-card-body">
                <h3>{chef.name}</h3>
                <p className="role">{chef.role}</p>
                <p className="bio">{chef.bio}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-white/50 text-sm mb-6">
            Want to work with us? We are always looking for talented hands.
          </p>
          <Link to="/careers" className="btn-gold">
            <span>Join Our Team</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
