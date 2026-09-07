"use client";
import { useState, useEffect, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface User { id: number; name: string; role: string; username: string }
interface Notification { id: number; title: string; message: string; type: string; isRead: boolean; createdAt: string }

const menuItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "staff", "bendahara"] },
  { href: "/admin/dashboard/citizens", label: "Data Warga", icon: "👥", roles: ["admin", "staff"] },
  { href: "/admin/dashboard/families", label: "Data KK", icon: "👨‍👩‍👧‍👦", roles: ["admin", "staff"] },
  { href: "/admin/dashboard/citizens-inactive", label: "Pindah/Meninggal", icon: "📂", roles: ["admin", "staff"] },
  { href: "/admin/dashboard/finance", label: "Keuangan", icon: "💰", roles: ["admin", "bendahara"] },
  { href: "/admin/dashboard/dues", label: "Iuran Warga", icon: "💳", roles: ["admin", "bendahara"] },
  { href: "/admin/dashboard/assets", label: "Aset & Inventaris", icon: "📦", roles: ["admin", "staff"] },
  { href: "/admin/dashboard/letters", label: "Permohonan Surat", icon: "📄", roles: ["admin", "staff"] },
  { href: "/admin/dashboard/complaints", label: "Pengaduan", icon: "📢", roles: ["admin", "staff"] },
  { href: "/admin/dashboard/borrows", label: "Peminjaman Aset", icon: "🤝", roles: ["admin", "staff"] },
  { href: "/admin/dashboard/announcements", label: "Pengumuman", icon: "📣", roles: ["admin", "staff"] },
  { href: "/admin/dashboard/events", label: "Agenda & Absensi", icon: "📅", roles: ["admin", "staff"] },
  { href: "/admin/dashboard/umkm", label: "UMKM Warga", icon: "🛍️", roles: ["admin", "staff"] },
  { href: "/admin/dashboard/broadcast", label: "Broadcast WA", icon: "📱", roles: ["admin", "staff"] },
  { href: "/admin/dashboard/logs", label: "Log Aktivitas", icon: "🔒", roles: ["admin"] },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => {
      if (!d.user) window.location.href = "/admin";
      else { setUser(d.user); setLoading(false); }
    }).catch(() => { window.location.href = "/admin"; });
  }, []);

  const loadNotifs = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/notifications");
      const d = await r.json();
      setNotifs(d.notifications || []);
      setUnreadCount(d.unreadCount || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifs();
      const interval = setInterval(loadNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [user, loadNotifs]);

  async function markAllRead() {
    await fetch("/api/admin/notifications", { method: "PUT" });
    setUnreadCount(0);
    loadNotifs();
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin";
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Memuat...</div></div>;
  if (!user) return null;

  const filteredMenu = menuItems.filter(m => m.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-900 to-indigo-900 transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏘️</div>
            <div>
              <h2 className="text-white font-bold">eRT/RW Digital</h2>
              <p className="text-xs text-blue-300">Panel Pengurus</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {filteredMenu.map(m => (
            <Link key={m.href} href={m.href} onClick={() => setSidebarOpen(false)}
              className={pathname === m.href ? "sidebar-link-active" : "sidebar-link"}>
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <div className="text-xs text-blue-300 mb-2 px-2">{user.name} ({user.role})</div>
          <button onClick={handleLogout} className="w-full text-left sidebar-link hover:bg-red-500/20 hover:text-red-300">
            <span>🚪</span><span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-lg font-bold text-gray-800">
              {filteredMenu.find(m => m.href === pathname)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)} className="relative p-2 rounded-lg hover:bg-gray-100">
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b flex justify-between items-center">
                    <span className="font-semibold text-sm">Notifikasi</span>
                    {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Tandai semua dibaca</button>}
                  </div>
                  {notifs.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">Tidak ada notifikasi</div>
                  ) : (
                    notifs.map(n => (
                      <div key={n.id} className={`p-3 border-b text-sm ${n.isRead ? "" : "bg-blue-50"}`}>
                        <div className="font-medium">{n.title}</div>
                        <div className="text-gray-500 text-xs mt-1">{n.message}</div>
                        <div className="text-gray-400 text-xs mt-1">{new Date(n.createdAt).toLocaleString("id-ID")}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">🌐 Lihat Situs</Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
