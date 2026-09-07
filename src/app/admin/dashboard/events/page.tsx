"use client";
import { useEffect, useState } from "react";

interface Event { id: number; title: string; description: string | null; eventDate: string; eventTime: string | null; location: string | null; createdAt: string }

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", eventDate: "", eventTime: "", location: "" });

  async function load() {
    const r = await fetch("/api/admin/events");
    setEvents(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ title: "", description: "", eventDate: "", eventTime: "", location: "" });
    load();
  }

  async function remove(id: number) {
    if (!confirm("Hapus agenda ini?")) return;
    await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Agenda & Kegiatan</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">➕ Tambah Agenda</button>
      </div>

      {showForm && (
        <div className="card border-blue-300">
          <form onSubmit={save} className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2"><label className="text-sm font-medium">Judul *</label><input required className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Tanggal *</label><input required type="date" className="input-field" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Jam</label><input type="time" className="input-field" value={form.eventTime} onChange={e => setForm({ ...form, eventTime: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Lokasi</label><input className="input-field" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Deskripsi</label><input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">💾 Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {events.map(ev => {
          const isUpcoming = new Date(ev.eventDate) >= new Date(new Date().toDateString());
          return (
            <div key={ev.id} className={`card ${isUpcoming ? "border-blue-300 bg-blue-50" : ""}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold text-blue-700">{new Date(ev.eventDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
                  {ev.eventTime && <div className="text-xs text-blue-500">🕐 {ev.eventTime} WIB</div>}
                  <h3 className="font-bold text-gray-800 mt-1">{ev.title}</h3>
                  {ev.description && <p className="text-sm text-gray-600 mt-1">{ev.description}</p>}
                  {ev.location && <p className="text-xs text-gray-500 mt-1">📍 {ev.location}</p>}
                </div>
                <button onClick={() => remove(ev.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
      {events.length === 0 && <div className="text-center py-8 text-gray-500 card">Belum ada agenda</div>}
    </div>
  );
}
