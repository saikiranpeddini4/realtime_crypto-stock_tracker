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

function WatchlistPage({ T, setSelectedAsset }) {
  const { assets, watchlist, setWatchlist, user } = useApp();
  const watched = assets.filter((a) => watchlist.includes(a.symbol));

  const toggleWatch = async (sym) => {
    setWatchlist((w) => w.filter((s) => s !== sym));
    if (user && localStorage.getItem('marketboard_token')) {
      const asset = assets.find((a) => a.symbol === sym);
      if (asset) {
        try {
          await api.removeFromWatchlist(asset._id || sym);
        } catch (err) {
          console.warn("Watchlist API error:", err.message);
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold">Watchlist</h1>
      <Card T={T} className="p-5">
        {watched.length === 0 ? (
          <p style={{ color: T.muted }} className="text-sm py-6 text-center">
            Nothing here yet â€” star an asset from the Market page to track it.
          </p>
        ) : (
          <AssetTable
            T={T} assets={watched} onSelect={setSelectedAsset}
            onToggleWatch={toggleWatch}
            watchlist={watchlist}
          />
        )}
      </Card>
    </div>
  );
}


export { WatchlistPage };
