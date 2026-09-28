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

function DashboardPage({ T, setPage, setSelectedAsset }) {
  const { assets, watchlist, alerts, portfolio } = useApp();
  const topMovers = [...assets].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 5);
  const watched = assets.filter((a) => watchlist.includes(a.symbol));
  const activeAlerts = alerts.filter((a) => a.status === "active");
  const portfolioValue = portfolio.reduce((sum, h) => {
    const asset = assets.find((a) => a.symbol === h.symbol);
    return sum + (asset ? asset.price * h.qty : 0);
  }, 0);
  const portfolioCost = portfolio.reduce((sum, h) => sum + h.buyPrice * h.qty, 0);
  const pl = portfolioValue - portfolioCost;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold">Dashboard</h1>
        <p style={{ color: T.muted }} className="text-sm mt-1">Simulated price snapshot across stocks, crypto and currency markets.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard T={T} label="Portfolio Value" value={`$${fmt(portfolioValue)}`} sub={`${pl >= 0 ? "+" : ""}$${fmt(pl)} P/L`} accent />
        <StatCard T={T} label="Watchlist" value={watched.length} sub="assets tracked" />
        <StatCard T={T} label="Active Alerts" value={activeAlerts.length} sub={`${alerts.length - activeAlerts.length} triggered`} />
        <StatCard T={T} label="Markets Tracked" value="3" sub="stocks Â· crypto Â· currency" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card T={T} className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ color: T.text }} className="font-medium text-sm">Top movers</h2>
            <button onClick={() => setPage("market")} style={{ color: T.accent }} className="text-xs flex items-center gap-1">
              View market <ChevronRight size={12} />
            </button>
          </div>
          <AssetTable T={T} assets={topMovers} onSelect={(a) => setSelectedAsset(a)} onToggleWatch={() => {}} watchlist={watchlist} />
        </Card>

        <Card T={T} className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ color: T.text }} className="font-medium text-sm">Watchlist preview</h2>
            <button onClick={() => setPage("watchlist")} style={{ color: T.accent }} className="text-xs flex items-center gap-1">
              All <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {watched.slice(0, 4).map((a) => (
              <div key={a.symbol} className="flex items-center justify-between">
                <div>
                  <p style={{ color: T.text }} className="text-sm font-medium">{a.symbol}</p>
                  <p style={{ color: T.muted }} className="text-xs">{fmt(a.price)}</p>
                </div>
                <Delta value={a.change} T={T} />
              </div>
            ))}
            {watched.length === 0 && <p style={{ color: T.muted }} className="text-xs">No assets watched yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}


export { DashboardPage };
