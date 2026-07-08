import { useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Clock, Users, MapPin } from "lucide-react";

export default function WaitlistPage() {
  const [f, setF] = useState({ name: "", phone: "", email: "", persons: 2, message: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/waitlist", f);
      toast.success("You're on the list!");
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
            <Clock size={36} className="text-gold" />
          </div>
          <h1 className="font-forum text-5xl mb-4">You're on the List</h1>
          <p className="text-white/70 text-lg mb-6">
            We'll send you a text when your table is ready. For urgent changes, call us.
          </p>
          <button onClick={() => setDone(false)} className="btn-gold">
            <span>Join Another</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 min-h-screen">
      <div className="max-w-lg mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">No Reservation?</p>
          <h1 className="font-forum text-5xl sm:text-6xl mt-4">Walk-In Waitlist</h1>
          <p className="text-white/60 mt-4">Add your name remotely and we'll text you when your table's ready.</p>
        </div>

        <form onSubmit={submit} className="bg-[#161412] border border-[#2A2723] p-8 space-y-5">
          <input className="input-line" placeholder="Name *" required value={f.name} onChange={(e) => setF({...f, name: e.target.value})} />
          <input className="input-line" placeholder="Phone *" required value={f.phone} onChange={(e) => setF({...f, phone: e.target.value})} />
          <input className="input-line" type="email" placeholder="Email" value={f.email} onChange={(e) => setF({...f, email: e.target.value})} />
          <div>
            <label className="text-xs text-white/60 uppercase tracking-widest block mb-2">Guests</label>
            <select className="input-dark" value={f.persons} onChange={(e) => setF({...f, persons: +e.target.value})}>
              {[1,2,3,4,5,6,7,8].map((n) => (<option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>))}
            </select>
          </div>
          <textarea className="input-dark" rows={3} placeholder="Any preferences? (optional)" value={f.message} onChange={(e) => setF({...f, message: e.target.value})} />
          <button disabled={busy} className="btn-gold btn-gold-solid w-full"><span>{busy ? "Adding..." : "Join Waitlist"}</span></button>
        </form>

        <div className="flex flex-wrap gap-6 mt-8 text-sm text-white/50">
          <span className="flex items-center gap-2"><Clock size={14} /> ~15 min avg wait</span>
          <span className="flex items-center gap-2"><Users size={14} /> Text alerts</span>
          <span className="flex items-center gap-2"><MapPin size={14} /> Hold 10 min</span>
        </div>
      </div>
    </div>
  );
}
