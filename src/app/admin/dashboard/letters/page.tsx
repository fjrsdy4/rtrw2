"use client";
import { useEffect, useState } from "react";

interface Letter {
  id: number; ticketNo: string; requesterName: string; requesterPhone: string | null;
  letterType: string; purpose: string | null; status: string; notes: string | null; createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  proses: "bg-blue-100 text-blue-700",
  selesai: "bg-green-100 text-green-700",
  ditolak: "bg-red-100 text-red-700",
};

export default function LettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);

  async function load() {
    const r = await fetch("/api/admin/letters");
    setLetters(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(l: Letter, status: string) {
    const notes = prompt("Catatan:") || "";
    await fetch("/api/admin/letters", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: l.id, status, notes }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="p-2">Tiket</th><th className="p-2">Pemohon</th><th className="p-2">Jenis Surat</th>
              <th className="p-2">Keperluan</th><th className="p-2">Status</th><th className="p-2">Tanggal</th><th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {letters.map(l => (
              <tr key={l.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-mono text-xs">{l.ticketNo}</td>
                <td className="p-2">
                  <div className="font-medium">{l.requesterName}</div>
                  {l.requesterPhone && (
                    <a href={`https://wa.me/${l.requesterPhone.replace(/^0/, "62")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600">💬 {l.requesterPhone}</a>
                  )}
                </td>
                <td className="p-2">{l.letterType}</td>
                <td className="p-2 text-xs">{l.purpose || "-"}</td>
                <td className="p-2"><span className={`badge ${statusColors[l.status]}`}>{l.status}</span></td>
                <td className="p-2 text-xs">{new Date(l.createdAt).toLocaleDateString("id-ID")}</td>
                <td className="p-2">
                  <div className="flex gap-1 flex-wrap">
                    {l.status === "pending" && <button onClick={() => updateStatus(l, "proses")} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Proses</button>}
                    {(l.status === "pending" || l.status === "proses") && (
                      <>
                        <button onClick={() => updateStatus(l, "selesai")} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Selesai</button>
                        <button onClick={() => updateStatus(l, "ditolak")} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">❌ Tolak</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {letters.length === 0 && <div className="text-center py-8 text-gray-500">Belum ada permohonan surat</div>}
      </div>
    </div>
  );
}
