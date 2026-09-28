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

function BuySellModal({ T, asset, mode, onClose }) {
  const { cash, portfolio, buyAsset, sellAsset } = useApp();
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const holding = portfolio.find((h) => h.symbol === asset.symbol);
  const ownedQty = holding?.qty ?? 0;
  const qtyNum = parseFloat(qty) || 0;
  const estTotal = qtyNum * asset.price;

  const submit = async () => {
    setSubmitting(true);
    setError("");
    const result = mode === "buy" ? await buyAsset(asset.symbol, qtyNum) : await sellAsset(asset.symbol, qtyNum);
    setSubmitting(false);
    if (!result.ok) { setError(result.error); return; }
    setSuccess(true);
    setTimeout(onClose, 900);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: T.surface, borderColor: T.border }}
        className="w-full max-w-sm border rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div style={{ background: mode === "buy" ? T.upSoft : T.downSoft, color: mode === "buy" ? T.up : T.down }} className="w-8 h-8 rounded-lg flex items-center justify-center">
              {mode === "buy" ? <ShoppingCart size={15} /> : <Wallet size={15} />}
            </div>
            <div>
              <p style={{ color: T.text }} className="font-medium text-sm capitalize">{mode} {asset.symbol}</p>
              <p style={{ color: T.muted }} className="text-xs">Market price {fmt(asset.price)}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: T.muted }}><X size={18} /></button>
        </div>

        {success ? (
          <div className="py-6 flex flex-col items-center gap-2">
            <div style={{ background: T.upSoft, color: T.up }} className="w-10 h-10 rounded-full flex items-center justify-center"><Check size={18} /></div>
            <p style={{ color: T.text }} className="text-sm">Order filled.</p>
          </div>
        ) : (
          <>
            <div style={{ background: T.elevated, borderColor: T.border }} className="border rounded-lg p-3 mb-3 flex items-center justify-between text-xs">
              <span style={{ color: T.muted }}>Cash available</span>
              <span style={{ color: T.text }} className="font-mono">${fmt(cash)}</span>
            </div>
            {mode === "sell" && (
              <div style={{ background: T.elevated, borderColor: T.border }} className="border rounded-lg p-3 mb-3 flex items-center justify-between text-xs">
                <span style={{ color: T.muted }}>You own</span>
                <span style={{ color: T.text }} className="font-mono">{ownedQty} {asset.symbol}</span>
              </div>
            )}
            <label style={{ color: T.muted }} className="text-xs">Quantity</label>
            <input
              value={qty}
              onChange={(e) => { setQty(e.target.value); setError(""); }}
              placeholder="0.00"
              style={{ background: T.elevated, color: T.text, borderColor: T.border }}
              className="w-full mt-1 mb-2 px-3 py-2 rounded-lg text-sm border outline-none font-mono"
            />
            {mode === "sell" && ownedQty > 0 && (
              <button onClick={() => setQty(String(ownedQty))} style={{ color: T.accent }} className="text-xs mb-2">Sell all ({ownedQty})</button>
            )}
            <div className="flex items-center justify-between text-xs mb-4">
              <span style={{ color: T.muted }}>Estimated {mode === "buy" ? "cost" : "proceeds"}</span>
              <span style={{ color: T.text }} className="font-mono">${fmt(estTotal || 0)}</span>
            </div>
            {error && <p style={{ color: T.down }} className="text-xs mb-3">{error}</p>}
            <button
              onClick={submit}
              disabled={!qtyNum || submitting}
              style={{ background: mode === "buy" ? T.accent : T.elevated, color: mode === "buy" ? "#000" : T.text, borderColor: T.border }}
              className="w-full py-2.5 rounded-lg text-sm font-medium border disabled:opacity-50"
            >
              {submitting ? "Executing..." : mode === "buy" ? `Buy ${asset.symbol}` : `Sell ${asset.symbol}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ASSET DETAIL (modal/drawer)
--------------------------------------------------------- */
function AssetDetail({ T, asset, onClose }) {
  const { watchlist, setWatchlist, alerts, setAlerts, portfolio, user } = useApp();
  const [range, setRange] = useState("1D");
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [condition, setCondition] = useState("above");
  const [target, setTarget] = useState("");
  const [tradeMode, setTradeMode] = useState(null); // "buy" | "sell" | null

  if (!asset) return null;
  const isWatched = watchlist.includes(asset.symbol);
  const owned = portfolio.find((h) => h.symbol === asset.symbol)?.qty ?? 0;

  const createAlert = async () => {
    if (!target) return;
    const newAlert = { id: Date.now(), symbol: asset.symbol, condition, target: parseFloat(target), status: "active" };
    setAlerts((a) => [...a, newAlert]);

    if (user && localStorage.getItem('marketboard_token')) {
      try {
        await api.createAlert({
          assetId: asset._id || asset.symbol,
          symbol: asset.symbol,
          condition,
          target: parseFloat(target),
        });
      } catch (err) {
        console.warn("Alert API error:", err.message);
      }
    }

    setShowAlertForm(false);
    setTarget("");
  };

  const toggleWatch = async () => {
    setWatchlist((w) => (isWatched ? w.filter((s) => s !== asset.symbol) : [...w, asset.symbol]));
    if (user && localStorage.getItem('marketboard_token')) {
      try {
        if (isWatched) {
          await api.removeFromWatchlist(asset._id || asset.symbol);
        } else {
          await api.addToWatchlist(asset._id || asset.symbol);
        }
      } catch (err) {
        console.warn("Watchlist API error:", err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: T.surface, borderColor: T.border }}
        className="w-full max-w-md h-full border-l overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 style={{ color: T.text }} className="text-xl font-semibold">{asset.symbol}</h2>
            <p style={{ color: T.muted }} className="text-sm">{asset.name}</p>
          </div>
          <button onClick={onClose} style={{ color: T.muted }}><X size={20} /></button>
        </div>

        <div className="flex items-end gap-3 mb-4">
          <span style={{ color: T.text, fontFamily: "'IBM Plex Mono', monospace" }} className="text-3xl font-semibold">
            {fmt(asset.price)}
          </span>
          <Delta value={asset.change} T={T} />
        </div>

        <div className="flex gap-2 mb-3">
          {["1D", "7D", "1M", "1Y"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{ background: range === r ? T.accentSoft : T.elevated, color: range === r ? T.accent : T.muted }}
              className="px-2.5 py-1 rounded-md text-xs"
            >
              {r}
            </button>
          ))}
        </div>

        <div style={{ height: 200 }} className="mb-5">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={asset.history}>
              <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
              <XAxis dataKey="t" hide />
              <YAxis domain={["auto", "auto"]} tick={{ fill: T.muted, fontSize: 10 }} width={50} />
              <Tooltip
                contentStyle={{ background: T.elevated, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }}
                labelStyle={{ display: "none" }}
              />
              <Line type="monotone" dataKey="price" stroke={asset.change >= 0 ? T.up : T.down} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {owned > 0 && (
          <p style={{ color: T.muted }} className="text-xs mb-2">You currently hold <span style={{ color: T.text }}>{owned} {asset.symbol}</span>.</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => setTradeMode("buy")}
            style={{ background: T.accent }}
            className="py-2.5 rounded-lg text-sm font-medium text-black flex items-center justify-center gap-2"
          >
            <ShoppingCart size={14} /> Buy
          </button>
          <button
            onClick={() => setTradeMode("sell")}
            disabled={owned <= 0}
            style={{ background: T.elevated, color: T.text, borderColor: T.border }}
            className="border py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Wallet size={14} /> Sell
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={toggleWatch}
            style={{ background: isWatched ? T.accentSoft : T.elevated, color: isWatched ? T.accent : T.text, borderColor: T.border }}
            className="border py-2 rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <Star size={14} fill={isWatched ? T.accent : "none"} /> {isWatched ? "Watching" : "Add to Watchlist"}
          </button>
          <button
            onClick={() => setShowAlertForm((s) => !s)}
            style={{ background: T.elevated, color: T.text, borderColor: T.border }}
            className="border py-2 rounded-lg text-sm flex items-center justify-center gap-2"
          >
            <Bell size={14} /> Set Alert
          </button>
        </div>

        {tradeMode && <BuySellModal T={T} asset={asset} mode={tradeMode} onClose={() => setTradeMode(null)} />}

        {showAlertForm && (
          <Card T={T} className="p-4 mb-5 space-y-3">
            <div className="flex gap-2">
              {["above", "below"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  style={{ background: condition === c ? T.accentSoft : T.elevated, color: condition === c ? T.accent : T.muted }}
                  className="px-3 py-1.5 rounded-md text-xs capitalize"
                >
                  Price goes {c}
                </button>
              ))}
            </div>
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={`Target price (e.g. ${fmt(asset.price)})`}
              style={{ background: T.base, color: T.text, borderColor: T.border }}
              className="w-full px-3 py-2 rounded-lg text-sm border outline-none"
            />
            <button onClick={createAlert} style={{ background: T.accent }} className="w-full py-2 rounded-lg text-sm font-medium text-black">
              Create alert
            </button>
          </Card>
        )}

        <div>
          <h3 style={{ color: T.text }} className="text-sm font-medium mb-2">Stats</h3>
          <div style={{ color: T.muted }} className="grid grid-cols-2 gap-y-2 text-xs">
            <span>Type</span><span style={{ color: T.text }} className="text-right capitalize">{asset.type}</span>
            {asset.exchange && (<><span>Exchange</span><span style={{ color: T.text }} className="text-right">{asset.exchange}</span></>)}
            {asset.cap && (<><span>Market Cap</span><span style={{ color: T.text }} className="text-right">${asset.cap}</span></>)}
            {asset.base && (<><span>Pair</span><span style={{ color: T.text }} className="text-right">{asset.base}/{asset.target}</span></>)}
          </div>
        </div>
      </div>
    </div>
  );
}


export { BuySellModal, AssetDetail };
