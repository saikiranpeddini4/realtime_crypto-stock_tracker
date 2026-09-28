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

function NotificationsPage({ T }) {
  const { notifications, setNotifications, user } = useApp();

  const markAllRead = async () => {
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    if (user && localStorage.getItem('marketboard_token')) {
      try {
        await api.markAllNotificationsRead();
      } catch (err) {
        console.warn("Mark all read API error:", err.message);
      }
    }
  };

  const markRead = async (id) => {
    setNotifications((ns) => ns.map((x) => (x.id === id ? { ...x, read: true } : x)));
    if (user && localStorage.getItem('marketboard_token')) {
      try {
        await api.markNotificationRead(id);
      } catch (err) {
        console.warn("Mark read API error:", err.message);
      }
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold">Notifications</h1>
        <button onClick={markAllRead} style={{ color: T.accent }} className="text-sm">
          Mark all as read
        </button>
      </div>
      <Card T={T} className="p-2">
        {notifications.length === 0 && <p style={{ color: T.muted }} className="text-sm p-4">You're all caught up.</p>}
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markRead(n.id)}
            style={{ borderColor: T.border, background: n.read ? "transparent" : T.accentSoft }}
            className="flex items-start gap-3 px-4 py-3 border-b last:border-0 rounded-lg cursor-pointer"
          >
            <BellRing size={16} style={{ color: n.read ? T.muted : T.accent }} className="mt-0.5" />
            <div>
              <p style={{ color: T.text }} className="text-sm">{n.msg}</p>
              <p style={{ color: T.muted }} className="text-xs mt-0.5">{n.time}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}


export { NotificationsPage };
