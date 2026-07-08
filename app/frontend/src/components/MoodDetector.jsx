import { useEffect, useRef, useState, useCallback } from "react";

const DISH_KEYWORDS = [
  { name: "Truffle Mushroom Risotto", keywords: ["truffle", "risotto", "mushroom"] },
  { name: "Chocolate Lava Cake", keywords: ["chocolate", "lava", "cake", "dessert"] },
  { name: "Herb Ricotta Ravioli", keywords: ["ravioli", "ricotta", "pasta"] },
  { name: "Roasted Cauliflower Steak", keywords: ["cauliflower", "steak"] },
];

let faceApiLoaded = false;

export default function MoodDetector() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const detectedRef = useRef({});
  const streamRef = useRef(null);

  const loadFaceApi = useCallback(async () => {
    try {
      const faceapi = await import("face-api.js");
      await faceapi.nets.tinyFaceDetector.loadFromUri(
        "https://justadudewhohacks.github.io/face-api.js/models"
      );
      await faceapi.nets.faceExpressionNet.loadFromUri(
        "https://justadudewhohacks.github.io/face-api.js/models"
      );
      faceApiLoaded = true;
      return faceapi;
    } catch {
      return null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setScanning(true);
    } catch {
      setResult("Camera access denied or unavailable");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => {
    if (!scanning || !videoRef.current || !faceApiLoaded) return;
    let raf;

    const detect = async () => {
      const faceapi = await import("face-api.js");
      if (!videoRef.current || !canvasRef.current) return;
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections) {
        const exp = detections.expressions;
        const happiness = exp.happy || 0;
        if (happiness > 0.6) {
          const now = Date.now();
          const label = `smile_${Math.floor(now / 2000)}`;
          if (!detectedRef.current[label]) {
            detectedRef.current[label] = true;
            const dish = DISH_KEYWORDS[Math.floor(Math.random() * DISH_KEYWORDS.length)];
            setResult({
              message: `You smiled! How about our ${dish.name}?`,
              dish: dish.name,
            });
            setTimeout(() => setResult(null), 5000);
          }
        }
      }
      raf = requestAnimationFrame(detect);
    };

    raf = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(raf);
  }, [scanning]);

  const init = useCallback(async () => {
    setReady(true);
    const api = await loadFaceApi();
    if (api) startCamera();
    else setResult("Face detection model could not load");
  }, [loadFaceApi, startCamera]);

  if (!ready) {
    return (
      <button
        onClick={init}
        className="fixed bottom-4 right-20 z-50 w-14 h-14 bg-[#222] rounded-full flex items-center justify-center border border-gold/30 hover:border-gold transition-colors shadow-2xl"
        title="Enable mood-based recommendations"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="hsl(38,61%,73%)" strokeWidth="2" className="w-6 h-6">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </button>
    );
  }

  return (
    <>
      <div className="fixed bottom-20 right-20 z-50">
        {scanning && (
          <div className="relative w-[160px] h-[120px] rounded-lg overflow-hidden border border-gold/30 shadow-2xl">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            <button
              onClick={stopCamera}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px]"
            >
              &times;
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="fixed top-24 right-4 z-50 bg-[#1A1816] border border-gold/30 rounded-xl p-4 shadow-2xl max-w-xs animate-in">
          <p className="text-gold text-sm">{result.message}</p>
        </div>
      )}
    </>
  );
}
