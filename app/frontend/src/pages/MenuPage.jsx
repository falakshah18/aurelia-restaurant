import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import { Sun, Moon, Coffee } from "lucide-react";

const fallbackItems = [
  {
    id: "starter-1",
    category: "Starters",
    name: "Burrata & Heirloom Tomato",
    price: 595,
    badge: "Fresh",
    description: "Creamy burrata, basil oil, aged balsamic, sea salt, and toasted sourdough.",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=320&q=85",
  },
  {
    id: "starter-2",
    category: "Starters",
    name: "Grilled Halloumi & Fig",
    price: 595,
    description: "Charred halloumi, fresh figs, wild rocket, pomegranate, and honey balsamic.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=320&q=85",
  },
  {
    id: "pizza-1",
    category: "Pizza",
    name: "Truffle Mushroom Pizza",
    price: 895,
    badge: "Signature",
    description: "Wood-fired crust, wild mushrooms, fontina, black truffle cream, and thyme.",
    image: "https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=320&q=85",
  },
  {
    id: "pizza-2",
    category: "Pizza",
    name: "Margherita Di Bufala",
    price: 695,
    description: "San Marzano tomato, buffalo mozzarella, basil, olive oil, and sea salt.",
    image: "https://images.unsplash.com/photo-1598023696416-0193a0bcd302?w=320&q=85",
  },
  {
    id: "main-1",
    category: "Mains",
    name: "Wild Mushroom Risotto",
    price: 995,
    badge: "Chef Pick",
    description: "Arborio rice, wild mushrooms, truffle oil, parmesan, and fresh thyme.",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=320&q=85",
  },
  {
    id: "main-2",
    category: "Mains",
    name: "Herb Ricotta Ravioli",
    price: 795,
    description: "House-made ravioli, ricotta, lemon zest, sage butter, and toasted pine nuts.",
    image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=320&q=85",
  },
  {
    id: "main-3",
    category: "Mains",
    name: "Roasted Cauliflower Steak",
    price: 845,
    description: "Herb-crusted cauliflower, romesco sauce, almond gremolata, and micro greens.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=320&q=85",
  },
  {
    id: "dessert-1",
    category: "Desserts",
    name: "Honey Semifreddo",
    price: 545,
    badge: "Sweet",
    description: "Whipped honey cream, almond crumble, roasted figs, and espresso syrup.",
    image: "https://images.unsplash.com/photo-1509043759401-537742b608eb?w=320&q=85",
  },
  {
    id: "drink-1",
    category: "Drinks",
    name: "Fig & Rosemary Spritz",
    price: 645,
    description: "Fig cordial, rosemary, prosecco, citrus, and a clean bitter finish.",
    image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=320&q=85",
  },
];

export default function MenuPage() {
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState("All");
  const [meal, setMeal] = useState("");

  useEffect(() => {
    api.get("/menu/smart")
      .then(({ data }) => {
        setMeal(data.meal);
        setItems(data.items.length ? data.items : fallbackItems);
      })
      .catch(() => {
        api.get("/menu")
          .then(({ data }) => setItems(data.length ? data : fallbackItems))
          .catch(() => setItems(fallbackItems));
      });
  }, []);

  const cats = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = cat === "All" ? items : items.filter((i) => i.category === cat);
  const heroItem = items.find((item) => item.badge) || fallbackItems[2];

  return (
    <div className="pt-36 pb-24 min-h-screen menu-page">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <p className="text-gold text-sm font-bold tracking-[0.35em] uppercase">Delicious & Amazing</p>
        <h1 className="font-forum text-6xl sm:text-8xl mt-4 mb-8">Our Menu</h1>
        {meal && (
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-gold/30 text-gold text-xs uppercase tracking-widest mb-4">
            {meal === "breakfast" && <><Coffee size={14} /> Breakfast Menu</>}
            {meal === "lunch" && <><Sun size={14} /> Lunch Menu</>}
            {meal === "dinner" && <><Moon size={14} /> Dinner Menu</>}
          </div>
        )}
        <p className="max-w-2xl mx-auto text-lg text-white/70 leading-relaxed mb-12">
          A rich seasonal selection of wood-fired pizza, handmade pasta, fresh salads, memorable desserts, and elegant drinks.
        </p>

        <div className="menu-spotlight mb-16 text-left">
          <img src={heroItem.image} alt={heroItem.name} />
          <div>
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Tonight's Highlight</p>
            <h2 className="font-forum text-5xl mt-3 mb-4">{heroItem.name}</h2>
            <p className="text-white/70 text-lg leading-relaxed mb-5">{heroItem.description}</p>
            <p className="text-gold font-forum text-4xl">₹{heroItem.price}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {cats.map((c) => (
            <button
              data-testid={`menu-cat-${c}`}
              key={c}
              onClick={() => setCat(c)}
              className={`menu-cat-button px-6 py-3 text-sm uppercase tracking-[0.22em] border transition-colors ${
                cat === c ? "bg-gold text-black border-gold" : "border-[#2A2723] hover:border-gold"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7 text-left">
          {filtered.map((m) => (
            <div
              data-testid="menu-item"
              key={m.id}
              className="menu-dish-card group"
            >
              <div className="menu-dish-image">
                <img
                  src={m.image || "https://images.unsplash.com/photo-1546241072-48010ad2862c?w=320&q=80"}
                  alt={m.name}
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <h3 className="font-forum text-3xl group-hover:text-gold transition-colors">{m.name}</h3>
                  <span className="text-gold font-forum text-2xl">₹{m.price}</span>
                </div>
                {m.badge && (
                  <span className="text-xs uppercase tracking-widest bg-gold text-black px-3 py-1 mt-3 inline-block">
                    {m.badge}
                  </span>
                )}
                <p className="text-base text-white/62 mt-4 leading-relaxed">{m.description}</p>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-2 text-white/60 italic text-center py-12">
              No dishes in this category yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
