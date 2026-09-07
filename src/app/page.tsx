"use client";
import { useState, useEffect, useCallback } from "react";

interface Stats {
  citizenCount: number;
  familyCount: number;
  genderStats: { gender: string; count: number }[];
  religionStats: { religion: string | null; count: number }[];
  maritalStats: { status: string | null; count: number }[];
  ageStats: { age_group: string; count: number }[];
  announcements: { id: number; title: string; content: string; isPinned: boolean; createdAt: string }[];
  events: { id: number; title: string; description: string; eventDate: string; eventTime: string; location: string }[];
  income: string;
  expense: string;
  balance: string;
  recentExpenses: { id: number; txId: string; category: string; description: string; amount: string; txDate: string }[];
  assetCount: number;
  products: { id: number; productName: string; description: string; price: string; whatsapp: string; photoUrl: string | null }[];
}

function formatCurrency(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function LandingPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<"surat" | "aduan" | "pinjam">("surat");
  const [ticketResult, setTicketResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/public/stats");
      if (res.ok) {
        const data = await res.json();
        if (!data.error) setStats(data);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    // Try to seed on first load
    (async () => {
      setSeeding(true);
      try { await fetch("/api/seed", { method: "POST" }); } catch { /* ignore */ }
      setSeeding(false);
      load();
    })();
  }, [load]);

  const [letterForm, setLetterForm] = useState({ requesterName: "", requesterPhone: "", letterType: "Surat Keterangan Domisili", purpose: "" });
  const [complaintForm, setComplaintForm] = useState({ reporterName: "", isAnonymous: false, category: "Lingkungan", content: "" });
  const [borrowForm, setBorrowForm] = useState({ borrowerName: "", borrowerPhone: "", assetId: 0, borrowDate: "", returnDate: "", purpose: "" });
  const [assets, setAssets] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/public/assets-list").then(r => r.json()).then(d => { if (Array.isArray(d)) setAssets(d); }).catch(() => {});
  }, []);

  async function submitLetter(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/public/letter-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(letterForm) });
    const data = await res.json();
    setTicketResult(data.ticketNo || "Error");
    setLoading(false);
  }

  async function submitComplaint(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/public/complaint", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(complaintForm) });
    const data = await res.json();
    setTicketResult(data.ticketNo || "Error");
    setLoading(false);
  }

  async function submitBorrow(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/public/borrow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(borrowForm) });
    const data = await res.json();
    setTicketResult(data.ticketNo || "Error");
    setLoading(false);
  }

  const totalCitizens = stats?.citizenCount || 0;

  if (seeding) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
      <div className="text-white text-xl">⏳ Mempersiapkan sistem...</div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Hero / Header */}
      <header className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2 text-2xl">🏘️</div>
            <div>
              <h1 className="text-xl font-bold">eRT/RW Digital</h1>
              <p className="text-xs text-blue-200">Sistem Manajemen RT/RW</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="#layanan" className="text-sm hover:text-blue-200 transition hidden sm:inline">Layanan</a>
            <a href="#demografi" className="text-sm hover:text-blue-200 transition hidden sm:inline">Demografi</a>
            <a href="#keuangan" className="text-sm hover:text-blue-200 transition hidden sm:inline">Keuangan</a>
            <a href="#umkm" className="text-sm hover:text-blue-200 transition hidden sm:inline">UMKM</a>
            <a href="/admin" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition">
              🔐 Login Pengurus
            </a>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Selamat Datang Warga!</h2>
          <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
            Portal digital RT/RW untuk transparansi informasi, layanan mandiri, dan kemudahan komunikasi antar warga.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">{totalCitizens}</div>
              <div className="text-sm text-blue-200">Total Warga</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">{stats?.familyCount || 0}</div>
              <div className="text-sm text-blue-200">Kepala Keluarga</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">{stats?.assetCount || 0}</div>
              <div className="text-sm text-blue-200">Aset Umum</div>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="text-3xl font-bold">{stats?.events?.length || 0}</div>
              <div className="text-sm text-blue-200">Agenda Mendatang</div>
            </div>
          </div>
        </div>
      </header>

      {/* Announcements */}
      {stats?.announcements && stats.announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 -mt-6 relative z-10 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">📢 Pengumuman</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.announcements.map(a => (
                <div key={a.id} className={`p-4 rounded-lg border ${a.isPinned ? "border-yellow-300 bg-yellow-50" : "border-gray-200 bg-gray-50"}`}>
                  <div className="flex items-start gap-2">
                    {a.isPinned && <span className="text-yellow-500">📌</span>}
                    <div>
                      <h4 className="font-semibold text-gray-800">{a.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{a.content}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(a.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {stats?.events && stats.events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">📅 Agenda Kegiatan Mendatang</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {stats.events.map(ev => (
                <div key={ev.id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-bold text-blue-700">{formatDate(ev.eventDate)}</div>
                  {ev.eventTime && <div className="text-xs text-blue-500">🕐 {ev.eventTime} WIB</div>}
                  <h4 className="font-semibold text-gray-800 mt-2">{ev.title}</h4>
                  {ev.description && <p className="text-sm text-gray-600 mt-1">{ev.description}</p>}
                  {ev.location && <p className="text-xs text-gray-500 mt-2">📍 {ev.location}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Demographics */}
      <section id="demografi" className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">📊 Data Demografi Warga</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Gender */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3">Jenis Kelamin</h4>
              {stats?.genderStats?.map(g => {
                const pct = totalCitizens > 0 ? ((g.count / totalCitizens) * 100).toFixed(1) : "0";
                return (
                  <div key={g.gender} className="mb-2">
                    <div className="flex justify-between text-sm">
                      <span>{g.gender === "L" ? "👨 Laki-laki" : "👩 Perempuan"}</span>
                      <span className="font-medium">{g.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className={`h-2 rounded-full ${g.gender === "L" ? "bg-blue-500" : "bg-pink-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Religion */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3">Agama</h4>
              {stats?.religionStats?.map(r => {
                const pct = totalCitizens > 0 ? ((r.count / totalCitizens) * 100).toFixed(1) : "0";
                return (
                  <div key={r.religion || "null"} className="mb-2">
                    <div className="flex justify-between text-sm">
                      <span>{r.religion || "Belum Diisi"}</span>
                      <span className="font-medium">{r.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Age Groups */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3">Kelompok Usia</h4>
              {stats?.ageStats?.map((a: { age_group: string; count: number }) => {
                const pct = totalCitizens > 0 ? ((a.count / totalCitizens) * 100).toFixed(1) : "0";
                return (
                  <div key={a.age_group} className="mb-2">
                    <div className="flex justify-between text-sm">
                      <span>{a.age_group}</span>
                      <span className="font-medium">{a.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div className="h-2 rounded-full bg-purple-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Marital Status */}
          <div className="border rounded-lg p-4 mt-4">
            <h4 className="font-semibold text-gray-700 mb-3">Status Perkawinan</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats?.maritalStats?.map(m => {
                const pct = totalCitizens > 0 ? ((m.count / totalCitizens) * 100).toFixed(1) : "0";
                const icons: Record<string, string> = { "Belum Menikah": "👤", "Sudah Menikah": "💍", "Cerai Hidup": "💔", "Cerai Mati": "🕊️" };
                return (
                  <div key={m.status || "null"} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{icons[m.status || ""] || "❓"}</div>
                    <div className="font-medium text-sm mt-1">{m.status || "Belum Diisi"}</div>
                    <div className="text-lg font-bold text-gray-800">{m.count}</div>
                    <div className="text-xs text-gray-500">{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Financial Transparency */}
      <section id="keuangan" className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">💰 Transparansi Keuangan</h3>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-sm text-green-600 font-medium">Total Pemasukan</div>
              <div className="text-xl font-bold text-green-700">{formatCurrency(stats?.income || "0")}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-sm text-red-600 font-medium">Total Pengeluaran</div>
              <div className="text-xl font-bold text-red-700">{formatCurrency(stats?.expense || "0")}</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-sm text-blue-600 font-medium">Saldo Kas</div>
              <div className="text-xl font-bold text-blue-700">{formatCurrency(stats?.balance || "0")}</div>
            </div>
          </div>

          {stats?.recentExpenses && stats.recentExpenses.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">💳 Transaksi Pengeluaran Terakhir</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="table-header">
                      <th className="p-2">Tanggal</th>
                      <th className="p-2">ID</th>
                      <th className="p-2">Kategori</th>
                      <th className="p-2">Keterangan</th>
                      <th className="p-2 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentExpenses.map(tx => (
                      <tr key={tx.id} className="border-b">
                        <td className="p-2">{formatDate(tx.txDate)}</td>
                        <td className="p-2 font-mono text-xs">{tx.txId}</td>
                        <td className="p-2">{tx.category}</td>
                        <td className="p-2">{tx.description}</td>
                        <td className="p-2 text-right text-red-600 font-medium">{formatCurrency(tx.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Self-Service Forms */}
      <section id="layanan" className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">🛠️ Layanan Mandiri Warga</h3>
          <p className="text-sm text-gray-500 mb-4">Ajukan permohonan tanpa perlu login! Dapatkan nomor tiket instan.</p>

          {ticketResult && (
            <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg text-center">
              <p className="text-green-800 font-medium">✅ Permohonan berhasil dikirim!</p>
              <p className="text-lg font-bold text-green-900 mt-1">Nomor Tiket: {ticketResult}</p>
              <p className="text-sm text-green-600 mt-1">Simpan nomor tiket ini untuk referensi.</p>
              <button onClick={() => setTicketResult("")} className="mt-2 text-sm text-green-700 underline">Ajukan lagi</button>
            </div>
          )}

          {!ticketResult && (
            <>
              <div className="flex gap-2 mb-4 flex-wrap">
                <button onClick={() => setActiveTab("surat")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "surat" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>📄 Permohonan Surat</button>
                <button onClick={() => setActiveTab("aduan")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "aduan" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>📢 Pengaduan</button>
                <button onClick={() => setActiveTab("pinjam")} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === "pinjam" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>📦 Pinjam Aset</button>
              </div>

              {activeTab === "surat" && (
                <form onSubmit={submitLetter} className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                    <input required className="input-field" value={letterForm.requesterName} onChange={e => setLetterForm({ ...letterForm, requesterName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                    <input className="input-field" value={letterForm.requesterPhone} onChange={e => setLetterForm({ ...letterForm, requesterPhone: e.target.value })} placeholder="08xx" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Surat *</label>
                    <select required className="input-field" value={letterForm.letterType} onChange={e => setLetterForm({ ...letterForm, letterType: e.target.value })}>
                      <option>Surat Keterangan Domisili</option>
                      <option>Surat Keterangan Tidak Mampu</option>
                      <option>Surat Pengantar KTP</option>
                      <option>Surat Pengantar KK</option>
                      <option>Surat Keterangan Usaha</option>
                      <option>Surat Keterangan Pindah</option>
                      <option>Surat Pengantar SKCK</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keperluan</label>
                    <input className="input-field" value={letterForm.purpose} onChange={e => setLetterForm({ ...letterForm, purpose: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">{loading ? "Mengirim..." : "📨 Kirim Permohonan"}</button>
                  </div>
                </form>
              )}

              {activeTab === "aduan" && (
                <form onSubmit={submitComplaint} className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pelapor</label>
                    <input className="input-field" disabled={complaintForm.isAnonymous} value={complaintForm.reporterName} onChange={e => setComplaintForm({ ...complaintForm, reporterName: e.target.value })} />
                  </div>
                  <div className="flex items-end gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={complaintForm.isAnonymous} onChange={e => setComplaintForm({ ...complaintForm, isAnonymous: e.target.checked, reporterName: "" })} className="rounded" />
                      🕵️ Lapor Anonim
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select className="input-field" value={complaintForm.category} onChange={e => setComplaintForm({ ...complaintForm, category: e.target.value })}>
                      <option>Lingkungan</option>
                      <option>Keamanan</option>
                      <option>Infrastruktur</option>
                      <option>Ketertiban</option>
                      <option>Lainnya</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Isi Pengaduan *</label>
                    <textarea required className="input-field" rows={3} value={complaintForm.content} onChange={e => setComplaintForm({ ...complaintForm, content: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">{loading ? "Mengirim..." : "📨 Kirim Pengaduan"}</button>
                  </div>
                </form>
              )}

              {activeTab === "pinjam" && (
                <form onSubmit={submitBorrow} className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Peminjam *</label>
                    <input required className="input-field" value={borrowForm.borrowerName} onChange={e => setBorrowForm({ ...borrowForm, borrowerName: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp</label>
                    <input className="input-field" value={borrowForm.borrowerPhone} onChange={e => setBorrowForm({ ...borrowForm, borrowerPhone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Aset *</label>
                    <select required className="input-field" value={borrowForm.assetId} onChange={e => setBorrowForm({ ...borrowForm, assetId: Number(e.target.value) })}>
                      <option value={0}>-- Pilih aset --</option>
                      {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Keperluan</label>
                    <input className="input-field" value={borrowForm.purpose} onChange={e => setBorrowForm({ ...borrowForm, purpose: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam *</label>
                    <input required type="date" className="input-field" value={borrowForm.borrowDate} onChange={e => setBorrowForm({ ...borrowForm, borrowDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kembali</label>
                    <input type="date" className="input-field" value={borrowForm.returnDate} onChange={e => setBorrowForm({ ...borrowForm, returnDate: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">{loading ? "Mengirim..." : "📨 Ajukan Peminjaman"}</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </section>

      {/* UMKM */}
      {stats?.products && stats.products.length > 0 && (
        <section id="umkm" className="max-w-7xl mx-auto px-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">🛍️ Produk UMKM Warga</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.products.map(p => (
                <div key={p.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="h-32 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center text-4xl mb-3">🛒</div>
                  <h4 className="font-semibold text-gray-800">{p.productName}</h4>
                  {p.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>}
                  {p.price && <p className="text-sm font-bold text-green-700 mt-2">{formatCurrency(p.price)}</p>}
                  {p.whatsapp && (
                    <a href={`https://wa.me/${p.whatsapp.replace(/^0/, "62")}?text=Halo, saya tertarik dengan ${p.productName}`} target="_blank" rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm transition">
                      💬 Chat WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-lg font-bold text-white mb-2">🏘️ eRT/RW Digital</p>
          <p className="text-sm">Sistem Manajemen RT/RW Digital - Transparan, Mudah, Modern</p>
          <p className="text-xs text-gray-500 mt-4">© 2025 eRT/RW Digital. Dibuat dengan ❤️ untuk kemajuan lingkungan.</p>
        </div>
      </footer>
    </div>
  );
}
