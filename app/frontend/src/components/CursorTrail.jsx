import { useEffect, useRef } from "react";

const COUNT = 80;
const TRAIL = 40;

export default function CursorTrail() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, raf, buttons = [];
    const pts = Array.from({ length: COUNT }, () => ({ x: -999, y: -999, vx: 0, vy: 0 }));

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    const onMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const snapToButtons = () => {
      buttons = Array.from(document.querySelectorAll("a, button, [role=button], input, select, textarea"));
    };

    let snapTimer;
    const scheduleSnap = () => {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(snapToButtons, 300);
    };

    const resizeCombo = () => { resize(); scheduleSnap(); };
    snapToButtons();
    window.addEventListener("resize", resizeCombo);
    window.addEventListener("mousemove", onMouse);
    window.addEventListener("scroll", scheduleSnap);
    const obs = new MutationObserver(scheduleSnap);
    obs.observe(document.body, { childList: true, subtree: true });

    resize();

    const frame = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      ctx.clearRect(0, 0, w, h);

      let snapX = null, snapY = null;
      for (const btn of buttons) {
        const r = btn.getBoundingClientRect();
        if (mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom) {
          snapX = r.left + r.width / 2;
          snapY = r.top + r.height / 2;
          break;
        }
      }

      const targetX = snapX !== null ? snapX : mx;
      const targetY = snapY !== null ? snapY : my;

      for (let i = 0; i < COUNT; i++) {
        const p = pts[i];
        const prev = pts[Math.max(0, i - 1)];
        const tx = i === 0 ? targetX : prev.x;
        const ty = i === 0 ? targetY : prev.y;
        p.vx += (tx - p.x) * 0.12;
        p.vy += (ty - p.y) * 0.12;
        p.vx *= 0.78;
        p.vy *= 0.78;
        p.x += p.vx;
        p.y += p.vy;

        const t = i / COUNT;
        const size = 1.5 + t * 2.5;
        const alpha = snapX !== null ? (1 - t) * 0.9 : (1 - t) * 0.6;
        const hue = snapX !== null ? 38 : 38 + t * 20;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 61%, ${73 - t * 30}%, ${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resizeCombo);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", scheduleSnap);
      obs.disconnect();
      clearTimeout(snapTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="cursor-trail-canvas"
    />
  );
}
