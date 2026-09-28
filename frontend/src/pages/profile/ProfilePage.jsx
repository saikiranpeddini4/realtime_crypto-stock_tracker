import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  LayoutDashboard, LineChart as LineChartIcon, Star, Bell, Briefcase, User,
  Settings, LogOut, Search, Moon, Sun, TrendingUp, TrendingDown, Plus, X,
  ShieldCheck, Users, Database, ScrollText, FileBarChart, ChevronRight,
  BellRing, Trash2, ArrowUpRight, ArrowDownRight, Wallet, ShoppingCart,
  Repeat, Check,
} from "lucide-react";
import { api } from "../../services/api.js";
import { useApp } from "../../context/AppContext.jsx";
import { fmt } from "../../utils/format.js";
import { Delta, Card, StatCard, MiniSpark, AssetTable } from "../../components/market.jsx";

function ProfilePage({ T }) {
  const { user, setUser } = useApp();
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    if (!user) return;
    setUser({ ...user, name });
    if (localStorage.getItem('marketboard_token')) {
      try {
        await api.updateProfile({ name });
      } catch (err) {
        console.warn("Update profile API error:", err.message);
      }
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p style={{ color: T.muted }} className="text-xs uppercase tracking-[0.18em]">Account</p>
          <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold mt-1">Profile</h1>
        </div>
        {saved && (
          <span style={{ background: 'rgba(34, 197, 94, 0.12)', color: T.up, borderColor: 'rgba(34, 197, 94, 0.35)' }} className="px-3 py-1 rounded-full text-xs border">
            Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-5">
        <Card T={T} className="p-5">
          <div className="flex flex-col items-center text-center">
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(45,212,191,0.2))',
                borderColor: T.border,
                color: T.text,
              }}
              className="w-20 h-20 rounded-full border flex items-center justify-center text-2xl font-semibold"
            >
              {initials}
            </div>

            <div className="mt-4 space-y-2">
              <h2 style={{ color: T.text }} className="text-xl font-semibold">{user?.name || 'User'}</h2>
              <p style={{ color: T.muted }} className="text-sm">{user?.email || 'No email available'}</p>
            </div>

            <div className="mt-5 w-full space-y-2">
              <div
                style={{ background: T.elevated, borderColor: T.border }}
                className="rounded-xl border px-3 py-2 flex items-center justify-between text-sm"
              >
                <span style={{ color: T.muted }}>Role</span>
                <span style={{ color: T.text }} className="font-medium capitalize">{user?.role === 'admin' ? 'Administrator' : 'Investor'}</span>
              </div>

              <div
                style={{ background: T.elevated, borderColor: T.border }}
                className="rounded-xl border px-3 py-2 flex items-center justify-between text-sm"
              >
                <span style={{ color: T.muted }}>Status</span>
                <span style={{ color: T.up }} className="font-medium capitalize">{user?.status || 'active'}</span>
              </div>
            </div>
          </div>
        </Card>

        <Card T={T} className="p-5">
          <div className="space-y-5">
            <div>
              <label style={{ color: T.muted }} className="text-xs uppercase tracking-[0.2em]">Display name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  background: T.elevated,
                  color: T.text,
                  borderColor: T.border,
                }}
                className="w-full mt-2 px-3 py-3 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-indigo-500/40"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label style={{ color: T.muted }} className="text-xs uppercase tracking-[0.2em]">Email address</label>
              <div
                style={{ background: T.elevated, borderColor: T.border, color: T.text }}
                className="mt-2 px-3 py-3 rounded-xl border text-sm"
              >
                {user?.email || 'No email available'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div style={{ background: T.elevated, borderColor: T.border }} className="rounded-xl border p-3">
                <p style={{ color: T.muted }} className="text-xs uppercase tracking-[0.15em]">Wallet</p>
                <p style={{ color: T.text }} className="mt-2 text-lg font-semibold">${Number(user?.cashBalance || 0).toLocaleString()}</p>
              </div>

              <div style={{ background: T.elevated, borderColor: T.border }} className="rounded-xl border p-3">
                <p style={{ color: T.muted }} className="text-xs uppercase tracking-[0.15em]">Access</p>
                <p style={{ color: T.text }} className="mt-2 text-lg font-semibold capitalize">{user?.role === 'admin' ? 'Admin' : 'Investor'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={save}
                style={{ background: T.accent }}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black shadow-md hover:opacity-95 transition"
              >
                Save changes
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export { ProfilePage };
