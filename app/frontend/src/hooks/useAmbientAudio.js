import { useEffect, useRef, useCallback, useState } from "react";

const SCENE_SOUNDS = {
  ocean: { freq: 160, type: "sine", lfoFreq: 0.08, lfoGain: 20, gain: 0.04 },
  fire: { freq: 90, type: "sawtooth", lfoFreq: 0.5, lfoGain: 40, gain: 0.025 },
  jazz: { freq: 220, type: "triangle", lfoFreq: 0.15, lfoGain: 15, gain: 0.035 },
  wind: { freq: 280, type: "sine", lfoFreq: 0.03, lfoGain: 30, gain: 0.02 },
};

const FOOD_SOUNDS = {
  seafood: { freq: 400, duration: 0.3, type: "sine" },
  grill: { freq: 120, duration: 0.4, type: "sawtooth" },
  salad: { freq: 600, duration: 0.2, type: "sine" },
  dessert: { freq: 800, duration: 0.25, type: "triangle" },
};

export default function useAmbientAudio() {
  const ctxRef = useRef(null);
  const nodesRef = useRef({});
  const [muted, setMuted] = useState(false);
  const sceneRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const C = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new C();
    }
    return ctxRef.current;
  }, []);

  const stopScene = useCallback(() => {
    const n = nodesRef.current;
    if (n.lfo) try { n.lfo.stop(); } catch {}
    if (n.osc) try { n.osc.stop(); } catch {}
    if (n.gain) try { n.gain.disconnect(); } catch {}
    nodesRef.current = {};
    sceneRef.current = null;
  }, []);

  const playScene = useCallback((key) => {
    if (muted || sceneRef.current === key) return;
    stopScene();
    const cfg = SCENE_SOUNDS[key];
    if (!cfg) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    osc.type = cfg.type;
    osc.frequency.value = cfg.freq;
    gain.gain.value = cfg.gain;
    lfo.type = "sine";
    lfo.frequency.value = cfg.lfoFreq;
    lfoGain.gain.value = cfg.lfoGain;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    lfo.start();
    nodesRef.current = { osc, gain, lfo };
    sceneRef.current = key;
  }, [muted, stopScene, getCtx]);

  const playFoodSound = useCallback((key) => {
    if (muted) return;
    const cfg = FOOD_SOUNDS[key];
    if (!cfg) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = cfg.type;
    osc.frequency.value = cfg.freq;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + cfg.duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + cfg.duration);
  }, [muted, getCtx]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (!m) {
        stopScene();
        if (ctxRef.current) ctxRef.current.suspend();
      } else {
        if (ctxRef.current) ctxRef.current.resume();
      }
      return !m;
    });
  }, [stopScene]);

  useEffect(() => {
    const handleScroll = () => {
      if (muted) return;
      const y = window.scrollY;
      const sections = [
        { id: "home", scene: "wind", max: window.innerHeight * 0.6 },
        { id: "menu", scene: "ocean", max: Infinity },
      ];
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top < s.max && rect.bottom > 0) {
          playScene(s.scene);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [muted, playScene]);

  useEffect(() => {
    const handleHover = (e) => {
      if (muted) return;
      const el = e.target.closest("[data-audio]");
      if (el) playFoodSound(el.dataset.audio);
    };
    document.addEventListener("mouseover", handleHover);
    return () => document.removeEventListener("mouseover", handleHover);
  }, [muted, playFoodSound]);

  useEffect(() => {
    return () => { stopScene(); if (ctxRef.current) ctxRef.current.close(); };
  }, [stopScene]);

  return { muted, toggleMute, playFoodSound };
}
