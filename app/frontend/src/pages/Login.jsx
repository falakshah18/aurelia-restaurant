import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await login(f.email, f.password);
    setBusy(false);
    if (r.ok) {
      toast.success(`Welcome back, ${r.user.name}`);
      nav(r.user.role === "admin" ? "/admin" : "/");
    } else {
      setErr(r.error);
    }
  };

  return (
    <div className="pt-40 pb-24 min-h-screen grid place-items-center auth-stage">
      <div className="w-full max-w-md px-6 auth-panel">
        <div className="text-center mb-8">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Welcome Back</p>
          <h1 className="font-forum text-5xl mt-4">Sign In</h1>
        </div>
        <form onSubmit={submit} data-testid="login-form" className="bg-[#161412]/95 border border-[#2A2723] p-8 auth-form">
          <input
            data-testid="login-email"
            required
            type="email"
            placeholder="Email"
            className="input-line"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
          />
          <input
            data-testid="login-password"
            required
            type="password"
            placeholder="Password"
            className="input-line mt-4"
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
          />
          {err && <p data-testid="login-error" className="text-red-400 text-sm mt-4">{err}</p>}
          <button data-testid="login-submit" disabled={busy} className="btn-gold btn-gold-solid mt-6 w-full">
            <span>{busy ? "…" : "Sign In"}</span>
          </button>
        </form>
        <p className="text-center text-sm text-white/60 mt-6">
          New to Aurelia?{" "}
          <Link data-testid="login-to-register" to="/register" className="text-gold hover-underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
