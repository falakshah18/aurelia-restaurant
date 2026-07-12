import { useEffect, useRef, useCallback, useState } from "react";

const SCENE_SOUNDS = {
  ocean: { freq: 160, type: "sine", lfoFreq: 0.08, lfoGain: 20, gain: 0.04 },
  fire: { freq: 90, type: "sawtooth", lfoFreq: 0.5, lfoGain: 40, gain: 0.025 },
  jazz: { freq: 220, type: "triangle", lfoFreq: 0.15, lfoGain: 15, gain: 0.035 },
  wind: { freq: 280, type: "sine", lfoFreq: 0.03, lfoGain: 30, gain: 0.02 },
};

const NOISE_SCENES = {
  restaurant: { type: "brown", gain: 0.018, filterFreq: 800, filterQ: 0.7 },
  rain: { type: "pink", gain: 0.012, filterFreq: 2000, filterQ: 0.3 },
  cafe: { type: "brown", gain: 0.015, filterFreq: 1200, filterQ: 0.5 },
  fireplace: { type: "brown", gain: 0.02, filterFreq: 400, filterQ: 1.2 },
};

const FOOD_SOUNDS = {
  seafood: { freq: 400, duration: 0.3, type: "sine" },
  grill: { freq: 120, duration: 0.4, type: "sawtooth" },
  salad: { freq: 600, duration: 0.2, type: "sine" },
  dessert: { freq: 800, duration: 0.25, type: "triangle" },
};

function createNoiseBuffer(ctx, type) {
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "white") {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === "pink") {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  } else if (type === "brown") {
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
  }
  return buffer;
}

export default function useAmbientAudio() {
  const ctxRef = useRef(null);
  const nodesRef = useRef({});
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const sceneRef = useRef(null);
  const noiseRef = useRef(null);
  const mutedRef = useRef(false);
  const volumeRef = useRef(0.5);

  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const C = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new C();
    }
    return ctxRef.current;
  }, []);

  const stopScene = useCallback(() => {
    const n = nodesRef.current;
    if (n?.lfo) try { n.lfo.stop(); } catch {}
    if (n?.osc) try { n.osc.stop(); } catch {}
    if (n?.gain) try { n.gain.disconnect(); } catch {}
    nodesRef.current = {};
    sceneRef.current = null;
  }, []);

  const stopNoise = useCallback(() => {
    const n = noiseRef.current;
    if (n?.source) try { n.source.stop(); } catch {}
    if (n?.gain) try { n.gain.disconnect(); } catch {}
    if (n?.filter) try { n.filter.disconnect(); } catch {}
    noiseRef.current = {};
  }, []);

  const playNoise = useCallback((key) => {
    if (noiseRef.current.scene === key) return;
    stopNoise();
    const cfg = NOISE_SCENES[key];
    if (!cfg) return;
    const ctx = getCtx();
    const buffer = createNoiseBuffer(ctx, cfg.type);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = cfg.gain * volumeRef.current;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = cfg.filterFreq;
    filter.Q.value = cfg.filterQ;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    noiseRef.current = { source, gain, filter, scene: key };
  }, [stopNoise, getCtx]);

  const stopAllNoise = useCallback(() => {
    stopNoise();
    noiseRef.current = {};
  }, [stopNoise]);

  const playScene = useCallback((key) => {
    if (sceneRef.current === key) return;
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
    gain.gain.value = cfg.gain * volumeRef.current;
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
  }, [stopScene, getCtx]);

  const playFoodSound = useCallback((key) => {
    if (mutedRef.current) return;
    const cfg = FOOD_SOUNDS[key];
    if (!cfg) return;
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = cfg.type;
    osc.frequency.value = cfg.freq;
    gain.gain.setValueAtTime(0.06 * volumeRef.current, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + cfg.duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + cfg.duration);
  }, [getCtx]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      if (!m) {
        stopScene();
        stopAllNoise();
        if (ctxRef.current) ctxRef.current.suspend();
      } else {
        if (ctxRef.current) ctxRef.current.resume();
      }
      return !m;
    });
  }, [stopScene, stopAllNoise]);

  const changeVolume = useCallback((v) => {
    const prev = volumeRef.current;
    setVolume(v);
    volumeRef.current = v;
    if (nodesRef.current.gain) {
      nodesRef.current.gain.gain.value *= v / (prev || 0.5);
    }
    if (noiseRef.current.gain) {
      noiseRef.current.gain.gain.value *= v / (prev || 0.5);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (mutedRef.current) return;
      const y = window.scrollY;
      const sections = [
        { id: "home", scene: "wind", noise: "cafe", max: window.innerHeight * 0.6 },
        { id: "menu", scene: "ocean", noise: "restaurant", max: Infinity },
      ];
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top < s.max && rect.bottom > 0) {
          playScene(s.scene);
          playNoise(s.noise);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [playScene, playNoise]);

  useEffect(() => {
    const handleHover = (e) => {
      if (mutedRef.current) return;
      const el = e.target.closest("[data-audio]");
      if (el) playFoodSound(el.dataset.audio);
    };
    document.addEventListener("mouseover", handleHover);
    return () => document.removeEventListener("mouseover", handleHover);
  }, [playFoodSound]);

  useEffect(() => {
    return () => { stopScene(); stopAllNoise(); if (ctxRef.current) { try { ctxRef.current.close(); } catch {} ctxRef.current = null; } };
  }, [stopScene, stopAllNoise]);

  return { muted, toggleMute, volume, changeVolume, playFoodSound, playNoise, stopNoise };
}
