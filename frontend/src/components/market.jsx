import React, { useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import {
  LayoutDashboard, LineChart as LineChartIcon, Star, Bell, Briefcase, User,
  LogOut, Search, Moon, Sun, ShieldCheck, Users, Database, ScrollText,
  FileBarChart, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useApp } from "../context/AppContext.jsx";
import { fmt } from "../utils/format.js";

function Delta({ value, T }) {
  const up = value >= 0;
  return (
    <span
      style={{ color: up ? T.up : T.down, background: up ? T.upSoft : T.downSoft }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium font-mono"
    >
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
}

/* ---------------------------------------------------------
   TICKER TAPE â€” signature element
--------------------------------------------------------- */
function TickerTape({ T }) {
  const { assets } = useApp();
  const doubled = [...assets, ...assets];
  return (
    <div
      style={{ background: T.elevated, borderColor: T.border }}
      className="w-full overflow-hidden border-b whitespace-nowrap"
    >
      <div className="ticker-track flex items-center py-2 gap-8">
        {doubled.map((a, i) => (
          <div key={i} className="flex items-center gap-2 px-2 shrink-0 font-mono text-xs">
            <span style={{ color: T.muted }}>{a.symbol}</span>
            <span style={{ color: T.text }}>{fmt(a.price)}</span>
            <span style={{ color: a.change >= 0 ? T.up : T.down }}>
              {a.change >= 0 ? "â–²" : "â–¼"} {Math.abs(a.change).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <style>{`
        .ticker-track { width: max-content; animation: ticker-scroll 40s linear infinite; }
        @keyframes ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}

/* ---------------------------------------------------------
   SIDEBAR / NAV
--------------------------------------------------------- */
const USER_NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "market", label: "Market", icon: LineChartIcon },
  { id: "watchlist", label: "Watchlist", icon: Star },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "portfolio", label: "Portfolio", icon: Briefcase },
  { id: "profile", label: "Profile", icon: User },
];
const ADMIN_NAV = [
  { id: "admin-dashboard", label: "Overview", icon: ShieldCheck },
  { id: "admin-users", label: "Users", icon: Users },
  { id: "admin-sources", label: "Data Sources", icon: Database },
  { id: "admin-logs", label: "Audit Logs", icon: ScrollText },
  { id: "admin-reports", label: "Reports", icon: FileBarChart },
];

function Sidebar({ T, page, setPage }) {
  const { user, logout } = useApp();
  const nav = user.role === "admin" ? ADMIN_NAV : USER_NAV;
  return (
    <aside
      style={{ background: T.surface, borderColor: T.border }}
      className="w-60 shrink-0 border-r h-full flex flex-col"
    >
      <div className="px-5 py-5 flex items-center gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div
          style={{ background: T.accent }}
          className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-black"
        >
          âŒ
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="font-semibold text-[15px]">
          <span style={{ color: T.text }}>Market</span>
          <span style={{ color: T.accent }}>Board</span>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {nav.map((n) => {
          const Icon = n.icon;
          const active = page === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              style={{
                background: active ? T.accentSoft : "transparent",
                color: active ? T.accent : T.muted,
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
            >
              <Icon size={17} />
              {n.label}
            </button>
          );
        })}
      </nav>
      <div className="px-3 py-4" style={{ borderTop: `1px solid ${T.border}` }}>
        <button
          onClick={logout}
          style={{ color: T.muted }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:opacity-80"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------
   TOPBAR
--------------------------------------------------------- */
function Topbar({ T, search, setSearch, setPage }) {
  const { theme, setTheme, notifications, user } = useApp();
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <div
      style={{ background: T.surface, borderColor: T.border }}
      className="h-16 shrink-0 border-b flex items-center justify-between px-6 gap-4"
    >
      <div className="relative w-full max-w-sm">
        <Search size={16} style={{ color: T.muted }} className="absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stocks, crypto, currencyâ€¦"
          style={{ background: T.elevated, color: T.text, borderColor: T.border }}
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none focus:ring-1"
        />
      </div>
      <div className="flex items-center gap-3">
        <span style={{ color: T.muted }} className="text-xs font-mono hidden sm:block">
          {user.role === "admin" ? "Administrator" : "Investor"} Â· {user.name}
        </span>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          style={{ background: T.elevated, color: T.text }}
          className="p-2 rounded-lg"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            style={{ background: T.elevated, color: T.text }}
            className="p-2 rounded-lg relative"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span
                style={{ background: T.down }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center text-white"
              >
                {unread}
              </span>
            )}
          </button>
          {open && (
            <div
              style={{ background: T.elevated, borderColor: T.border }}
              className="absolute right-0 mt-2 w-80 border rounded-xl shadow-xl z-20 overflow-hidden"
            >
              <div style={{ borderColor: T.border }} className="px-4 py-3 border-b flex items-center justify-between">
                <span style={{ color: T.text }} className="text-sm font-medium">Notifications</span>
                <button onClick={() => { setOpen(false); setPage("notifications"); }} style={{ color: T.accent }} className="text-xs">
                  View all
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} style={{ borderColor: T.border }} className="px-4 py-3 border-b text-xs">
                    <p style={{ color: T.text }}>{n.msg}</p>
                    <p style={{ color: T.muted }} className="mt-1">{n.time}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p style={{ color: T.muted }} className="p-4 text-xs">No notifications yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   SHARED: Card / Table / Chart
--------------------------------------------------------- */
function Card({ T, children, className = "", style = {} }) {
  return (
    <div
      style={{ background: T.surface, borderColor: T.border, ...style }}
      className={`border rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({ T, label, value, sub, accent }) {
  return (
    <Card T={T} className="p-4">
      <p style={{ color: T.muted }} className="text-xs">{label}</p>
      <p style={{ color: accent ? T.accent : T.text, fontFamily: "'IBM Plex Mono', monospace" }} className="text-2xl font-semibold mt-1">
        {value}
      </p>
      {sub && <p style={{ color: T.muted }} className="text-xs mt-1">{sub}</p>}
    </Card>
  );
}

function MiniSpark({ data, color }) {
  return (
    <ResponsiveContainer width={90} height={32}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AssetTable({ T, assets, onSelect, onToggleWatch, watchlist }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ color: T.muted, borderColor: T.border }} className="border-b text-left text-xs uppercase tracking-wide">
            <th className="py-2.5 pr-3 font-medium">Asset</th>
            <th className="py-2.5 pr-3 font-medium">Price</th>
            <th className="py-2.5 pr-3 font-medium">24h</th>
            <th className="py-2.5 pr-3 font-medium hidden md:table-cell">Trend</th>
            <th className="py-2.5 pr-3 font-medium text-right">Watch</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr
              key={a.symbol}
              onClick={() => onSelect(a)}
              style={{ borderColor: T.border }}
              className="border-b last:border-0 cursor-pointer hover:opacity-90"
            >
              <td className="py-3 pr-3">
                <p style={{ color: T.text }} className="font-medium">{a.symbol}</p>
                <p style={{ color: T.muted }} className="text-xs">{a.name}</p>
              </td>
              <td style={{ color: T.text, fontFamily: "'IBM Plex Mono', monospace" }} className="py-3 pr-3">
                {fmt(a.price)}
              </td>
              <td className="py-3 pr-3"><Delta value={a.change} T={T} /></td>
              <td className="py-3 pr-3 hidden md:table-cell">
                <MiniSpark data={a.history} color={a.change >= 0 ? T.up : T.down} />
              </td>
              <td className="py-3 pr-3 text-right">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleWatch(a.symbol); }}
                  style={{ color: watchlist.includes(a.symbol) ? T.accent : T.muted }}
                >
                  <Star size={16} fill={watchlist.includes(a.symbol) ? T.accent : "none"} />
                </button>
              </td>
            </tr>
          ))}
          {assets.length === 0 && (
            <tr><td colSpan={5} style={{ color: T.muted }} className="py-8 text-center text-sm">No assets match your search.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


export { Delta, TickerTape, Sidebar, Topbar, Card, StatCard, MiniSpark, AssetTable };
