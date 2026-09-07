"use client";
import { useEffect, useState } from "react";

interface Tx {
  id: number; txId: string; txType: string; category: string; description: string;
  amount: string; txDate: string; proofUrl: string | null; createdAt: string;
}

function formatCurrency(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function FinancePage() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ txType: "masuk", category: "", description: "", amount: "", txDate: new Date().toISOString().split("T")[0] });
  const [filter, setFilter] = useState<"all" | "masuk" | "keluar">("all");

  async function load() {
    const r = await fetch("/api/admin/transactions");
    setTxs(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/transactions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ txType: "masuk", category: "", description: "", amount: "", txDate: new Date().toISOString().split("T")[0] });
    load();
  }

  const filtered = filter === "all" ? txs : txs.filter(t => t.txType === filter);
  const totalIn = txs.filter(t => t.txType === "masuk").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalOut = txs.filter(t => t.txType === "keluar").reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card bg-green-50 border-green-200">
          <div className="text-sm text-green-600">Total Pemasukan</div>
          <div className="text-xl font-bold text-green-700">{formatCurrency(totalIn)}</div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="text-sm text-red-600">Total Pengeluaran</div>
          <div className="text-xl font-bold text-red-700">{formatCurrency(totalOut)}</div>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <div className="text-sm text-blue-600">Saldo</div>
          <div className="text-xl font-bold text-blue-700">{formatCurrency(totalIn - totalOut)}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-sm ${filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>Semua</button>
          <button onClick={() => setFilter("masuk")} className={`px-3 py-1.5 rounded-lg text-sm ${filter === "masuk" ? "bg-green-600 text-white" : "bg-gray-100"}`}>Pemasukan</button>
          <button onClick={() => setFilter("keluar")} className={`px-3 py-1.5 rounded-lg text-sm ${filter === "keluar" ? "bg-red-600 text-white" : "bg-gray-100"}`}>Pengeluaran</button>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">➕ Tambah Transaksi</button>
      </div>

      {showForm && (
        <div className="card border-blue-300">
          <form onSubmit={save} className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Tipe *</label>
              <select className="input-field" value={form.txType} onChange={e => setForm({ ...form, txType: e.target.value })}>
                <option value="masuk">💚 Pemasukan</option>
                <option value="keluar">❤️ Pengeluaran</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Kategori *</label>
              <input required className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Iuran/Sumbangan/Operasional" />
            </div>
            <div>
              <label className="text-sm font-medium">Jumlah (Rp) *</label>
              <input required type="number" className="input-field" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Tanggal *</label>
              <input required type="date" className="input-field" value={form.txDate} onChange={e => setForm({ ...form, txDate: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Keterangan</label>
              <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
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
              <th className="p-2">Tanggal</th><th className="p-2">ID</th><th className="p-2">Tipe</th><th className="p-2">Kategori</th><th className="p-2">Keterangan</th><th className="p-2 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="p-2 text-xs">{t.txDate}</td>
                <td className="p-2 font-mono text-xs">{t.txId}</td>
                <td className="p-2">
                  <span className={`badge ${t.txType === "masuk" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {t.txType === "masuk" ? "↗ Masuk" : "↙ Keluar"}
                  </span>
                </td>
                <td className="p-2">{t.category}</td>
                <td className="p-2 text-xs">{t.description}</td>
                <td className={`p-2 text-right font-medium ${t.txType === "masuk" ? "text-green-700" : "text-red-700"}`}>
                  {t.txType === "masuk" ? "+" : "-"}{formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
