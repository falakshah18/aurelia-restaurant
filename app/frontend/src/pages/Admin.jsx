import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, X, Check, Ban, Package, TrendingUp } from "lucide-react";

const emptyItem = { name: "", description: "", price: 0, category: "Main", image: "", badge: "" };

function Reservations() {
  const [items, setItems] = useState([]);

  const load = () =>
    api.get("/reservations").then(({ data }) => setItems(data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/reservations/${id}/status`, { status });
      toast.success("Updated");
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-reservations" className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-white/60 border-b border-[#2A2723]">
          <tr>
            <th className="p-3">Name</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Time</th>
            <th>Persons</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id} className="border-b border-[#2A2723]/60">
              <td className="p-3">{r.name}</td>
              <td>{r.phone}</td>
              <td>{r.date}</td>
              <td>{r.time}</td>
              <td>{r.persons}</td>
              <td>
                <span
                  className={`px-2 py-1 text-[10px] uppercase tracking-widest ${
                    r.status === "confirmed"
                      ? "bg-green-900/40 text-green-300"
                      : r.status === "cancelled"
                      ? "bg-red-900/40 text-red-300"
                      : "bg-yellow-900/40 text-yellow-300"
                  }`}
                >
                  {r.status}
                </span>
              </td>
              <td className="text-right">
                <button
                  data-testid={`admin-confirm-${r.id}`}
                  onClick={() => setStatus(r.id, "confirmed")}
                  className="p-2 hover:text-gold"
                  title="Confirm"
                >
                  <Check size={16} />
                </button>
                <button
                  data-testid={`admin-cancel-${r.id}`}
                  onClick={() => setStatus(r.id, "cancelled")}
                  className="p-2 hover:text-red-400"
                  title="Cancel"
                >
                  <Ban size={16} />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="7" className="p-8 text-center text-white/40 italic">
                No reservations yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MenuManager() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyItem);

  const load = () => api.get("/menu").then(({ data }) => setItems(data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { ...form, price: Number(form.price) };
    try {
      if (editing === "new") {
        await api.post("/menu", payload);
      } else {
        await api.put(`/menu/${editing}`, payload);
      }
      toast.success("Saved");
      setEditing(null);
      setForm(emptyItem);
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-menu">
      <div className="flex justify-end mb-4">
        <button
          data-testid="admin-add-menu"
          onClick={() => { setEditing("new"); setForm(emptyItem); }}
          className="btn-gold btn-gold-solid"
        >
          <span><Plus size={14} className="inline mr-1" />Add Item</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((m) => (
          <div key={m.id} className="bg-[#161412] border border-[#2A2723] p-4">
            <div className="flex gap-3">
              <img
                src={m.image || "https://images.unsplash.com/photo-1546241072-48010ad2862c?w=200"}
                alt={m.name}
                className="w-16 h-16 object-cover rounded-full"
              />
              <div className="flex-1">
                <p className="font-forum text-xl">{m.name}</p>
                <p className="text-xs text-white/60">{m.category} • ₹{m.price}</p>
                {m.badge && (
                  <span className="inline-block mt-1 text-[10px] bg-gold text-black px-2 uppercase tracking-widest">
                    {m.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => { setEditing(m.id); setForm({ name: m.name, description: m.description, price: m.price, category: m.category, image: m.image, badge: m.badge }); }} className="p-1 hover:text-gold">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => del(m.id)} className="p-1 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#161412] border border-[#2A2723] p-8 w-full max-w-lg"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-forum text-2xl">{editing === "new" ? "New Dish" : "Edit Dish"}</h3>
              <button onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <input
              placeholder="Name"
              className="input-dark mb-3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="input-dark mb-3"
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                placeholder="Price"
                type="number"
                step="0.01"
                className="input-dark"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
              <input
                placeholder="Category"
                className="input-dark"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <input
              placeholder="Image URL"
              className="input-dark mb-3"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
            />
            <input
              placeholder="Badge (Seasonal, New, ...)"
              className="input-dark mb-6"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value })}
            />
            <button data-testid="admin-save-menu" onClick={save} className="btn-gold btn-gold-solid w-full">
              <span>Save</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Messages() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/contact").then(({ data }) => setItems(data)).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-messages" className="space-y-3">
      {items.map((m) => (
        <div key={m.id} className="bg-[#161412] border border-[#2A2723] p-5">
          <div className="flex justify-between mb-2">
            <div>
              <p className="font-forum text-xl">{m.name}</p>
              <p className="text-xs text-white/60">{m.email}</p>
            </div>
            <span className="text-xs text-white/40">{new Date(m.created_at).toLocaleString()}</span>
          </div>
          <p className="text-sm text-white/80 mt-2">{m.message}</p>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-center py-16 text-white/40 italic">No messages yet</p>
      )}
    </div>
  );
}

function WaitlistManager() {
  const [items, setItems] = useState([]);

  const load = () =>
    api.get("/waitlist").then(({ data }) => setItems(data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try {
      await api.put(`/waitlist/${id}/status`, { status });
      toast.success("Updated");
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    }
  };

  return (
    <div data-testid="admin-waitlist" className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-white/60 border-b border-[#2A2723]">
          <tr>
            <th className="p-3">Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Persons</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((w) => (
            <tr key={w.id} className="border-b border-[#2A2723]/60">
              <td className="p-3">{w.name}</td>
              <td>{w.phone}</td>
              <td>{w.email || <span className="text-white/30">-</span>}</td>
              <td>{w.persons}</td>
              <td>
                <span
                  className={`px-2 py-1 text-[10px] uppercase tracking-widest ${
                    w.status === "confirmed"
                      ? "bg-green-900/40 text-green-300"
                      : w.status === "cancelled"
                      ? "bg-red-900/40 text-red-300"
                      : "bg-yellow-900/40 text-yellow-300"
                  }`}
                >
                  {w.status}
                </span>
              </td>
              <td className="text-right">
                <button
                  onClick={() => setStatus(w.id, "confirmed")}
                  className="p-2 hover:text-gold"
                  title="Confirm"
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={() => setStatus(w.id, "cancelled")}
                  className="p-2 hover:text-red-400"
                  title="Cancel"
                >
                  <Ban size={16} />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="6" className="p-8 text-center text-white/40 italic">
                No waitlist entries
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function FeedbackList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/feedback").then(({ data }) => setItems(data)).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-feedback" className="space-y-3">
      {items.length === 0 && (
        <p className="text-center py-16 text-white/40 italic">No feedback yet</p>
      )}
      {items.map((f) => (
        <div key={f.id} className="bg-[#161412] border border-[#2A2723] p-5">
          <div className="flex justify-between mb-2">
            <div>
              <p className="font-forum text-xl">{f.name || "Anonymous"}</p>
              <p className="text-xs text-white/60">
                {f.email || "No email"} • Rating: {f.rating}/5
              </p>
            </div>
            <span className="text-xs text-white/40">
              {new Date(f.created_at).toLocaleString()}
            </span>
          </div>
          {f.overall && (
            <span className="inline-block text-[10px] bg-gold/20 text-gold px-2 uppercase tracking-widest mb-2">
              {f.overall}
            </span>
          )}
          <p className="text-sm text-white/80 mt-2">{f.message}</p>
        </div>
      ))}
    </div>
  );
}

function QuoteList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/quote").then(({ data }) => setItems(data)).catch(() => {});
  }, []);

  return (
    <div data-testid="admin-quotes" className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-white/60 border-b border-[#2A2723]">
          <tr>
            <th className="p-3">Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Guests</th>
            <th>Date</th>
            <th>Occasion</th>
            <th className="text-right">Notes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((q) => (
            <tr key={q.id} className="border-b border-[#2A2723]/60">
              <td className="p-3">{q.name}</td>
              <td>{q.email}</td>
              <td>{q.phone}</td>
              <td>{q.guests}</td>
              <td>{q.date || "-"}</td>
              <td>{q.occasion || "-"}</td>
              <td className="text-right text-white/50 max-w-xs truncate">
                {q.notes || "-"}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="7" className="p-8 text-center text-white/40 italic">
                No quote requests yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function OrdersManager() {
  const [items, setItems] = useState([]);

  const load = () =>
    api.get("/orders").then(({ data }) => setItems(data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const setStatus = async (id, status, payment_status) => {
    try {
      await api.put(`/orders/${id}/status`, { status, payment_status });
      toast.success("Updated");
      load();
    } catch (e) {
      toast.error(formatApiError(e.response?.data?.detail));
    }
  };

  const STATUS_STYLE = {
    pending: "bg-yellow-900/40 text-yellow-300",
    confirmed: "bg-blue-900/40 text-blue-300",
    preparing: "bg-orange-900/40 text-orange-300",
    ready: "bg-purple-900/40 text-purple-300",
    completed: "bg-green-900/40 text-green-300",
    cancelled: "bg-red-900/40 text-red-300",
  };

  return (
    <div data-testid="admin-orders" className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-white/60 border-b border-[#2A2723]">
          <tr>
            <th className="p-3">Order ID</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id} className="border-b border-[#2A2723]/60">
              <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
              <td>
                <p className="text-white">{o.user_name}</p>
                <p className="text-xs text-white/40">{o.user_email}</p>
              </td>
              <td className="text-gold">₹{o.total?.toLocaleString("en-IN")}</td>
              <td className="capitalize">{o.payment_status}</td>
              <td>
                <span className={`px-2 py-1 text-[10px] uppercase tracking-widest ${STATUS_STYLE[o.status] || "bg-white/10 text-white/60"}`}>
                  {o.status}
                </span>
              </td>
              <td className="text-right">
                <button data-testid={`admin-order-confirm-${o.id}`} onClick={() => setStatus(o.id, "confirmed", o.payment_status)} className="p-2 hover:text-gold" title="Confirm">
                  <Check size={16} />
                </button>
                <button data-testid={`admin-order-prepare-${o.id}`} onClick={() => setStatus(o.id, "preparing", o.payment_status)} className="p-2 hover:text-orange-400" title="Preparing">
                  <Package size={16} />
                </button>
                <button data-testid={`admin-order-ready-${o.id}`} onClick={() => setStatus(o.id, "ready", o.payment_status)} className="p-2 hover:text-purple-400" title="Ready">
                  <Package size={16} />
                </button>
                <button data-testid={`admin-order-complete-${o.id}`} onClick={() => setStatus(o.id, "completed", o.payment_status)} className="p-2 hover:text-green-400" title="Complete">
                  <Check size={16} />
                </button>
                <button data-testid={`admin-order-cancel-${o.id}`} onClick={() => setStatus(o.id, "cancelled", o.payment_status)} className="p-2 hover:text-red-400" title="Cancel">
                  <Ban size={16} />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="6" className="p-8 text-center text-white/40 italic">
                No orders yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Reports() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/reports/stats").then(({ data }) => setStats(data)).catch(() => {});
  }, []);

  if (!stats) {
    return <p className="text-center text-white/40 py-16">Loading reports...</p>;
  }

  return (
    <div data-testid="admin-reports" className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats.total_orders, color: "text-gold" },
          { label: "Revenue", value: `₹${stats.total_revenue?.toLocaleString("en-IN")}`, color: "text-green-300" },
          { label: "Avg Order", value: `₹${stats.avg_order?.toLocaleString("en-IN")}`, color: "text-blue-300" },
          { label: "Completion Rate", value: `${stats.total_orders ? Math.round((stats.status_counts?.completed || 0) / stats.total_orders * 100) : 0}%`, color: "text-purple-300" },
        ].map((s) => (
          <div key={s.label} className="bg-[#161412] border border-[#2A2723] p-6 text-center">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`font-forum text-4xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#161412] border border-[#2A2723] p-6">
          <h3 className="font-forum text-xl mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-gold" /> Orders by Status</h3>
          <div className="space-y-3">
            {Object.entries(stats.status_counts || {}).map(([k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="w-24 text-xs uppercase tracking-widest text-white/60 capitalize">{k}</span>
                <div className="flex-1 h-2 bg-[#2A2723] rounded-full overflow-hidden">
                  <div className="h-full bg-gold transition-all" style={{ width: `${stats.total_orders ? (v / stats.total_orders) * 100 : 0}%` }} />
                </div>
                <span className="text-sm w-8 text-right">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#161412] border border-[#2A2723] p-6">
          <h3 className="font-forum text-xl mb-4 flex items-center gap-2"><Package size={18} className="text-gold" /> Top Selling Items</h3>
          <div className="space-y-3">
            {(stats.top_items || []).map((it, idx) => (
              <div key={it._id} className="flex justify-between text-sm">
                <span className="text-white/70">{idx + 1}. {it._id}</span>
                <span className="text-gold">{it.qty} sold</span>
              </div>
            ))}
            {(!stats.top_items || stats.top_items.length === 0) && (
              <p className="text-white/40 text-sm italic">No sales data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("reservations");

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Admin Panel</p>
          <h1 className="font-forum text-5xl mt-2">Aurelia Dashboard</h1>
        </div>
        <div className="flex gap-2 mb-8 border-b border-[#2A2723] overflow-x-auto">
          {[
            ["reservations", "Reservations"],
            ["menu", "Menu"],
            ["orders", "Orders"],
            ["waitlist", "Waitlist"],
            ["feedback", "Feedback"],
            ["quotes", "Quotes"],
            ["reports", "Reports"],
            ["messages", "Messages"],
          ].map(([k, l]) => (
            <button
              key={k}
              data-testid={`admin-tab-${k}`}
              onClick={() => setTab(k)}
              className={`px-6 py-3 text-xs uppercase tracking-[0.25em] border-b-2 transition-colors whitespace-nowrap ${
                tab === k ? "border-gold text-gold" : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        {tab === "reservations" && <Reservations />}
        {tab === "menu" && <MenuManager />}
        {tab === "orders" && <OrdersManager />}
        {tab === "waitlist" && <WaitlistManager />}
        {tab === "feedback" && <FeedbackList />}
        {tab === "quotes" && <QuoteList />}
        {tab === "reports" && <Reports />}
        {tab === "messages" && <Messages />}
      </div>
    </div>
  );
}
