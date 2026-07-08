import { useEffect, useRef } from "react";

export default function LiquidGlass() {
  const b1 = useRef(null);
  const b2 = useRef(null);
  const b3 = useRef(null);
  const b4 = useRef(null);
  const b5 = useRef(null);
  const raf = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const time = useRef(0);

  useEffect(() => {
    const blobs = [b1, b2, b3, b4, b5];
    const origins = [
      { x: 0.15, y: 0.2 },
      { x: 0.8, y: 0.3 },
      { x: 0.3, y: 0.75 },
      { x: 0.7, y: 0.7 },
      { x: 0.5, y: 0.25 },
    ];

    const onMove = (e) => {
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = e.clientY / window.innerHeight;
    };

    const loop = () => {
      time.current += 0.008;
      const t = time.current;
      blobs.forEach((b, i) => {
        if (!b.current) return;
        const o = origins[i];
        const mx = mouse.current.x;
        const my = mouse.current.y;
        const dx = (mx - 0.5) * 60;
        const dy = (my - 0.5) * 40;
        const driftX = Math.sin(t * 0.4 + i * 1.7) * 40;
        const driftY = Math.cos(t * 0.3 + i * 2.1) * 30;
        const scale = 1 + Math.sin(t * 0.2 + i) * 0.1;
        b.current.style.transform = `translate(${dx + driftX}px, ${dy + driftY}px) scale(${scale})`;
      });
      raf.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div className="liquid-glass" aria-hidden="true">
      <div ref={b1} className="lg-blob b1" />
      <div ref={b2} className="lg-blob b2" />
      <div ref={b3} className="lg-blob b3" />
      <div ref={b4} className="lg-blob b4" />
      <div ref={b5} className="lg-blob b5" />
    </div>
  );
}
