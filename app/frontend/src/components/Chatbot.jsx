import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { API } from "@/lib/api";

function sid() {
  const key = "aurelia_chat_sid";
  let v = localStorage.getItem(key);
  if (!v) { v = crypto.randomUUID(); localStorage.setItem(key, v); }
  return v;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "bot", text: "Welcome to Aurelia ✦ I'm your concierge — ask me about the menu, reservations, or anything about our restaurant." },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const scRef = useRef();
  const inputRef = useRef();
  const abortRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scRef.current) scRef.current.scrollTop = scRef.current.scrollHeight;
  }, [msgs]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current.focus(), 150);
  }, [open]);

  useEffect(() => {
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, []);

  const send = async () => {
    const t = text.trim();
    if (!t || busy) return;
    if (abortRef.current) abortRef.current.abort();
    setText("");
    setMsgs((m) => [...m, { role: "user", text: t }, { role: "bot", text: "" }]);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const history = [...msgs, { role: "user", text: t }]
        .filter((m) => m.text)
        .slice(-10)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch(`${API}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ session_id: sid(), message: t, history }),
        signal: controller.signal,
      });
      if (!res.ok) {
        let detail = `${res.status}`;
        try { const j = await res.json(); detail = j.detail || j.message || detail; } catch {}
        throw new Error(detail);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMsgs((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "bot", text: acc };
          return copy;
        });
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "bot", text: "Sorry, I couldn't reach the kitchen right now. Please call us at +88-123-123456." };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* Toggle button — bottom RIGHT, above audio button */}
      <button
        data-testid="chatbot-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full bg-gold text-black grid place-items-center shadow-2xl hover:scale-110 active:scale-95 transition-transform"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel — opens above the toggle button */}
      <div
        data-testid="chatbot-panel"
        className={`fixed z-50 right-6 w-[92vw] max-w-[360px] bg-[#161412] border border-[#2A2723] shadow-2xl flex flex-col transition-all duration-300 ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          bottom: "154px",
          height: "480px",
          transform: open ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
          transformOrigin: "bottom right",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2723] bg-[#0E0D0C] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center">
              <span className="text-gold text-xs font-bold">A</span>
            </div>
            <div>
              <p className="font-forum text-base text-gold leading-none">Aurelia</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40">AI Concierge • Online</p>
            </div>
          </div>
          {/* Close X button inside the panel header */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-gold hover:bg-gold/10 transition-colors rounded-full"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed rounded-sm ${
                  m.role === "user"
                    ? "bg-gold text-black font-medium"
                    : "bg-[#0E0D0C] border border-[#2A2723] text-white/90"
                }`}
              >
                {m.text || <span className="opacity-40 animate-pulse">●●●</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-[#2A2723] flex gap-2 shrink-0 bg-[#0E0D0C]">
          <input
            data-testid="chatbot-input"
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask about our menu…"
            disabled={busy}
            className="flex-1 bg-[#161412] border border-[#2A2723] px-4 py-2.5 text-white text-sm placeholder-white/30 focus:border-gold focus:outline-none transition-colors disabled:opacity-50"
          />
          <button
            data-testid="chatbot-send"
            onClick={send}
            disabled={busy || !text.trim()}
            className="bg-gold text-black w-10 h-10 flex items-center justify-center disabled:opacity-40 hover:bg-gold/90 transition-colors shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
