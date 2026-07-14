import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CreditCard, Lock, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items.length, navigate]);

  const pay = async () => {
    if (items.length === 0) return;
    setPaying(true);
    try {
      const payload = {
        items: items.map((i) => ({
          menu_item_id: i.menu_item_id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        total,
        payment_method: "mock",
        notes: "",
      };
      const { data } = await api.post("/orders", payload);
      setOrderId(data.id);
      setDone(true);
      clear();
      toast.success("Payment successful! Order placed.");
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail) || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (done) {
    return (
      <div className="pt-36 pb-24 min-h-screen text-center">
        <div className="max-w-md mx-auto px-6">
          <CheckCircle2 size={56} className="mx-auto text-green-400 mb-6" />
          <h1 className="font-forum text-5xl mb-4">Order Confirmed</h1>
          <p className="text-white/60 mb-2">Thank you for your order.</p>
          <p className="text-white/40 text-sm mb-8">Order ID: {orderId}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/orders")} className="btn-gold btn-gold-solid">
              <span>View Orders</span>
            </button>
            <button onClick={() => navigate("/menu")} className="btn-gold">
              <span>Continue Dining</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-36 pb-24 min-h-screen">
      <div className="max-w-2xl mx-auto px-6">
        <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Secure Checkout</p>
        <h1 className="font-forum text-5xl mt-2 mb-10">Payment</h1>

        <div className="bg-[#161412] border border-[#2A2723] p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-gold" size={20} />
            <h3 className="font-forum text-xl">Mock Payment Gateway</h3>
          </div>
          <p className="text-white/60 text-sm mb-6">
            This is a demo checkout. Clicking pay will simulate a successful transaction and place your order.
          </p>
          <div className="space-y-3 text-sm mb-6">
            <div className="flex justify-between">
              <span className="text-white/60">Items</span>
              <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Total Amount</span>
              <span className="text-gold font-forum text-xl">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>
          <button
            onClick={pay}
            disabled={paying}
            className="btn-gold btn-gold-solid w-full flex items-center justify-center gap-2"
          >
            {paying ? (
              "Processing..."
            ) : (
              <>
                <Lock size={16} />
                <span>Pay ₹{total.toLocaleString("en-IN")}</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-start gap-3 text-white/40 text-xs">
          <Lock size={14} className="mt-0.5" />
          <p>
            Payments are simulated for demo purposes. No real money is charged. In production, integrate Razorpay / Stripe here.
          </p>
        </div>
      </div>
    </div>
  );
}

function formatApiError(detail) {
  if (!detail) return "Payment failed. Please try again.";
  if (typeof detail === "string") return detail;
  return String(detail);
}
