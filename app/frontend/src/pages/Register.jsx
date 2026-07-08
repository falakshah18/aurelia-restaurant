import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await register(f.name, f.email, f.password);
    setBusy(false);
    if (r.ok) {
      toast.success(`Welcome to Aurelia, ${r.user.name}!`);
      nav("/");
    } else {
      setErr(r.error);
    }
  };

  return (
    <div className="pt-40 pb-24 min-h-screen grid place-items-center auth-stage">
      <div className="w-full max-w-md px-6 auth-panel">
        <div className="text-center mb-8">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Join The Table</p>
          <h1 className="font-forum text-5xl mt-4">Create Account</h1>
        </div>
        <form onSubmit={submit} data-testid="register-form" className="bg-[#161412]/95 border border-[#2A2723] p-8 auth-form">
          <input
            data-testid="reg-name"
            required
            placeholder="Full Name"
            className="input-line"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
          <input
            data-testid="reg-email"
            required
            type="email"
            placeholder="Email"
            className="input-line mt-4"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
          />
          <input
            data-testid="reg-password"
            required
            type="password"
            placeholder="Password (min 6)"
            className="input-line mt-4"
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
          />
          {err && <p data-testid="reg-error" className="text-red-400 text-sm mt-4">{err}</p>}
          <button data-testid="reg-submit" disabled={busy} className="btn-gold btn-gold-solid mt-6 w-full">
            <span>{busy ? "…" : "Create Account"}</span>
          </button>
        </form>
        <p className="text-center text-sm text-white/60 mt-6">
          Already a member?{" "}
          <Link to="/login" className="text-gold hover-underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
