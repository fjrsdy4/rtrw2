"use client";
import { useEffect, useState } from "react";

interface Citizen { id: number; name: string; phone: string | null }

export default function BroadcastPage() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("umum");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/citizens?status=aktif").then(r => r.json()).then((data: Citizen[]) => {
      setCitizens(data.filter(c => c.phone));
    }).catch(() => {});
  }, []);

  const templates: Record<string, string> = {
    umum: "🏘️ *PENGUMUMAN RT/RW*\n\nAssalamualaikum Wr. Wb.\n\nKepada seluruh warga RT/RW,\n\n[ISI PENGUMUMAN]\n\nDemikian pengumuman ini disampaikan. Terima kasih atas perhatiannya.\n\nHormat kami,\nPengurus RT/RW",
    ronda: "🔦 *JADWAL RONDA MALAM*\n\nKepada warga yang bertugas ronda malam ini:\n\n[NAMA-NAMA PETUGAS]\n\n⏰ Waktu: 22.00 - 04.00 WIB\n📍 Pos: Pos Ronda RT\n\nMohon hadir tepat waktu. Terima kasih.",
    bencana: "🚨 *PERINGATAN DARURAT*\n\n⚠️ [JENIS PERINGATAN]\n\nKepada seluruh warga RT/RW:\n\n[INSTRUKSI KESELAMATAN]\n\n📞 Kontak Darurat: [NOMOR]\n\nTetap tenang dan waspada. Keselamatan adalah prioritas utama.",
    iuran: "💰 *PENGINGAT IURAN*\n\nKepada seluruh warga RT/RW,\n\nDiingatkan untuk membayar iuran bulanan:\n📅 Batas: Tanggal 15\n💵 Jumlah: [JUMLAH]\n\nPembayaran ke bendahara RT atau transfer ke:\n[REKENING]\n\nTerima kasih atas kontribusinya! 🙏",
  };

  function applyTemplate(type: string) {
    setMessageType(type);
    setMessage(templates[type] || "");
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openWAGroup() {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  }

  function openPersonalWA(phone: string) {
    const num = phone.replace(/^0/, "62").replace(/\D/g, "");
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${num}?text=${encoded}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-3">📱 Pusat Broadcast WhatsApp</h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <button onClick={() => applyTemplate("umum")} className={`px-3 py-1.5 rounded-lg text-sm ${messageType === "umum" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>📢 Umum</button>
          <button onClick={() => applyTemplate("ronda")} className={`px-3 py-1.5 rounded-lg text-sm ${messageType === "ronda" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>🔦 Ronda</button>
          <button onClick={() => applyTemplate("bencana")} className={`px-3 py-1.5 rounded-lg text-sm ${messageType === "bencana" ? "bg-red-600 text-white" : "bg-gray-100"}`}>🚨 Darurat</button>
          <button onClick={() => applyTemplate("iuran")} className={`px-3 py-1.5 rounded-lg text-sm ${messageType === "iuran" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>💰 Iuran</button>
        </div>

        <textarea className="input-field" rows={8} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tulis pesan broadcast..." />

        <div className="flex flex-wrap gap-3 mt-4">
          <button onClick={copyToClipboard} className="btn-primary">{copied ? "✅ Tersalin!" : "📋 Salin Teks"}</button>
          <button onClick={openWAGroup} className="btn-success" disabled={!message}>📤 Buka WhatsApp</button>
        </div>
      </div>

      {/* Personal Chain Send */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-3">📨 Kirim Pesan Berantai Personal</h3>
        <p className="text-sm text-gray-500 mb-3">Klik nomor warga untuk mengirim pesan di atas via WhatsApp pribadi.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {citizens.map(c => (
            <button key={c.id} onClick={() => openPersonalWA(c.phone!)} disabled={!message}
              className="text-left p-2 rounded-lg border hover:bg-green-50 hover:border-green-300 transition text-sm disabled:opacity-50">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-green-600">💬 {c.phone}</div>
            </button>
          ))}
        </div>
        {citizens.length === 0 && <p className="text-gray-500 text-sm">Tidak ada warga dengan nomor WA</p>}
      </div>
    </div>
  );
}
