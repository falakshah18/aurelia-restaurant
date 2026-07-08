import { useEffect, useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, X, Check, Ban } from "lucide-react";

const emptyItem = { name: "", description: "", price: 0, category: "Main", image: "", badge: "" };

export default function Admin() {
  const [tab, setTab] = useState("reservations");

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">Admin Panel</p>
          <h1 className="font-forum text-5xl mt-2">Aurelia Dashboard</h1>
        </div>
        <div className="flex gap-2 mb-8 border-b border-[#2A2723]">
          {[["reservations", "Reservations"], ["menu", "Menu"], ["messages", "Messages"]].map(([k, l]) => (
            <button
              key={k}
              data-testid={`admin-tab-${k}`}
              onClick={() => setTab(k)}
              className={`px-6 py-3 text-xs uppercase tracking-[0.25em] border-b-2 transition-colors ${
                tab === k ? "border-gold text-gold" : "border-transparent text-white/60 hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        {tab === "reservations" && <Reservations />}
        {tab === "menu" && <MenuManager />}
        {tab === "messages" && <Messages />}
      </div>
    </div>
  );
}

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
  const [editing, setEditing] = useState(null); // item id or "new"
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
