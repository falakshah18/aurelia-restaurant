import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

const themes = [
  {
    label: "dark",
    hours: [],
    vars: {
      "--bg": "#0E0D0C",
      "--bg-secondary": "#161412",
      "--text": "#FFFFFF",
      "--text-muted": "rgba(255,255,255,0.7)",
      "--gold": "hsl(38,61%,73%)",
      "--gold-light": "rgba(228,197,144,0.35)",
      "--accent": "hsl(38,61%,73%)",
      "--card-bg": "#1A1816",
      "--card-border": "#2A2622",
      "--nav-bg": "rgba(14,13,12,0.92)",
      "--glow": "rgba(228,197,144,0.15)",
      "--meal-highlight": "signature dishes",
    },
  },
  {
    label: "light",
    hours: [],
    vars: {
      "--bg": "#F5F0E8",
      "--bg-secondary": "#EDE6D8",
      "--text": "#2D2416",
      "--text-muted": "#7A6B5A",
      "--gold": "#C4954A",
      "--gold-light": "#E8D5A3",
      "--accent": "#E8A87C",
      "--card-bg": "#FFFFFF",
      "--card-border": "#E8DDD0",
      "--nav-bg": "rgba(245,240,232,0.92)",
      "--glow": "rgba(196,149,74,0.2)",
      "--meal-highlight": "coffee, pastries",
    },
  },
  {
    label: "morning",
    hours: [6, 7, 8, 9, 10],
    vars: {
      "--bg": "#F5F0E8",
      "--bg-secondary": "#EDE6D8",
      "--text": "#2D2416",
      "--text-muted": "#7A6B5A",
      "--gold": "#C4954A",
      "--gold-light": "#E8D5A3",
      "--accent": "#E8A87C",
      "--card-bg": "#FFFFFF",
      "--card-border": "#E8DDD0",
      "--nav-bg": "rgba(245,240,232,0.92)",
      "--glow": "rgba(196,149,74,0.2)",
      "--meal-highlight": "coffee, pastries",
    },
  },
  {
    label: "afternoon",
    hours: [11, 12, 13, 14, 15],
    vars: {
      "--bg": "#F8F6F2",
      "--bg-secondary": "#EFF0EC",
      "--text": "#1E2A1E",
      "--text-muted": "#6B7D6B",
      "--gold": "#B5A642",
      "--gold-light": "#D4D99B",
      "--accent": "#7EB57E",
      "--card-bg": "#FFFFFF",
      "--card-border": "#DCE0D0",
      "--nav-bg": "rgba(248,246,242,0.92)",
      "--glow": "rgba(181,166,66,0.2)",
      "--meal-highlight": "salads, sandwiches",
    },
  },
  {
    label: "evening",
    hours: [16, 17, 18, 19, 20],
    vars: {
      "--bg": "#1A1820",
      "--bg-secondary": "#22202A",
      "--text": "#E8E2D8",
      "--text-muted": "#9A919E",
      "--gold": "#D4AF37",
      "--gold-light": "#F0DFA0",
      "--accent": "#C4954A",
      "--card-bg": "#24222C",
      "--card-border": "#3A3448",
      "--nav-bg": "rgba(26,24,32,0.92)",
      "--glow": "rgba(212,175,55,0.25)",
      "--meal-highlight": "seasonal dishes, artisanal mocktails",
    },
  },
  {
    label: "night",
    hours: [21, 22, 23, 0, 1, 2, 3, 4, 5],
    vars: {
      "--bg": "#0E0D0C",
      "--bg-secondary": "#161412",
      "--text": "#FFFFFF",
      "--text-muted": "rgba(255,255,255,0.7)",
      "--gold": "hsl(38,61%,73%)",
      "--gold-light": "rgba(228,197,144,0.35)",
      "--accent": "hsl(38,61%,73%)",
      "--card-bg": "#1A1816",
      "--card-border": "#2A2622",
      "--nav-bg": "rgba(14,13,12,0.92)",
      "--glow": "rgba(228,197,144,0.15)",
      "--meal-highlight": "signature dishes",
    },
  },
];

function getTheme() {
  const h = new Date().getHours();
  return themes.find((t) => t.hours.includes(h)) || themes[0];
}

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("aurelia-theme");
    if (saved && saved !== "auto") {
      const found = themes.find((t) => t.label === saved);
      if (found) return found;
    }
    return getTheme();
  });
  const [manualOverride, setManualOverride] = useState(() => {
    const saved = localStorage.getItem("aurelia-theme");
    return saved && saved !== "auto" ? saved : null;
  });

  useEffect(() => {
    const tick = () => {
      if (!manualOverride) setTheme(getTheme());
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [manualOverride]);

  const cssVars = useMemo(() => theme.vars, [theme]);

  const switchTheme = useCallback((label) => {
    const found = themes.find((t) => t.label === label);
    if (found) {
      setManualOverride(label);
      setTheme(found);
      localStorage.setItem("aurelia-theme", label);
    } else {
      setManualOverride(null);
      setTheme(getTheme());
      localStorage.setItem("aurelia-theme", "auto");
    }
  }, []);

  const ctxValue = useMemo(() => ({ theme, cssVars, switchTheme, themes }), [theme, cssVars, switchTheme]);

  return (
    <ThemeCtx.Provider value={ctxValue}>
      <div id="theme-root" style={cssVars}>{children}</div>
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
