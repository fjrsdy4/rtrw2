"use client";
import { useEffect, useState } from "react";

interface Citizen {
  id: number; nik: string; name: string; gender: string; birthPlace: string; birthDate: string;
  religion: string; maritalStatus: string; occupation: string; phone: string; address: string;
  rt: string; rw: string; familyId: number | null; familyRelation: string; status: string;
  familyNoKK: string | null; familyHeadName: string | null;
}
interface Family { id: number; noKK: string; headName: string }

const religions = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya"];
const maritalOptions = ["Belum Menikah", "Sudah Menikah", "Cerai Hidup", "Cerai Mati"];
const familyRelations = ["Kepala Keluarga", "Istri", "Suami", "Anak", "Orang Tua", "Mertua", "Menantu", "Cucu", "Lainnya"];

function classifyAge(bd: string) {
  if (!bd) return "-";
  const today = new Date();
  const birth = new Date(bd);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  if (age < 5) return `${age}th - Balita`;
  if (age < 12) return `${age}th - Anak`;
  if (age < 18) return `${age}th - Remaja`;
  if (age < 26) return `${age}th - Pemuda`;
  if (age < 46) return `${age}th - Dewasa`;
  if (age < 60) return `${age}th - Paruh Baya`;
  return `${age}th - Lansia`;
}

export default function CitizensPage() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Citizen | null>(null);
  const [form, setForm] = useState({
    nik: "", name: "", gender: "L", birthPlace: "", birthDate: "", religion: "Islam",
    maritalStatus: "Belum Menikah", occupation: "", phone: "", address: "", rt: "001", rw: "002",
    familyId: 0, familyRelation: "",
  });

  async function load() {
    const [cRes, fRes] = await Promise.all([
      fetch(`/api/admin/citizens?status=aktif&search=${search}`),
      fetch("/api/admin/families"),
    ]);
    setCitizens(await cRes.json());
    setFamilies(await fRes.json());
  }

  useEffect(() => { load(); }, [search]);

  function openNew() {
    setEditing(null);
    setForm({ nik: "", name: "", gender: "L", birthPlace: "", birthDate: "", religion: "Islam", maritalStatus: "Belum Menikah", occupation: "", phone: "", address: "", rt: "001", rw: "002", familyId: 0, familyRelation: "" });
    setShowForm(true);
  }

  function openEdit(c: Citizen) {
    setEditing(c);
    setForm({
      nik: c.nik, name: c.name, gender: c.gender, birthPlace: c.birthPlace || "", birthDate: c.birthDate || "",
      religion: c.religion || "Islam", maritalStatus: c.maritalStatus || "Belum Menikah", occupation: c.occupation || "",
      phone: c.phone || "", address: c.address || "", rt: c.rt || "", rw: c.rw || "",
      familyId: c.familyId || 0, familyRelation: c.familyRelation || "",
    });
    setShowForm(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, familyId: form.familyId || null };
    if (editing) {
      await fetch("/api/admin/citizens", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, id: editing.id, status: "aktif" }) });
    } else {
      await fetch("/api/admin/citizens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    }
    setShowForm(false);
    load();
  }

  async function markStatus(c: Citizen, status: string) {
    const note = prompt(`Catatan untuk ${status}:`);
    if (note === null) return;
    await fetch("/api/admin/citizens", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, status, statusDate: new Date().toISOString().split("T")[0], statusNote: note }),
    });
    load();
  }

  function waLink(phone: string) {
    if (!phone) return "#";
    const num = phone.replace(/^0/, "62").replace(/\D/g, "");
    return `https://wa.me/${num}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <input className="input-field max-w-xs" placeholder="🔍 Cari nama, NIK, atau HP..." value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={openNew} className="btn-primary">➕ Tambah Warga</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl my-8">
            <h3 className="text-lg font-bold mb-4">{editing ? "Edit Warga" : "Tambah Warga Baru"}</h3>
            <form onSubmit={save} className="grid grid-cols-2 gap-3">
              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-medium">NIK *</label>
                <input required className="input-field" maxLength={16} value={form.nik} onChange={e => setForm({ ...form, nik: e.target.value })} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="text-sm font-medium">Nama Lengkap *</label>
                <input required className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Jenis Kelamin *</label>
                <select className="input-field" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Agama</label>
                <select className="input-field" value={form.religion} onChange={e => setForm({ ...form, religion: e.target.value })}>
                  {religions.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Tempat Lahir</label>
                <input className="input-field" value={form.birthPlace} onChange={e => setForm({ ...form, birthPlace: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Tanggal Lahir</label>
                <input type="date" className="input-field" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Status Perkawinan</label>
                <select className="input-field" value={form.maritalStatus} onChange={e => setForm({ ...form, maritalStatus: e.target.value })}>
                  {maritalOptions.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Pekerjaan</label>
                <input className="input-field" value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">No. HP/WA</label>
                <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Kartu Keluarga</label>
                <select className="input-field" value={form.familyId} onChange={e => setForm({ ...form, familyId: Number(e.target.value) })}>
                  <option value={0}>-- Pilih KK --</option>
                  {families.map(f => <option key={f.id} value={f.id}>{f.noKK} - {f.headName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Hubungan dlm Keluarga</label>
                <select className="input-field" value={form.familyRelation} onChange={e => setForm({ ...form, familyRelation: e.target.value })}>
                  <option value="">-- Pilih --</option>
                  {familyRelations.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">RT</label>
                <input className="input-field" value={form.rt} onChange={e => setForm({ ...form, rt: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">RW</label>
                <input className="input-field" value={form.rw} onChange={e => setForm({ ...form, rw: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Alamat</label>
                <input className="input-field" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="col-span-2 flex gap-3 mt-2">
                <button type="submit" className="btn-primary">💾 Simpan</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="p-2">#</th>
              <th className="p-2">NIK</th>
              <th className="p-2">Nama</th>
              <th className="p-2">L/P</th>
              <th className="p-2">Usia</th>
              <th className="p-2">Agama</th>
              <th className="p-2">No. KK</th>
              <th className="p-2">Hubungan</th>
              <th className="p-2">WA</th>
              <th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {citizens.map((c, i) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-mono text-xs">{c.nik}</td>
                <td className="p-2 font-medium">{c.name}</td>
                <td className="p-2">{c.gender === "L" ? "👨" : "👩"}</td>
                <td className="p-2 text-xs">{classifyAge(c.birthDate)}</td>
                <td className="p-2 text-xs">{c.religion || "-"}</td>
                <td className="p-2 text-xs">{c.familyNoKK || "-"}</td>
                <td className="p-2 text-xs">{c.familyRelation || "-"}</td>
                <td className="p-2">
                  {c.phone ? (
                    <a href={waLink(c.phone)} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 text-xs">💬 {c.phone}</a>
                  ) : "-"}
                </td>
                <td className="p-2">
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={() => openEdit(c)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">✏️</button>
                    <button onClick={() => markStatus(c, "pindah")} className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200">📤 Pindah</button>
                    <button onClick={() => markStatus(c, "meninggal")} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200">🕊️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {citizens.length === 0 && <div className="text-center py-8 text-gray-500">Belum ada data warga</div>}
      </div>
    </div>
  );
}
