import { useEffect, useState } from "react";

export default function Preloader() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGone(true), 1400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      data-testid="preloader"
      className={`fixed inset-0 z-[200] grid place-items-center bg-[#0E0D0C] transition-all duration-700 ${
        gone ? "opacity-0 pointer-events-none -translate-y-full" : ""
      }`}
    >
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="font-forum text-4xl text-gold tracking-[0.5em]">AURELIA</p>
      </div>
    </div>
  );
}
