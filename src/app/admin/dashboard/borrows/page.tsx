"use client";
import { useEffect, useState } from "react";

interface Borrow {
  id: number; ticketNo: string; assetName: string | null; borrowerName: string;
  borrowerPhone: string | null; borrowDate: string; returnDate: string | null;
  actualReturnDate: string | null; status: string; purpose: string | null; createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700", disetujui: "bg-blue-100 text-blue-700",
  ditolak: "bg-red-100 text-red-700", dikembalikan: "bg-green-100 text-green-700",
};

export default function BorrowsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);

  async function load() {
    const r = await fetch("/api/admin/borrows");
    setBorrows(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(b: Borrow, status: string) {
    const body: Record<string, unknown> = { id: b.id, status };
    if (status === "dikembalikan") body.actualReturnDate = new Date().toISOString().split("T")[0];
    await fetch("/api/admin/borrows", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="p-2">Tiket</th><th className="p-2">Aset</th><th className="p-2">Peminjam</th>
              <th className="p-2">Tgl Pinjam</th><th className="p-2">Tgl Kembali</th><th className="p-2">Status</th><th className="p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map(b => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-mono text-xs">{b.ticketNo}</td>
                <td className="p-2 font-medium">{b.assetName}</td>
                <td className="p-2">
                  <div>{b.borrowerName}</div>
                  {b.borrowerPhone && (
                    <a href={`https://wa.me/${b.borrowerPhone.replace(/^0/, "62")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600">💬 {b.borrowerPhone}</a>
                  )}
                </td>
                <td className="p-2 text-xs">{b.borrowDate}</td>
                <td className="p-2 text-xs">{b.actualReturnDate || b.returnDate || "-"}</td>
                <td className="p-2"><span className={`badge ${statusColors[b.status]}`}>{b.status}</span></td>
                <td className="p-2">
                  <div className="flex gap-1 flex-wrap">
                    {b.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(b, "disetujui")} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">✅ Setuju</button>
                        <button onClick={() => updateStatus(b, "ditolak")} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">❌ Tolak</button>
                      </>
                    )}
                    {b.status === "disetujui" && <button onClick={() => updateStatus(b, "dikembalikan")} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">📥 Kembali</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {borrows.length === 0 && <div className="text-center py-8 text-gray-500">Belum ada peminjaman</div>}
      </div>
    </div>
  );
}
