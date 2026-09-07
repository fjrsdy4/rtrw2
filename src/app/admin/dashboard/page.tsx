"use client";
import { useEffect, useState } from "react";

function formatCurrency(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/public/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="text-center py-10 text-gray-500">Memuat data...</div>;

  const s = stats as Record<string, unknown>;
  const citizenCount = (s.citizenCount as number) || 0;
  const familyCount = (s.familyCount as number) || 0;
  const assetCount = (s.assetCount as number) || 0;
  const income = (s.income as string) || "0";
  const expense = (s.expense as string) || "0";
  const balance = (s.balance as string) || "0";
  const genderStats = (s.genderStats as { gender: string; count: number }[]) || [];
  const religionStats = (s.religionStats as { religion: string | null; count: number }[]) || [];
  const ageStats = (s.ageStats as { age_group: string; count: number }[]) || [];
  const maritalStats = (s.maritalStats as { status: string | null; count: number }[]) || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="text-3xl">👥</div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{citizenCount}</div>
            <div className="text-sm text-gray-500">Warga Aktif</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="text-3xl">👨‍👩‍👧‍👦</div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{familyCount}</div>
            <div className="text-sm text-gray-500">Kepala Keluarga</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="text-3xl">📦</div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{assetCount}</div>
            <div className="text-sm text-gray-500">Aset Inventaris</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="text-3xl">💰</div>
          <div>
            <div className="text-lg font-bold text-green-700">{formatCurrency(balance)}</div>
            <div className="text-sm text-gray-500">Saldo Kas</div>
          </div>
        </div>
      </div>

      {/* Finance Quick Look */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card bg-green-50 border-green-200">
          <div className="text-sm text-green-600 font-medium mb-1">Total Pemasukan</div>
          <div className="text-2xl font-bold text-green-700">{formatCurrency(income)}</div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="text-sm text-red-600 font-medium mb-1">Total Pengeluaran</div>
          <div className="text-2xl font-bold text-red-700">{formatCurrency(expense)}</div>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Jenis Kelamin</h3>
          {genderStats.map(g => (
            <div key={g.gender} className="flex justify-between text-sm mb-1">
              <span>{g.gender === "L" ? "👨 Laki-laki" : "👩 Perempuan"}</span>
              <span className="font-medium">{g.count} ({citizenCount > 0 ? ((g.count / citizenCount) * 100).toFixed(0) : 0}%)</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Agama</h3>
          {religionStats.map(r => (
            <div key={r.religion || "null"} className="flex justify-between text-sm mb-1">
              <span>{r.religion || "-"}</span>
              <span className="font-medium">{r.count}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Kelompok Usia</h3>
          {ageStats.map((a: { age_group: string; count: number }) => (
            <div key={a.age_group} className="flex justify-between text-sm mb-1">
              <span>{a.age_group}</span>
              <span className="font-medium">{a.count}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="font-semibold text-gray-700 mb-3">Status Perkawinan</h3>
          {maritalStats.map(m => (
            <div key={m.status || "null"} className="flex justify-between text-sm mb-1">
              <span>{m.status || "-"}</span>
              <span className="font-medium">{m.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
