"use client";
import { useEffect, useState } from "react";

interface Asset {
  id: number; name: string; description: string | null; quantity: number;
  condition: string; location: string | null; isBorrowable: boolean;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState({ name: "", description: "", quantity: 1, condition: "Baik", location: "", isBorrowable: true });

  async function load() {
    const r = await fetch("/api/admin/assets");
    setAssets(await r.json());
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ name: "", description: "", quantity: 1, condition: "Baik", location: "", isBorrowable: true });
    setShowForm(true);
  }
  function openEdit(a: Asset) {
    setEditing(a);
    setForm({ name: a.name, description: a.description || "", quantity: a.quantity, condition: a.condition, location: a.location || "", isBorrowable: a.isBorrowable });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await fetch("/api/admin/assets", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: editing.id }) });
    } else {
      await fetch("/api/admin/assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setShowForm(false);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Hapus aset ini?")) return;
    await fetch(`/api/admin/assets?id=${id}`, { method: "DELETE" });
    load();
  }

  const condColors: Record<string, string> = { "Baik": "bg-green-100 text-green-700", "Rusak Ringan": "bg-yellow-100 text-yellow-700", "Rusak Berat": "bg-red-100 text-red-700" };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Aset & Inventaris</h2>
        <button onClick={openNew} className="btn-primary">➕ Tambah Aset</button>
      </div>

      {showForm && (
        <div className="card border-blue-300">
          <form onSubmit={save} className="grid md:grid-cols-3 gap-3">
            <div><label className="text-sm font-medium">Nama Aset *</label><input required className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Jumlah</label><input type="number" className="input-field" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
            <div>
              <label className="text-sm font-medium">Kondisi</label>
              <select className="input-field" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
                <option>Baik</option><option>Rusak Ringan</option><option>Rusak Berat</option>
              </select>
            </div>
            <div><label className="text-sm font-medium">Lokasi</label><input className="input-field" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium">Deskripsi</label><input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.isBorrowable} onChange={e => setForm({ ...form, isBorrowable: e.target.checked })} />
                Bisa dipinjam
              </label>
            </div>
            <div className="flex gap-2 items-end">
              <button type="submit" className="btn-primary">💾 Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map(a => (
          <div key={a.id} className="card">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800">{a.name}</h3>
              <span className={`badge ${condColors[a.condition] || "bg-gray-100"}`}>{a.condition}</span>
            </div>
            {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
            <div className="mt-3 text-sm space-y-1 text-gray-500">
              <div>📦 Jumlah: {a.quantity}</div>
              {a.location && <div>📍 {a.location}</div>}
              <div>{a.isBorrowable ? "✅ Bisa dipinjam" : "🚫 Tidak bisa dipinjam"}</div>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => openEdit(a)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">✏️ Edit</button>
              <button onClick={() => remove(a.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">🗑️ Hapus</button>
            </div>
          </div>
        ))}
      </div>
      {assets.length === 0 && <div className="text-center py-8 text-gray-500 card">Belum ada aset</div>}
    </div>
  );
}
