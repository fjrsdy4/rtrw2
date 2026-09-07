"use client";
import { useEffect, useState } from "react";

interface Family { id: number; noKK: string; headName: string; address: string | null }
interface Citizen { id: number; name: string; nik: string; gender: string; familyRelation: string; birthDate: string; phone: string }

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ noKK: "", headName: "", address: "" });
  const [members, setMembers] = useState<Citizen[]>([]);
  const [viewFamily, setViewFamily] = useState<Family | null>(null);
  const [pwdDialog, setPwdDialog] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pendingFamily, setPendingFamily] = useState<Family | null>(null);

  async function load() {
    const r = await fetch("/api/admin/families");
    setFamilies(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/families", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ noKK: "", headName: "", address: "" });
    load();
  }

  function requestView(f: Family) {
    setPendingFamily(f);
    setPwdDialog(true);
    setPwd("");
  }

  async function verifyAndView() {
    // Admin password verification
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: pwd }),
    });
    const data = await res.json();
    if (data.error) {
      alert("Password salah!");
      return;
    }
    setPwdDialog(false);
    if (pendingFamily) {
      setViewFamily(pendingFamily);
      const r = await fetch(`/api/admin/citizens?status=aktif&search=`);
      const all: Citizen[] = await r.json();
      setMembers(all.filter((c) => (c as Citizen & { familyId?: number }).familyId === pendingFamily.id));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Data Kartu Keluarga</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">➕ Tambah KK</button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={save} className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">No. KK *</label>
              <input required className="input-field" value={form.noKK} onChange={e => setForm({ ...form, noKK: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Nama Kepala Keluarga *</label>
              <input required className="input-field" value={form.headName} onChange={e => setForm({ ...form, headName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Alamat</label>
              <input className="input-field" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">💾 Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Password Dialog */}
      {pwdDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-bold mb-3">🔐 Verifikasi Admin</h3>
            <p className="text-sm text-gray-600 mb-3">Data KK dilindungi. Masukkan password admin untuk melihat detail.</p>
            <input type="password" className="input-field mb-3" placeholder="Password admin" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && verifyAndView()} />
            <div className="flex gap-2">
              <button onClick={verifyAndView} className="btn-primary">Verifikasi</button>
              <button onClick={() => setPwdDialog(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* View Family Members */}
      {viewFamily && (
        <div className="card border-blue-300 bg-blue-50">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-lg">👨‍👩‍👧‍👦 KK: {viewFamily.noKK}</h3>
              <p className="text-sm text-gray-600">Kepala: {viewFamily.headName} | {viewFamily.address}</p>
            </div>
            <button onClick={() => setViewFamily(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="p-2">Nama</th><th className="p-2">NIK</th><th className="p-2">L/P</th><th className="p-2">Hubungan</th><th className="p-2">TTL</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="border-b">
                  <td className="p-2 font-medium">{m.name}</td>
                  <td className="p-2 font-mono text-xs">{m.nik}</td>
                  <td className="p-2">{m.gender === "L" ? "👨" : "👩"}</td>
                  <td className="p-2">{m.familyRelation}</td>
                  <td className="p-2 text-xs">{m.birthDate || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && <p className="text-center py-4 text-gray-500">Belum ada anggota terdaftar</p>}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="p-2">#</th><th className="p-2">No. KK</th><th className="p-2">Kepala Keluarga</th><th className="p-2">Alamat</th><th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {families.map((f, i) => (
              <tr key={f.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-mono">{f.noKK}</td>
                <td className="p-2 font-medium">{f.headName}</td>
                <td className="p-2 text-xs">{f.address || "-"}</td>
                <td className="p-2">
                  <button onClick={() => requestView(f)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">🔍 Lihat Anggota</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
