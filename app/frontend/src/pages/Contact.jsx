import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/contact", f);
      toast.success("Message sent — we'll reply soon.");
      setF({ name: "", email: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed to send message");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-40 pb-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Get In Touch</p>
        <h1 className="font-forum text-6xl mt-4 mb-12">Contact Us</h1>
        <form onSubmit={submit} data-testid="contact-form" className="text-left bg-[#161412] border border-[#2A2723] p-10">
          <input
            data-testid="contact-name"
            required
            placeholder="Your Name"
            className="input-line"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
          <input
            data-testid="contact-email"
            required
            type="email"
            placeholder="Your Email"
            className="input-line mt-4"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
          />
          <textarea
            data-testid="contact-message"
            required
            placeholder="Your Message"
            rows="6"
            className="input-line mt-4"
            value={f.message}
            onChange={(e) => setF({ ...f, message: e.target.value })}
          />
          <button data-testid="contact-submit" disabled={busy} className="btn-gold btn-gold-solid mt-6 w-full">
            <span>{busy ? "Sending…" : "Send Message"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
