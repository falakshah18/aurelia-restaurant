import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const DISHES = [
  {
    name: "Truffle Mushroom Risotto",
    desc: "Arborio rice, wild mushrooms, truffle oil, parmesan",
    layers: [
      { color: 0xF5E6CC, radius: 2.2, height: 0.3, y: 0, label: "Arborio Rice" },
      { color: 0x8B6914, radius: 1.6, height: 0.15, y: 0.3, label: "Truffle Oil" },
      { color: 0xD4A574, radius: 0.4, height: 0.2, y: 0.45, label: "Wild Mushrooms" },
      { color: 0xFFF8DC, radius: 0.3, height: 0.1, y: 0.55, label: "Parmesan" },
    ],
  },
  {
    name: "Herb Ricotta Ravioli",
    desc: "House-made ravioli, ricotta, lemon zest, sage butter",
    layers: [
      { color: 0xE8D5B0, radius: 2.0, height: 0.2, y: 0, label: "Pasta Dough" },
      { color: 0xFFFACD, radius: 1.5, height: 0.25, y: 0.2, label: "Ricotta Filling" },
      { color: 0x7BAA4B, radius: 0.3, height: 0.1, y: 0.35, label: "Lemon Zest" },
      { color: 0xD4A030, radius: 0.15, height: 0.05, y: 0.45, label: "Sage Butter" },
    ],
  },
];

export default function Dish3DViewer() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [idx, setIdx] = useState(0);
  const [activeLayer, setActiveLayer] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !mountRef.current) return;

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 4;
    controls.maxDistance = 10;
    camera.position.set(4, 3, 5);
    controls.target.set(0, 0.3, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 8, 5);
    scene.add(dir);
    const rim = new THREE.DirectionalLight(0xffe4b5, 0.4);
    rim.position.set(-3, 2, -4);
    scene.add(rim);

    const dish = DISHES[idx];
    const meshes = [];
    dish.layers.forEach((l) => {
      const geo = new THREE.CylinderGeometry(l.radius, l.radius, l.height, 32);
      const mat = new THREE.MeshPhysicalMaterial({
        color: l.color,
        roughness: 0.4,
        metalness: 0.05,
        clearcoat: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = l.y;
      mesh.userData = { label: l.label, originalY: l.y };
      scene.add(mesh);
      meshes.push(mesh);
    });

    const plateGeo = new THREE.CylinderGeometry(3, 3.4, 0.2, 48);
    const plateMat = new THREE.MeshPhysicalMaterial({
      color: 0x222222,
      roughness: 0.2,
      metalness: 0.3,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.y = -0.1;
    scene.add(plate);
    meshes.push(plate);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(meshes);
      if (hits.length > 0) {
        const hit = hits[0].object;
        if (hit.userData.label) {
          setActiveLayer(activeLayer?.label === hit.userData.label ? null : hit.userData);
          if (activeLayer?.label !== hit.userData.label) {
            hit.material.emissive = new THREE.Color(0xD4AF37);
            hit.material.emissiveIntensity = 0.3;
          } else {
            hit.material.emissive = new THREE.Color(0x000000);
            hit.material.emissiveIntensity = 0;
          }
        }
      }
    };

    renderer.domElement.addEventListener("click", onClick);

    sceneRef.current = { scene, camera, renderer, controls, meshes };

    const animate = () => {
      if (!sceneRef.current) return;
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("click", onClick);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
      meshes.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
      sceneRef.current = null;
    };
  }, [open, idx]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-50 w-14 h-14 bg-gold text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        title="3D Dish Explorer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#1A1816] rounded-2xl w-full max-w-3xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-forum text-2xl text-gold">{DISHES[idx].name}</h3>
                <p className="text-white/60 text-sm">{DISHES[idx].desc}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setIdx((i) => (i + 1) % DISHES.length); setActiveLayer(null); }} className="px-3 py-1 text-xs bg-white/10 rounded hover:bg-white/20">Next Dish</button>
                <button onClick={() => { setOpen(false); setActiveLayer(null); }} className="px-3 py-1 text-xs bg-red-500/20 rounded hover:bg-red-500/40">&times;</button>
              </div>
            </div>
            <div ref={mountRef} className="w-full h-[400px] rounded-lg overflow-hidden cursor-grab active:cursor-grabbing" />

            {activeLayer && (
              <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-lg text-center">
                <p className="text-gold font-bold text-sm uppercase tracking-widest">{activeLayer.label}</p>
                <p className="text-white/60 text-xs mt-1">
                  Sourced from the finest local producers
                </p>
              </div>
            )}

            <p className="mt-3 text-white/40 text-xs text-center">Click on any layer to learn about the ingredient</p>
          </div>
        </div>
      )}
    </>
  );
}
