import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ParallaxDisintegration() {
  const mountRef = useRef(null);
  const pctRef = useRef(0);
  const sceneRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let disposed = false;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 1000);
    camera.position.z = 500;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=60";

    const NUM = 2500;
    let particles = [];
    let positions;
    let colors;

    img.onload = () => {
      if (disposed) return;
      const c = document.createElement("canvas");
      c.width = 200;
      c.height = 150;
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, 200, 150);
      const data = ctx.getImageData(0, 0, 200, 150).data;

      const geo = new THREE.BufferGeometry();
      positions = new Float32Array(NUM * 3);
      colors = new Float32Array(NUM * 3);
      particles = [];

      const halfW = w / 2;
      const halfH = h / 2;

      for (let i = 0; i < NUM; i++) {
        const px = Math.floor(Math.random() * 200);
        const py = Math.floor(Math.random() * 150);
        const idx = (py * 200 + px) * 4;
        const r = data[idx] / 255;
        const g = data[idx + 1] / 255;
        const b = data[idx + 2] / 255;
        const bright = (r + g + b) / 3;

        const x = (px / 200) * w - halfW;
        const y = -(py / 150) * h + halfH;
        const z = (Math.random() - 0.5) * 100;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        colors[i * 3] = bright > 0.5 ? 0.9 : 0.5;
        colors[i * 3 + 1] = bright > 0.5 ? 0.7 : 0.4;
        colors[i * 3 + 2] = bright > 0.5 ? 0.4 : 0.3;

        particles.push({
          ox: x, oy: y, oz: z,
          tx: (Math.random() - 0.5) * w * 2,
          ty: (Math.random() - 0.5) * h * 2,
          tz: (Math.random() - 0.5) * 300,
          size: 1.5 + Math.random() * 3,
        });
      }

      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 2.5,
        vertexColors: true,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const mesh = new THREE.Points(geo, mat);
      scene.add(mesh);
      sceneRef.current = { mesh, particles, positions, mat, geo };
    };

    let raf;
    const animate = () => {
      const s = sceneRef.current;
      if (s) {
        const pct = Math.min(pctRef.current, 1);
        const pos = s.positions;
        for (let i = 0; i < NUM; i++) {
          const pp = s.particles[i];
          const ease = pct < 0.5 ? 2 * pct * pct : 1 - Math.pow(-2 * pct + 2, 2) / 2;
          pos[i * 3] = pp.ox + (pp.tx - pp.ox) * ease;
          pos[i * 3 + 1] = pp.oy + (pp.ty - pp.oy) * ease;
          pos[i * 3 + 2] = pp.oz + (pp.tz - pp.oz) * ease;
        }
        s.geo.attributes.position.needsUpdate = true;
        s.mat.opacity = 1 - pct * 0.7;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onScroll = () => {
      const rect = el.parentElement?.getBoundingClientRect();
      if (!rect) return;
      const viewH = window.innerHeight;
      const top = rect.top;
      const height = rect.height;
      const progress = Math.max(0, Math.min(1, (-top) / (height - viewH)));
      pctRef.current = progress;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      camera.left = -nw / 2;
      camera.right = nw / 2;
      camera.top = nh / 2;
      camera.bottom = -nh / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      const s = sceneRef.current;
      if (s) {
        s.geo.dispose();
        s.mat.dispose();
        scene.remove(s.mesh);
        sceneRef.current = null;
      }
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="parallax-disintegration" />;
}
