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

function PortfolioPage({ T }) {
  const { portfolio, assets, cash } = useApp();
  const [trade, setTrade] = useState(null); // { asset, mode }
  const [pickerOpen, setPickerOpen] = useState(false);

  const rows = portfolio.map((h) => {
    const asset = assets.find((a) => a.symbol === h.symbol);
    const value = asset ? asset.price * h.qty : 0;
    const cost = h.buyPrice * h.qty;
    return { ...h, asset, current: asset?.price ?? 0, value, pl: value - cost, plPct: cost ? (value - cost) / cost * 100 : 0 };
  });
  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const totalPL = rows.reduce((s, r) => s + r.pl, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold">Portfolio</h1>
        <button onClick={() => setPickerOpen(true)} style={{ background: T.accent }} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-black">
          <Plus size={15} /> Buy an asset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard T={T} label="Cash Balance" value={`$${fmt(cash)}`} />
        <StatCard T={T} label="Holdings Value" value={`$${fmt(totalValue)}`} accent />
        <StatCard T={T} label="Total P/L" value={`${totalPL >= 0 ? "+" : ""}$${fmt(totalPL)}`} sub={totalPL >= 0 ? "In profit" : "At a loss"} />
      </div>

      {pickerOpen && (
        <Card T={T} className="p-4">
          <p style={{ color: T.muted }} className="text-xs mb-2">Pick an asset to buy</p>
          <div className="flex flex-wrap gap-2">
            {assets.map((a) => (
              <button
                key={a.symbol}
                onClick={() => { setTrade({ asset: a, mode: "buy" }); setPickerOpen(false); }}
                style={{ background: T.elevated, color: T.text, borderColor: T.border }}
                className="border px-3 py-1.5 rounded-lg text-xs"
              >
                {a.symbol}
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card T={T} className="p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: T.muted, borderColor: T.border }} className="border-b text-left text-xs uppercase">
              <th className="py-2.5 pr-3">Asset</th><th className="py-2.5 pr-3">Qty</th>
              <th className="py-2.5 pr-3">Avg. Buy</th><th className="py-2.5 pr-3">Current</th>
              <th className="py-2.5 pr-3">Value</th><th className="py-2.5 pr-3">P/L</th><th className="py-2.5 pr-3 text-right">Trade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderColor: T.border }} className="border-b last:border-0">
                <td style={{ color: T.text }} className="py-3 pr-3 font-medium">{r.symbol}</td>
                <td style={{ color: T.text }} className="py-3 pr-3 font-mono">{r.qty}</td>
                <td style={{ color: T.text }} className="py-3 pr-3 font-mono">{fmt(r.buyPrice)}</td>
                <td style={{ color: T.text }} className="py-3 pr-3 font-mono">{fmt(r.current)}</td>
                <td style={{ color: T.text }} className="py-3 pr-3 font-mono">${fmt(r.value)}</td>
                <td className="py-3 pr-3"><Delta value={r.plPct} T={T} /></td>
                <td className="py-3 pr-3 text-right whitespace-nowrap">
                  <button onClick={() => setTrade({ asset: r.asset, mode: "buy" })} style={{ color: T.accent }} className="text-xs mr-3">Buy</button>
                  <button onClick={() => setTrade({ asset: r.asset, mode: "sell" })} style={{ color: T.down }} className="text-xs">Sell</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} style={{ color: T.muted }} className="py-6 text-center">No holdings yet â€” buy your first asset above.</td></tr>}
          </tbody>
        </table>
      </Card>

      {trade && <BuySellModal T={T} asset={trade.asset} mode={trade.mode} onClose={() => setTrade(null)} />}
    </div>
  );
}


export { PortfolioPage };
