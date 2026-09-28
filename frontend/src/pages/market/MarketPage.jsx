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

function MarketPage({ T, search, setSelectedAsset }) {
  const { assets, watchlist, setWatchlist, user } = useApp();
  const [tab, setTab] = useState("all");
  const tabs = [
    { id: "all", label: "All" },
    { id: "stock", label: "Stocks" },
    { id: "crypto", label: "Crypto" },
    { id: "currency", label: "Currency" },
  ];
  const filtered = assets.filter(
    (a) =>
      (tab === "all" || a.type === tab) &&
      (a.symbol.toLowerCase().includes(search.toLowerCase()) || a.name.toLowerCase().includes(search.toLowerCase()))
  );
  
  const toggleWatch = async (symbol) => {
    const isWatched = watchlist.includes(symbol);
    setWatchlist((w) => (isWatched ? w.filter((s) => s !== symbol) : [...w, symbol]));
    if (user && localStorage.getItem('marketboard_token')) {
      const asset = assets.find((a) => a.symbol === symbol);
      if (asset) {
        try {
          if (isWatched) {
            await api.removeFromWatchlist(asset._id || symbol);
          } else {
            await api.addToWatchlist(asset._id || symbol);
          }
        } catch (err) {
          console.warn("Watchlist API error:", err.message);
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold">Market</h1>
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              background: tab === t.id ? T.accentSoft : T.elevated,
              color: tab === t.id ? T.accent : T.muted,
            }}
            className="px-3 py-1.5 rounded-lg text-sm"
          >
            {t.label}
          </button>
        ))}
      </div>
      <Card T={T} className="p-5">
        <AssetTable T={T} assets={filtered} onSelect={setSelectedAsset} onToggleWatch={toggleWatch} watchlist={watchlist} />
      </Card>
    </div>
  );
}


export { MarketPage };
