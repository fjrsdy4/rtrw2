"use client";
import { useEffect, useState } from "react";

interface DueType { id: number; name: string; amount: string }
interface CitizenMin { id: number; name: string }
interface Payment { id: number; citizenId: number; dueTypeId: number; month: number; year: number; paid: boolean }

export default function DuesPage() {
  const [types, setTypes] = useState<DueType[]>([]);
  const [citizensList, setCitizensList] = useState<CitizenMin[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedType, setSelectedType] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/dues");
    const d = await r.json();
    setTypes(d.types || []);
    setCitizensList(d.citizens || []);
    setPayments(d.payments || []);
    if (d.types?.length > 0 && selectedType === 0) setSelectedType(d.types[0].id);
  }
  useEffect(() => { load(); }, []);

  function isPaid(citizenId: number, month: number) {
    return payments.some(p => p.citizenId === citizenId && p.dueTypeId === selectedType && p.month === month && p.year === selectedYear && p.paid);
  }

  async function togglePay(citizenId: number, month: number) {
    if (isPaid(citizenId, month)) return; // Already paid
    setLoading(true);
    await fetch("/api/admin/dues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ citizenId, dueTypeId: selectedType, month, year: selectedYear }),
    });
    await load();
    setLoading(false);
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select className="input-field w-auto" value={selectedType} onChange={e => setSelectedType(Number(e.target.value))}>
          {types.map(t => <option key={t.id} value={t.id}>{t.name} - Rp {parseFloat(t.amount).toLocaleString("id-ID")}</option>)}
        </select>
        <select className="input-field w-auto" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="p-2 sticky left-0 bg-gray-50">Warga</th>
              {months.map((m, i) => <th key={i} className="p-2 text-center">{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {citizensList.map(c => (
              <tr key={c.id} className="border-b">
                <td className="p-2 font-medium sticky left-0 bg-white whitespace-nowrap">{c.name}</td>
                {months.map((_, mi) => {
                  const paid = isPaid(c.id, mi + 1);
                  return (
                    <td key={mi} className="p-2 text-center">
                      <button
                        onClick={() => togglePay(c.id, mi + 1)}
                        disabled={paid || loading}
                        className={`w-8 h-8 rounded-lg text-sm font-bold transition ${paid ? "bg-green-500 text-white cursor-default" : "bg-gray-200 hover:bg-yellow-200 cursor-pointer"}`}
                      >
                        {paid ? "✓" : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {citizensList.length === 0 && <div className="text-center py-8 text-gray-500">Belum ada data</div>}
      </div>
    </div>
  );
}
