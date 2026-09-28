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

function AlertsPage({ T }) {
  const { alerts, setAlerts, assets, user } = useApp();

  const removeAlert = async (id) => {
    setAlerts((a) => a.filter((x) => x.id !== id));
    if (user && localStorage.getItem('marketboard_token')) {
      try {
        await api.deleteAlert(id);
      } catch (err) {
        console.warn("Delete alert API error:", err.message);
      }
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold">Price Alerts</h1>
      <Card T={T} className="p-5">
        {alerts.length === 0 && <p style={{ color: T.muted }} className="text-sm">No alerts configured.</p>}
        <div className="space-y-3">
          {alerts.map((al) => {
            const asset = assets.find((a) => a.symbol === al.symbol);
            return (
              <div key={al.id} style={{ borderColor: T.border }} className="flex items-center justify-between border-b last:border-0 pb-3">
                <div>
                  <p style={{ color: T.text }} className="text-sm font-medium">{al.symbol}</p>
                  <p style={{ color: T.muted }} className="text-xs">
                    Alert when price goes {al.condition} {fmt(al.target)}
                    {asset && <> Â· current {fmt(asset.price)}</>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    style={{
                      color: al.status === "active" ? T.accent : T.muted,
                      background: al.status === "active" ? T.accentSoft : T.elevated,
                    }}
                    className="text-xs px-2 py-1 rounded-md capitalize"
                  >
                    {al.status}
                  </span>
                  <button onClick={() => removeAlert(al.id)} style={{ color: T.muted }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}


export { AlertsPage };
