import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, removeItem, updateQty, total, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-24 min-h-screen text-center">
        <div className="max-w-md mx-auto px-6">
          <ShoppingBag size={48} className="mx-auto text-white/20 mb-6" />
          <h1 className="font-forum text-5xl mb-4">Your Cart is Empty</h1>
          <p className="text-white/60 mb-8">Looks like you haven't added any dishes yet.</p>
          <Link to="/menu" className="btn-gold btn-gold-solid">
            <span>Browse Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-36 pb-24 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Order Summary</p>
            <h1 className="font-forum text-5xl mt-2">Your Cart</h1>
          </div>
          <button onClick={clear} className="text-xs uppercase tracking-widest text-white/50 hover:text-red-400">
            Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.menu_item_id} className="bg-[#161412] border border-[#2A2723] p-4 flex gap-4">
                <img
                  src={item.image || "https://images.unsplash.com/photo-1546241072-48010ad2862c?w=200&q=80"}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-sm"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-forum text-xl">{item.name}</h3>
                      <p className="text-gold font-forum text-lg">₹{item.price}</p>
                    </div>
                    <button onClick={() => removeItem(item.menu_item_id)} className="text-white/40 hover:text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => updateQty(item.menu_item_id, item.quantity - 1)} className="w-8 h-8 border border-[#2A2723] flex items-center justify-center hover:border-gold transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQty(item.menu_item_id, item.quantity + 1)} className="w-8 h-8 border border-[#2A2723] flex items-center justify-center hover:border-gold transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#161412] border border-[#2A2723] p-6 h-fit">
            <h3 className="font-forum text-2xl mb-6">Order Total</h3>
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Taxes & Fees</span>
                <span>Included</span>
              </div>
              <div className="border-t border-[#2A2723] pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-gold font-forum text-2xl">₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-gold btn-gold-solid w-full flex items-center justify-center gap-2">
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </Link>
            <p className="text-white/40 text-xs text-center mt-4">Mock payment — no real charges</p>
          </div>
        </div>
      </div>
    </div>
  );
}
