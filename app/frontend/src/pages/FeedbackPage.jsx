import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Star, ThumbsUp } from "lucide-react";

export default function FeedbackPage() {
  const [f, setF] = useState({ name: "", email: "", rating: 5, message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/feedback", { ...f, source: "web" });
      toast.success("Thank you for your feedback!");
      setDone(true);
    } catch (err) {
      toast.error("Something went wrong");
    }
    setBusy(false);
  };

  if (done) {
    return (
      <div className="pt-40 pb-24 min-h-screen grid place-items-center">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-gold flex items-center justify-center">
            <ThumbsUp size={36} className="text-gold" />
          </div>
          <h1 className="font-forum text-5xl mb-4">Thank You</h1>
          <p className="text-white/70 text-lg">Your feedback helps us serve you better. We hope to see you again soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 min-h-screen">
      <div className="max-w-lg mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">We Value Your Opinion</p>
          <h1 className="font-forum text-5xl sm:text-6xl mt-4">Share Your Experience</h1>
          <p className="text-white/60 mt-4">Your feedback helps us refine every detail of your experience.</p>
        </div>

        <form onSubmit={submit} className="bg-[#161412] border border-[#2A2723] p-8 space-y-5">
          <input className="input-line" placeholder="Name *" required value={f.name} onChange={(e) => setF({...f, name: e.target.value})} />
          <input className="input-line" type="email" placeholder="Email" value={f.email} onChange={(e) => setF({...f, email: e.target.value})} />

          <div>
            <label className="text-xs text-white/60 uppercase tracking-widest block mb-3">Rating</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setF({...f, rating: n})} className={`p-2 transition-colors ${n <= f.rating ? "text-gold" : "text-white/30"}`}>
                  <Star size={28} fill={n <= f.rating ? "hsl(38,61%,73%)" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <textarea className="input-dark" rows={4} placeholder="Tell us about your experience..." required value={f.message} onChange={(e) => setF({...f, message: e.target.value})} />
          <button disabled={busy} className="btn-gold btn-gold-solid w-full"><span>{busy ? "Sending..." : "Submit Feedback"}</span></button>
        </form>
      </div>
    </div>
  );
}
