import { Link } from "react-router-dom";

const pageContent = {
  team: {
    eyebrow: "Our Team",
    title: "Meet The Chef",
    intro:
      "Meet the people behind the fire: chefs, bakers, sommeliers, and hosts who shape every service with craft and calm.",
    image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=1200&q=85",
    cta: "Book The Chef Counter",
    ctaTo: "/reserve",
    highlights: [
      "Executive chef with seasonal tasting-menu training",
      "House pasta, pastry, and wood-fired pizza specialists",
      "Cooking philosophy rooted in restraint, freshness, and balance",
    ],
    cards: [
      { title: "Chef Arman Vale", text: "Leads the kitchen with a focus on seasonal vegetables and wood-fired techniques." },
      { title: "Mira Stone", text: "Pastry chef behind the honey semifreddo, citrus tarts, and celebration cakes." },
      { title: "Leo Hart", text: "Sommelier building thoughtful pairings from boutique and old-world producers." },
    ],
  },
  "private-dining": {
    eyebrow: "Private Dining",
    title: "Events With A Point Of View",
    intro:
      "Plan weddings, birthdays, launches, and corporate dinners with private rooms, curated menus, and a dedicated host.",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=85",
    cta: "Request A Quote",
    ctaTo: "/contact",
    highlights: [
      "Chef's room: 12 guests",
      "Garden terrace: 36 seated or 55 reception",
      "Main dining buyout: up to 110 guests",
    ],
    cards: [
      { title: "Banquet Menus", text: "Three-course, family-style, tasting, and late-night pizza options." },
      { title: "Room Tours", text: "Preview room layouts, lighting, floral setups, and table styles before booking." },
      { title: "Event Support", text: "Menus, seating plans, timing, music, cake service, and vendor coordination." },
    ],
  },
  "gift-cards": {
    eyebrow: "Gift Cards & Merch",
    title: "Give A Table To Someone You Love",
    intro:
      "Shop digital gift cards, dining experiences, branded goods, and at-home meal kits from the Aurelia kitchen.",
    image: "https://images.unsplash.com/photo-1519671282429-b44660ead0a7?w=1200&q=85",
    cta: "Start Shopping",
    ctaTo: "/contact",
    highlights: ["Digital cards delivered instantly", "Physical cards packed for gifting", "Sauces, shirts, caps, and pizza kits"],
    cards: [
      { title: "₹2000 Gift Card", text: "A simple thank-you, birthday surprise, or first date invitation." },
      { title: "Wood-Fired Kit", text: "Dough, sauce, cheese, basil oil, and finishing salt for home pizza night." },
      { title: "Aurelia Goods", text: "Minimal black-and-gold shirts, caps, aprons, and house hot sauce." },
    ],
  },
  press: {
    eyebrow: "Press & Accolades",
    title: "The Word Around The Table",
    intro:
      "A curated wall of reviews, awards, interviews, and press moments that tell the story of Aurelia's reputation.",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=85",
    cta: "Contact Press",
    ctaTo: "/contact",
    highlights: ["Best New Dining Room finalist", "Featured in city food guides", "Chef interviews and podcast features"],
    cards: [
      { title: "City Table", text: "Praised Aurelia for precise service and quietly confident cooking." },
      { title: "Dining Weekly", text: "Named the tasting menu one of the season's most polished experiences." },
      { title: "Hospitality Awards", text: "Recognized for wine service, private dining, and guest experience." },
    ],
  },
  sustainability: {
    eyebrow: "Sustainability",
    title: "Sourcing With Care",
    intro:
      "We build menus around responsible farms, seasonal produce, low-waste prep, and producers close enough to know by name.",
    image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1200&q=85",
    cta: "Ask About Sourcing",
    ctaTo: "/contact",
    highlights: ["Seasonal produce from nearby farms",       "Relationships with local farms and artisan producers", "Composting and low-waste prep"],
    cards: [
      { title: "Local Produce", text: "Weekly vegetables, herbs, and fruit selected around peak flavor from nearby farms." },
      { title: "Artisan Partners", text: "Working with regional cheese makers, olive oil producers, and millers." },
      { title: "Less Waste", text: "Stocks, ferments, staff meals, and careful prep help reduce kitchen waste." },
    ],
  },
  careers: {
    eyebrow: "Careers",
    title: "Join Our Team",
    intro:
      "Work with a focused restaurant crew that values growth, hospitality, training, and pride in the details.",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=85",
    cta: "Apply Now",
    ctaTo: "/contact",
    highlights: ["Line cooks, servers, bartenders, hosts", "Training and tasting sessions", "Balanced scheduling and growth paths"],
    cards: [
      { title: "Kitchen", text: "Prep cooks, line cooks, pastry assistants, and pizza station roles." },
      { title: "Dining Room", text: "Hosts, servers, runners, bartenders, and event staff." },
      { title: "Leadership", text: "Sous chef, floor lead, wine lead, and private dining coordinator roles." },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Useful Details Before You Arrive",
    intro:
      "Quick answers for parking, dress code, allergies, corkage, cancellations, children, and large-party planning.",
    image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&q=85",
    cta: "Ask A Question",
    ctaTo: "/contact",
    highlights: ["Smart casual dress", "Allergen-friendly planning with advance notice", "Reservations held for 15 minutes"],
    cards: [
      { title: "Parking", text: "Valet is available nightly; nearby garage validation is offered after 5 PM." },
      { title: "Allergies", text: "Tell us when booking so the kitchen can guide you safely." },
      { title: "Corkage", text: "Limited corkage is available for special bottles not on our list." },
    ],
  },
  journal: {
    eyebrow: "Journal",
    title: "Stories From The Kitchen",
    intro:
      "Read chef notes, farm visits, wine-pairing ideas, holiday updates, and behind-the-scenes stories from service.",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=85",
    cta: "Reserve A Table",
    ctaTo: "/reserve",
    highlights: ["Seasonal recipe notes", "Farmer and producer stories", "Wine tasting and holiday updates"],
    cards: [
      { title: "Tomato Season", text: "How late-summer tomatoes shape sauces, salads, and staff meal." },
      { title: "Pairing Notes", text: "A sommelier guide to bright reds with wood-fired dishes." },
      { title: "Behind Service", text: "The prep list, line check, and rituals before doors open." },
    ],
  },
};

export const restaurantPages = [
  { to: "/team", label: "Team", key: "team" },
  { to: "/private-dining", label: "Private Dining", key: "private-dining" },
  { to: "/gift-cards", label: "Gift Cards", key: "gift-cards" },
  { to: "/press", label: "Press", key: "press" },
  { to: "/sustainability", label: "Sourcing", key: "sustainability" },
  { to: "/careers", label: "Careers", key: "careers" },
  { to: "/faq", label: "FAQ", key: "faq" },
  { to: "/journal", label: "Journal", key: "journal" },
];

export default function RestaurantInfoPage({ pageKey }) {
  const page = pageContent[pageKey] || pageContent.team;

  return (
    <div className="pt-36 pb-24 min-h-screen">
      <section className="restaurant-page-hero">
        <img src={page.image} alt={page.title} />
        <div className="restaurant-page-hero-content">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">{page.eyebrow}</p>
          <h1 className="font-forum text-5xl sm:text-7xl mt-4 mb-5">{page.title}</h1>
          <p className="max-w-2xl text-white/70 leading-relaxed mb-8">{page.intro}</p>
          <Link to={page.ctaTo} className="btn-gold btn-gold-solid"><span>{page.cta}</span></Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 mt-20">
        <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-12">
          <div>
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Highlights</p>
            <ul className="mt-6 space-y-4">
              {page.highlights.map((item) => (
                <li key={item} className="restaurant-highlight">{item}</li>
              ))}
            </ul>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {page.cards.map((card) => (
              <article key={card.title} className="restaurant-info-card">
                <h2 className="font-forum text-3xl mb-3">{card.title}</h2>
                <p className="text-sm text-white/60 leading-relaxed">{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
