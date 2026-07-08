import { useState } from "react";
import { X, Camera, RotateCcw } from "lucide-react";

const dishes = [
  { name: "Truffle Mushroom Risotto", img: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&q=85", desc: "Arborio rice, wild mushrooms, truffle oil, parmesan" },
  { name: "Roasted Cauliflower Steak", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=85", desc: "Herb-crusted, romesco, almond gremolata" },
  { name: "Herb Ricotta Ravioli", img: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=85", desc: "House-made, lemon zest, sage butter, pine nuts" },
];

export default function ARViewer() {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [rot, setRot] = useState(0);

  const d = dishes[idx];

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-gold flex items-center gap-2">
        <Camera size={16} /><span>See the Dish (AR)</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center">
          <button onClick={() => setOpen(false)} className="absolute top-6 right-6 p-2 text-white/70 hover:text-white z-10">
            <X size={28} />
          </button>

          <div className="text-center mb-6">
            <p className="text-gold text-xs tracking-[0.35em] uppercase">360° View</p>
            <h2 className="font-forum text-3xl mt-2">{d.name}</h2>
          </div>

          <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]" style={{ perspective: "800px" }}>
            <div
              className="w-full h-full transition-transform duration-200 cursor-grab active:cursor-grabbing"
              style={{ transform: `rotateY(${rot}deg)`, transformStyle: "preserve-3d" }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setRot(((e.clientX - rect.left) / rect.width) * 360);
              }}
            >
              <img
                src={d.img}
                alt={d.name}
                className="w-full h-full object-cover rounded-lg border border-gold/40"
                style={{ backfaceVisibility: "hidden" }}
              />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-48 h-8 bg-gold/10 rounded-full blur-xl" />
          </div>

          <p className="text-white/60 mt-8 max-w-sm text-center">{d.desc}</p>

          <div className="flex gap-4 mt-8">
            <button onClick={() => { setIdx((idx - 1 + dishes.length) % dishes.length); setRot(0); }} className="btn-gold"><span>Prev</span></button>
            <button onClick={() => setRot(rot + 90)} className="btn-gold flex items-center gap-2"><RotateCcw size={14} /><span>Rotate</span></button>
            <button onClick={() => { setIdx((idx + 1) % dishes.length); setRot(0); }} className="btn-gold"><span>Next</span></button>
          </div>

          <p className="text-white/30 text-xs mt-6">Move your mouse over the dish to see it from all angles</p>
        </div>
      )}
    </>
  );
}
