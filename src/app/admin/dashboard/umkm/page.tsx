"use client";
import { useEffect, useState } from "react";

interface Product {
  id: number; productName: string; description: string | null;
  price: string | null; whatsapp: string | null; isActive: boolean;
}

export default function UMKMPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ productName: "", description: "", price: "", whatsapp: "", isActive: true });

  async function load() {
    const r = await fetch("/api/admin/umkm");
    setProducts(await r.json());
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm({ productName: "", description: "", price: "", whatsapp: "", isActive: true });
    setShowForm(true);
  }
  function openEdit(p: Product) {
    setEditing(p);
    setForm({ productName: p.productName, description: p.description || "", price: p.price || "", whatsapp: p.whatsapp || "", isActive: p.isActive });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await fetch("/api/admin/umkm", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, id: editing.id }) });
    } else {
      await fetch("/api/admin/umkm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setShowForm(false);
    load();
  }

  async function remove(id: number) {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`/api/admin/umkm?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Produk UMKM Warga</h2>
        <button onClick={openNew} className="btn-primary">➕ Tambah Produk</button>
      </div>

      {showForm && (
        <div className="card border-blue-300">
          <form onSubmit={save} className="grid md:grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">Nama Produk *</label><input required className="input-field" value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Harga</label><input type="number" className="input-field" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
            <div><label className="text-sm font-medium">No. WhatsApp</label><input className="input-field" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Deskripsi</label><input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> Aktif ditampilkan</label>
            <div className="flex gap-2 items-end">
              <button type="submit" className="btn-primary">💾 Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="p-2">Produk</th><th className="p-2">Deskripsi</th><th className="p-2">Harga</th><th className="p-2">WA</th><th className="p-2">Status</th><th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-medium">{p.productName}</td>
                <td className="p-2 text-xs">{p.description || "-"}</td>
                <td className="p-2">{p.price ? `Rp ${parseFloat(p.price).toLocaleString("id-ID")}` : "-"}</td>
                <td className="p-2 text-xs">{p.whatsapp || "-"}</td>
                <td className="p-2"><span className={`badge ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{p.isActive ? "Aktif" : "Nonaktif"}</span></td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(p)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">✏️</button>
                    <button onClick={() => remove(p.id)} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <div className="text-center py-8 text-gray-500">Belum ada produk</div>}
      </div>
    </div>
  );
}
