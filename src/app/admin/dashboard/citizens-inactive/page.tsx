"use client";
import { useEffect, useState } from "react";

interface Citizen {
  id: number; nik: string; name: string; gender: string; status: string;
  statusDate: string | null; statusNote: string | null; phone: string | null;
}

export default function InactiveCitizensPage() {
  const [tab, setTab] = useState<"pindah" | "meninggal">("pindah");
  const [citizens, setCitizens] = useState<Citizen[]>([]);

  async function load() {
    const r = await fetch(`/api/admin/citizens?status=${tab}`);
    setCitizens(await r.json());
  }
  useEffect(() => { load(); }, [tab]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab("pindah")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "pindah" ? "bg-yellow-500 text-white" : "bg-gray-100"}`}>📤 Pindah</button>
        <button onClick={() => setTab("meninggal")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "meninggal" ? "bg-gray-600 text-white" : "bg-gray-100"}`}>🕊️ Meninggal</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="p-2">#</th><th className="p-2">NIK</th><th className="p-2">Nama</th><th className="p-2">L/P</th><th className="p-2">Tanggal</th><th className="p-2">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {citizens.map((c, i) => (
              <tr key={c.id} className="border-b">
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-mono text-xs">{c.nik}</td>
                <td className="p-2 font-medium">{c.name}</td>
                <td className="p-2">{c.gender === "L" ? "👨" : "👩"}</td>
                <td className="p-2 text-xs">{c.statusDate || "-"}</td>
                <td className="p-2 text-xs">{c.statusNote || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {citizens.length === 0 && <div className="text-center py-8 text-gray-500">Tidak ada data</div>}
      </div>
    </div>
  );
}
