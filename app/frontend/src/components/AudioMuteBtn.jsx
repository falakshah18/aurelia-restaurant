import { useState } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

const noiseScenes = [
  { key: "restaurant", label: "Restaurant" },
  { key: "rain", label: "Rain" },
  { key: "cafe", label: "Café" },
  { key: "fireplace", label: "Fireplace" },
];

export default function AudioMuteBtn({ muted, onToggle, volume, onChangeVolume, playNoise }) {
  const [expanded, setExpanded] = useState(false);

  const handleScene = (key) => {
    if (muted) return;
    playNoise?.(key);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {expanded && !muted && (
        <div
          className="mb-3 bg-[var(--card-bg,#161412)] border border-[var(--card-border,#2A2723)] p-4 backdrop-blur-xl"
          style={{ minWidth: 200 }}
        >
          <p className="text-[var(--text-muted,rgba(255,255,255,0.5))] text-[10px] tracking-widest uppercase mb-3">
            Ambient Scene
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {noiseScenes.map((s) => (
              <button
                key={s.key}
                onClick={() => handleScene(s.key)}
                className="px-3 py-2 text-[10px] font-bold tracking-wider uppercase border border-[var(--card-border,#2A2723)] text-[var(--text-muted,rgba(255,255,255,0.5))] hover:border-[var(--gold,hsl(38,61%,73%))] hover:text-[var(--gold,hsl(38,61%,73%))] transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-[var(--text-muted,rgba(255,255,255,0.5))] text-[10px] tracking-widest uppercase mb-2">
            Volume
          </p>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume ?? 0.5}
            onChange={(e) => onChangeVolume?.(parseFloat(e.target.value))}
            className="w-full accent-[var(--gold,hsl(38,61%,73%))]"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="audio-mute-btn"
          title="Ambient sounds"
          style={{
            backgroundColor: "var(--card-bg, #161412)",
            borderColor: expanded ? "var(--gold, hsl(38,61%,73%))" : "var(--card-border, #2A2723)",
          }}
        >
          <Music size={14} />
        </button>
        <button
          onClick={onToggle}
          className="audio-mute-btn"
          title={muted ? "Unmute ambient audio" : "Mute ambient audio"}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </div>
  );
}
