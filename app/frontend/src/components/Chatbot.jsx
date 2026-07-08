import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { API } from "@/lib/api";

function sid() {
  const key = "aurelia_chat_sid";
  let v = localStorage.getItem(key);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(key, v);
  }
  return v;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role: "bot", text: "Welcome to Aurelia. I'm your concierge — ask me about the menu or reservations." },
  ]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const scRef = useRef();

  useEffect(() => {
    if (scRef.current) scRef.current.scrollTop = scRef.current.scrollHeight;
  }, [msgs, open]);

  const send = async () => {
    const t = text.trim();
    if (!t || busy) return;
    setText("");
    setMsgs((m) => [...m, { role: "user", text: t }, { role: "bot", text: "" }]);
    setBusy(true);

    try {
      const res = await fetch(`${API}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ session_id: sid(), message: t }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      if (!res.body) {
        throw new Error("Empty response body");
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
    } catch {
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "bot", text: "Sorry, I couldn't reach the kitchen right now." };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        data-testid="chatbot-toggle"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gold text-black grid place-items-center shadow-xl hover:scale-110 transition-transform"
        aria-label="chat with Aurelia"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      <div
        data-testid="chatbot-panel"
        className={`fixed z-40 bottom-24 left-6 w-[92vw] max-w-sm h-[520px] bg-[#161412] border border-[#2A2723] shadow-2xl flex flex-col transition-all duration-[400ms] ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="p-4 border-b border-[#2A2723] flex items-center justify-between">
          <div>
            <p className="font-forum text-xl text-gold">Aurelia</p>
            <p className="text-[10px] uppercase tracking-widest text-white/50">AI Concierge</p>
          </div>
          <span className="text-[10px] px-2 py-1 border border-gold text-gold uppercase tracking-widest">Online</span>
        </div>
        <div ref={scRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed ${
                m.role === "user" ? "ml-auto chat-msg-user text-white" : "chat-msg-bot text-white/90"
              }`}
            >
              {m.text || <span className="opacity-60">…</span>}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-[#2A2723] flex gap-2">
          <input
            data-testid="chatbot-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about our menu…"
            className="input-dark flex-1"
          />
          <button
            data-testid="chatbot-send"
            onClick={send}
            disabled={busy}
            className="bg-gold text-black px-4 grid place-items-center disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
