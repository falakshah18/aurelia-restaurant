import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Package, ChevronRight } from "lucide-react";

const STATUS_STYLE = {
  pending: "bg-yellow-900/40 text-yellow-300",
  confirmed: "bg-blue-900/40 text-blue-300",
  preparing: "bg-orange-900/40 text-orange-300",
  ready: "bg-purple-900/40 text-purple-300",
  completed: "bg-green-900/40 text-green-300",
  cancelled: "bg-red-900/40 text-red-300",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);

  const load = () =>
    api.get("/orders/mine")
      .then(({ data }) => setOrders(data))
      .catch(() => toast.error("Failed to load orders"));

  useEffect(() => { load(); }, []);

  return (
    <div className="pt-36 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Account</p>
        <h1 className="font-forum text-5xl mt-2 mb-10">My Orders</h1>

        {orders.length === 0 && (
          <div className="text-center py-20">
            <Package size={48} className="mx-auto text-white/20 mb-4" />
            <p className="text-white/50 mb-6">You haven't placed any orders yet.</p>
            <Link to="/menu" className="btn-gold btn-gold-solid"><span>Browse Menu</span></Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-[#161412] border border-[#2A2723] p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white/40 text-xs">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-white/40 text-xs">{new Date(o.created_at).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-1 text-[10px] uppercase tracking-widest ${STATUS_STYLE[o.status] || "bg-white/10 text-white/60"}`}>
                  {o.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {o.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-white/70">{it.name} x {it.quantity}</span>
                    <span className="text-gold">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center border-t border-[#2A2723] pt-3">
                <span className="text-white/60 text-sm">Total</span>
                <span className="text-gold font-forum text-xl">₹{o.total?.toLocaleString("en-IN")}</span>
              </div>
              {o.payment_status && (
                <p className="text-white/30 text-xs mt-2">Payment: {o.payment_status}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
