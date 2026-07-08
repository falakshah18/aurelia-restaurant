import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="pt-40 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Our Story</p>
          <h1 className="font-forum text-6xl sm:text-7xl mt-4">About Us</h1>
        </div>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <img
            src="https://images.unsplash.com/photo-1551218808-94e220e084d2?w=900&q=85"
            alt="chefs"
            className="w-full aspect-[4/5] object-cover"
          />
          <div>
            <h2 className="font-forum text-5xl mb-6">Who We Are</h2>
            <p className="text-white/70 leading-relaxed mb-4">
              A modern restaurant with a menu that will make your mouth water. Serving delicious food since 45 years.
              Enjoy our seasonal menu and experience the beauty of naturalness.
            </p>
            <p className="text-white/70 leading-relaxed mb-6">
              Every dish is prepared with love, using only the freshest local ingredients — a genuine journey into elevated cuisine.
            </p>
            <p className="text-gold font-forum text-2xl">
              Andrew Joe{" "}
              <span className="text-white/60 text-base">— Founder</span>
            </p>
            <div className="mt-8">
              <Link to="/reserve" className="btn-gold btn-gold-solid"><span>Book A Table</span></Link>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-24 text-center">
          <div className="p-8 bg-[#161412] border border-[#2A2723]">
            <p className="text-gold font-forum text-2xl">Lunch Time</p>
            <p className="text-sm text-white/60 mt-3">Monday to Sunday<br />11.00 am – 2.30 pm</p>
          </div>
          <div className="p-8 bg-[#161412] border border-[#2A2723]">
            <p className="text-gold font-forum text-2xl">Dinner Time</p>
            <p className="text-sm text-white/60 mt-3">Monday to Sunday<br />5.30 pm – 11.30 pm</p>
          </div>
          <div className="p-8 bg-[#161412] border border-[#2A2723]">
            <p className="text-gold font-forum text-2xl">Contact Us</p>
            <p className="text-sm text-white/60 mt-3">Restaurant St, Delicious City,<br /> London 9578, UK</p>
          </div>
        </div>
      </div>
    </div>
  );
}
