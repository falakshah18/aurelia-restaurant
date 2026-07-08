import { useEffect, useRef } from "react";

const ROUTE_MAP = {
  "/": ["/menu", "/about"],
  "/menu": ["/reserve", "/"],
  "/about": ["/team", "/"],
  "/reserve": ["/menu", "/contact"],
  "/contact": ["/", "/reserve"],
  "/team": ["/about", "/"],
  "/waitlist": ["/menu", "/reserve"],
  "/feedback": ["/", "/menu"],
  "/admin": ["/", "/menu"],
};

function prefetch(url) {
  try {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = url;
    document.head.appendChild(link);
    setTimeout(() => link.remove(), 5000);
  } catch {}
}

export default function usePredictivePreload() {
  const ref = useRef({ hx: 0, hy: 0, vx: 0, vy: 0, timer: null });

  useEffect(() => {
    const predict = () => {
      const { vx, vy } = ref.current;
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed < 0.3) return;

      const links = Array.from(document.querySelectorAll("a[href]"));
      let bestScore = -1;
      let bestHref = null;
      const cx = ref.current.hx + vx * 80;
      const cy = ref.current.hy + vy * 80;

      for (const link of links) {
        const r = link.getBoundingClientRect();
        const lcx = r.left + r.width / 2;
        const lcy = r.top + r.height / 2;
        const dx = lcx - cx;
        const dy = lcy - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const score = 1 / (dist + 1);
          if (score > bestScore) {
            bestScore = score;
            bestHref = link.getAttribute("href");
          }
        }
      }

      if (bestHref && !bestHref.startsWith("http") && bestHref !== window.location.pathname) {
        prefetch(window.location.origin + bestHref);

        const current = window.location.pathname;
        const predictions = ROUTE_MAP[current] || [];
        for (const p of predictions) {
          if (p !== bestHref) prefetch(window.location.origin + p);
        }
      }
    };

    const onMouse = (e) => {
      const now = Date.now();
      const prev = ref.current;
      const dt = Math.min(now - (prev.lastT || now), 100);
      if (dt > 0) {
        prev.vx = (e.clientX - prev.hx) / dt * 30;
        prev.vy = (e.clientY - prev.hy) / dt * 30;
      }
      prev.hx = e.clientX;
      prev.hy = e.clientY;
      prev.lastT = now;
      clearTimeout(prev.timer);
      prev.timer = setTimeout(predict, 80);
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouse);
      clearTimeout(ref.current.timer);
    };
  }, []);
}
