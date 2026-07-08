import { useState } from "react";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";

const times = ["07:00pm", "07:30pm", "08:00pm", "08:30pm", "09:00pm", "09:30pm"];

const tables = [
  { id: "T1", label: "T1", x: 15, y: 15, type: "round", window: false },
  { id: "T2", label: "T2", x: 35, y: 15, type: "round", window: false },
  { id: "T3", label: "T3", x: 55, y: 15, type: "round", window: false },
  { id: "T4", label: "T4", x: 15, y: 40, type: "round", window: false },
  { id: "T5", label: "T5", x: 55, y: 40, type: "round", window: false },
  { id: "W1", label: "Window A", x: 79, y: 22, type: "booth", window: true },
  { id: "W2", label: "Window B", x: 79, y: 52, type: "booth", window: true },
  { id: "B1", label: "Bar", x: 35, y: 65, type: "booth", window: false },
  { id: "B2", label: "Bar", x: 55, y: 65, type: "booth", window: false },
  { id: "V1", label: "VIP", x: 26, y: 82, type: "round", window: false },
  { id: "V2", label: "VIP", x: 49, y: 82, type: "round", window: false },
];

export default function Reserve() {
  const [f, setF] = useState({
    name: "", phone: "", email: "", persons: 2, date: "", time: "07:00pm", message: "",
  });
  const [selectedTable, setSelectedTable] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...f, table: selectedTable };
      if (!payload.email) delete payload.email;
      await api.post("/reservations", payload);
      toast.success("Reservation confirmed! Your table is waiting.");
      setF({
        name: "", phone: "", email: "", persons: 2, date: "", time: "07:00pm", message: "",
      });
      setSelectedTable(null);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Failed to book");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-40 pb-24 vintage-reservation">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="vintage-header mb-10">
          <p className="text-gold text-xs font-bold tracking-[0.35em] uppercase">
            Aurelia Airways — Table Booking
          </p>
          <h1 className="font-forum text-5xl sm:text-6xl mt-3 mb-2">
            Boarding Pass
          </h1>
          <p className="text-white/50 text-sm mb-3">
            Select your seat. Every table has a view.
          </p>
          <div className="vintage-stamp">First Class Dining</div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 3D Table Map */}
          <div className="lg:col-span-1 bg-[#161412] border border-[#2A2723] p-6">
            <p className="vintage-label mb-4">Select Your Table</p>
            <div className="table-map-3d relative w-full" style={{ paddingBottom: "100%" }}>
              <div className="absolute inset-0 floor-plan">
                {/* Room walls */}
                <div className="room-wall" style={{ top: "8%", left: "8%", width: "66%", height: "1px" }} />
                <div className="room-wall" style={{ top: "8%", left: "74%", width: "1px", height: "76%" }} />
                <div className="room-wall" style={{ top: "84%", left: "8%", width: "66%", height: "1px" }} />
                <div className="room-wall" style={{ top: "8%", left: "8%", width: "1px", height: "76%" }} />

                {/* Window wall indicators */}
                <div className="room-label" style={{ top: "0%", left: "72%", transform: "rotate(90deg)", transformOrigin: "0 0" }}>
                  Window Wall
                </div>
                <div className="room-label" style={{ bottom: "4%", left: "18%" }}>
                  Entrance
                </div>

                {/* Tables */}
                {tables.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTable(selectedTable === t.id ? null : t.id)}
                    className={`table-item ${t.type === "booth" ? "booth" : ""} ${t.window ? "window" : ""} ${selectedTable === t.id ? "selected" : ""}`}
                    style={{
                      left: `${t.x}%`,
                      top: `${t.y}%`,
                    }}
                    title={t.label}
                  >
                    <span className="table-label">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {selectedTable && (
              <p className="text-gold text-xs tracking-widest uppercase mt-3 text-center">
                Selected: {tables.find((t) => t.id === selectedTable)?.label}
              </p>
            )}
            {!selectedTable && (
              <p className="text-white/30 text-xs tracking-widest uppercase mt-3 text-center">
                Tap a table to select
              </p>
            )}
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2 bg-[#161412] border border-[#2A2723] p-8">
            <form onSubmit={submit} data-testid="reserve-form">
              <p className="text-white/50 text-sm mb-8 text-center">
                Booking request{" "}
                <a href="tel:+88123123456" className="text-gold hover-underline">
                  +88-123-123456
                </a>{" "}
                or complete this boarding pass
              </p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="vintage-label">Passenger Name</label>
                  <input
                    data-testid="res-name"
                    required
                    placeholder="Full Name"
                    className="vintage-field"
                    value={f.name}
                    onChange={(e) => setF({ ...f, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="vintage-label">Contact Number</label>
                  <input
                    data-testid="res-phone"
                    required
                    placeholder="Phone"
                    className="vintage-field"
                    value={f.phone}
                    onChange={(e) => setF({ ...f, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="vintage-label">Email (for confirmation)</label>
                <input
                  data-testid="res-email"
                  type="email"
                  placeholder="Email (optional)"
                  className="vintage-field"
                  value={f.email}
                  onChange={(e) => setF({ ...f, email: e.target.value })}
                />
              </div>

              <div className="vintage-line" />

              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="vintage-label">Travelers</label>
                  <select
                    data-testid="res-persons"
                    className="vintage-select"
                    value={f.persons}
                    onChange={(e) => setF({ ...f, persons: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n} className="bg-[#161412]">
                        {n} Guest{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="vintage-label">Departure Date</label>
                  <input
                    data-testid="res-date"
                    required
                    type="date"
                    className="vintage-field"
                    value={f.date}
                    onChange={(e) => setF({ ...f, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="vintage-label">Boarding Time</label>
                  <select
                    data-testid="res-time"
                    className="vintage-select"
                    value={f.time}
                    onChange={(e) => setF({ ...f, time: e.target.value })}
                  >
                    {times.map((t) => (
                      <option key={t} value={t} className="bg-[#161412]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="vintage-label">Special Requests</label>
                <textarea
                  data-testid="res-message"
                  placeholder="Allergies, celebrations, seating preferences..."
                  className="vintage-field"
                  rows="3"
                  value={f.message}
                  onChange={(e) => setF({ ...f, message: e.target.value })}
                />
              </div>

              <div className="vintage-line" />

              <div className="vintage-stamp inline-block mb-4">
                Table: {selectedTable ? tables.find((t) => t.id === selectedTable)?.label : "Not selected"}
              </div>

              <button
                data-testid="res-submit"
                disabled={busy || !selectedTable}
                className="vintage-btn breathe"
              >
                {busy ? "Issuing Boarding Pass…" : "Confirm Reservation"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
