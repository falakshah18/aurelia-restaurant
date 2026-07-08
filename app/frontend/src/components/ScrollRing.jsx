import { useEffect, useRef, useState } from "react";

export default function ScrollRing() {
  const [pct, setPct] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const ringRef = useRef(null);
  const confettiRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const dh = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = Math.min(window.scrollY / Math.max(dh, 1), 1);
      setPct(scrolled);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pct >= 1 && !rewarded) {
      setRewarded(true);
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(t);
    }
  }, [pct, rewarded]);

  const circumference = 2 * Math.PI * 46;
  const offset = circumference * (1 - pct);

  return (
    <>
      <svg
        ref={ringRef}
        className="scroll-ring"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
        <circle
          cx="50" cy="50" r="46"
          fill="none"
          stroke="hsl(38,61%,73%)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 6px hsla(38,61%,73%,${pct * 0.5}))`, transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>

      {showConfetti && (
        <div ref={confettiRef} className="scroll-ring-confetti" aria-hidden="true">
          {Array.from({ length: 60 }, (_, i) => (
            <span
              key={i}
              style={{
                "--x": `${Math.random() * 100}%`,
                "--d": `${Math.random() * 2}s`,
                "--c": [`hsl(38,61%,73%)`, `hsl(0,0%,100%)`, `hsl(30,8%,5%)`][Math.floor(Math.random() * 3)],
                "--s": `${4 + Math.random() * 6}px`,
              }}
            />
          ))}
        </div>
      )}

      {pct >= 1 && rewarded && (
        <div className="scroll-ring-modal" onClick={() => setShowConfetti(false)}>
          <div className="scroll-ring-modal-inner" onClick={(e) => e.stopPropagation()}>
            <p className="text-gold font-forum text-3xl mb-2">Welcome to Aurelia</p>
            <p className="text-white/70 mb-4">You've explored our full story.</p>
            <p className="text-gold text-sm">Claim a complimentary welcome drink on your next visit.</p>
            <button
              onClick={() => setShowConfetti(false)}
              className="mt-6 px-6 py-2 bg-gold text-black font-bold uppercase tracking-widest text-xs rounded hover:opacity-90"
            >
              sounds lovely
            </button>
          </div>
        </div>
      )}
    </>
  );
}
