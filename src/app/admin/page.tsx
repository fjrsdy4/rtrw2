"use client";
import { useState, useEffect, useCallback } from "react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (d.user) window.location.href = "/admin/dashboard";
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.error) setError(data.error);
    else window.location.href = "/admin/dashboard";
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Memuat...</div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🏘️</div>
          <h1 className="text-2xl font-bold text-gray-800">eRT/RW Digital</h1>
          <p className="text-sm text-gray-500 mt-1">Login Panel Pengurus</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input required className="input-field" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input required type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••" />
          </div>
          <button type="submit" className="w-full btn-primary py-3 text-lg">🔐 Masuk</button>
        </form>

        <div className="mt-6 text-xs text-gray-400 text-center">
          <p>Default: admin / admin123</p>
          <p className="mt-1">Staff: staff / staff123</p>
          <p>Bendahara: bendahara / bendahara123</p>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-blue-600 hover:underline">← Kembali ke Halaman Utama</a>
        </div>
      </div>
    </div>
  );
}
