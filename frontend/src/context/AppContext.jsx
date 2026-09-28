import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { api } from "../services/api.js";
import { buildInitialAssets, genHistory } from "../constants/appData.js";
import { fmt } from "../utils/format.js";

const AppCtx = createContext(null);

export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [user, setUser] = useState(null); // { id, name, email, role, cashBalance, token }
  const [assets, setAssets] = useState(buildInitialAssets);
  const [watchlist, setWatchlist] = useState(["BTC", "AAPL", "EUR/USD"]);
  const [alerts, setAlerts] = useState([
    { id: 1, symbol: "BTC", condition: "above", target: 115000, status: "active" },
    { id: 2, symbol: "AAPL", condition: "below", target: 225, status: "active" },
  ]);
  const [portfolio, setPortfolio] = useState([
    { id: 1, symbol: "BTC", qty: 0.4, buyPrice: 98000 },
    { id: 2, symbol: "AAPL", qty: 25, buyPrice: 210 },
  ]);
  const [notifications, setNotifications] = useState([
    { id: 1, msg: "Welcome to your market dashboard.", read: true, time: "Yesterday" },
  ]);
  const [cash, setCash] = useState(50000);
  const [loading, setLoading] = useState(true);

  const assetsRef = useRef(assets);
  assetsRef.current = assets;

  // Auto-login on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('marketboard_token');
      if (token) {
        try {
          const u = await api.getMe();
          setUser(u);
        } catch (err) {
          console.warn("Session expired or backend unavailable:", err.message);
          localStorage.removeItem('marketboard_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Fetch initial assets from backend
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const data = await api.getAssets();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((a) => {
            const hist = a.history && a.history.length > 0
              ? a.history.map((h, i) => ({ t: i, price: h.price }))
              : genHistory(a.price, 30);
            return {
              ...a,
              type: a.type === 'forex' ? 'currency' : a.type,
              history: hist,
            };
          });
          setAssets(formatted);
        }
      } catch (err) {
        console.warn("Using local assets fallback:", err.message);
      }
    };
    fetchAssets();
  }, []);

  // Sync user state from backend when authenticated
  useEffect(() => {
    if (!user || !localStorage.getItem('marketboard_token')) return;

    const syncUserData = async () => {
      try {
        // Portfolio
        const pData = await api.getPortfolio();
        if (pData && pData.holdings) {
          const formattedHoldings = pData.holdings.map((h, idx) => ({
            id: h._id || idx,
            assetId: h.asset?._id || h.asset,
            symbol: h.asset?.symbol || "UNKNOWN",
            qty: h.quantity,
            buyPrice: h.averageBuyPrice,
          }));
          setPortfolio(formattedHoldings);
        }

        // Watchlist
        const wData = await api.getWatchlist();
        if (wData && wData.assets) {
          const symbols = wData.assets.map((a) => (typeof a === 'object' ? a.symbol : a));
          setWatchlist(symbols);
        }

        // Alerts
        const aData = await api.getAlerts();
        if (Array.isArray(aData)) {
          const formattedAlerts = aData.map((al) => ({
            id: al._id || al.id,
            symbol: al.asset?.symbol || al.symbol,
            condition: al.condition,
            target: al.target,
            status: al.status,
          }));
          setAlerts(formattedAlerts);
        }

        // Notifications
        const nData = await api.getNotifications();
        if (Array.isArray(nData)) {
          const formattedNotifs = nData.map((n) => ({
            id: n._id || n.id,
            msg: n.message,
            read: n.read,
            time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setNotifications(formattedNotifs);
        }

        // Wallet / Cash
        const wlt = await api.getWallet();
        if (wlt && wlt.cashBalance !== undefined) {
          setCash(wlt.cashBalance);
        }
      } catch (err) {
        console.warn("Backend sync error:", err.message);
      }
    };

    syncUserData();
  }, [user]);

  // Auth helper methods
  const login = async (email, password) => {
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('marketboard_token', data.token);
      setUser(data);
      if (data.cashBalance !== undefined) setCash(data.cashBalance);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.register({ name, email, password });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('marketboard_token');
    setUser(null);
  };

  // Buy: deducts cash, adds to holding using a weighted-average buy price
  const buyAsset = async (symbol, qty) => {
    const asset = assetsRef.current.find((a) => a.symbol === symbol);
    if (!asset || qty <= 0) return { ok: false, error: "Invalid quantity." };
    const cost = asset.price * qty;
    if (cost > cash) return { ok: false, error: "Not enough cash balance." };

    // Try backend call if authenticated
    if (user && localStorage.getItem('marketboard_token')) {
      try {
        const res = await api.createOrder({ symbol, side: 'buy', quantity: qty });
        if (res.cashBalance !== undefined) setCash(res.cashBalance);

        // Refetch portfolio
        const pData = await api.getPortfolio();
        if (pData && pData.holdings) {
          const formattedHoldings = pData.holdings.map((h, idx) => ({
            id: h._id || idx,
            assetId: h.asset?._id || h.asset,
            symbol: h.asset?.symbol || "UNKNOWN",
            qty: h.quantity,
            buyPrice: h.averageBuyPrice,
          }));
          setPortfolio(formattedHoldings);
        }
        setNotifications((n) => [{ id: Date.now(), msg: `Bought ${qty} ${symbol} at $${fmt(asset.price)}.`, read: false, time: "Just now" }, ...n]);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message || "Order execution failed." };
      }
    }

    // Local state fallback for offline preview
    setCash((c) => +(c - cost).toFixed(2));
    setPortfolio((prev) => {
      const existing = prev.find((h) => h.symbol === symbol);
      if (existing) {
        const totalQty = existing.qty + qty;
        const avgPrice = (existing.buyPrice * existing.qty + cost) / totalQty;
        return prev.map((h) => (h.symbol === symbol ? { ...h, qty: totalQty, buyPrice: avgPrice } : h));
      }
      return [...prev, { id: Date.now(), symbol, qty, buyPrice: asset.price }];
    });
    setNotifications((n) => [{ id: Date.now(), msg: `Bought ${qty} ${symbol} at $${fmt(asset.price)}.`, read: false, time: "Just now" }, ...n]);
    return { ok: true };
  };

  // Sell: adds cash, reduces or removes holding
  const sellAsset = async (symbol, qty) => {
    const asset = assetsRef.current.find((a) => a.symbol === symbol);
    const holding = portfolio.find((h) => h.symbol === symbol);
    if (!asset || !holding || qty <= 0) return { ok: false, error: "Invalid quantity." };
    if (qty > holding.qty) return { ok: false, error: "You don't own that much." };

    if (user && localStorage.getItem('marketboard_token')) {
      try {
        const res = await api.createOrder({ symbol, side: 'sell', quantity: qty });
        if (res.cashBalance !== undefined) setCash(res.cashBalance);

        // Refetch portfolio
        const pData = await api.getPortfolio();
        if (pData && pData.holdings) {
          const formattedHoldings = pData.holdings.map((h, idx) => ({
            id: h._id || idx,
            assetId: h.asset?._id || h.asset,
            symbol: h.asset?.symbol || "UNKNOWN",
            qty: h.quantity,
            buyPrice: h.averageBuyPrice,
          }));
          setPortfolio(formattedHoldings);
        }
        setNotifications((n) => [{ id: Date.now(), msg: `Sold ${qty} ${symbol} at $${fmt(asset.price)}.`, read: false, time: "Just now" }, ...n]);
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message || "Order execution failed." };
      }
    }

    // Local state fallback for offline preview
    const proceeds = asset.price * qty;
    setCash((c) => +(c + proceeds).toFixed(2));
    setPortfolio((prev) =>
      prev
        .map((h) => (h.symbol === symbol ? { ...h, qty: h.qty - qty } : h))
        .filter((h) => h.qty > 0.00001)
    );
    setNotifications((n) => [{ id: Date.now(), msg: `Sold ${qty} ${symbol} at $${fmt(asset.price)}.`, read: false, time: "Just now" }, ...n]);
    return { ok: true };
  };

  // Simulated real-time ticker drift
  useEffect(() => {
    const id = setInterval(() => {
      setAssets((prev) =>
        prev.map((a) => {
          const drift = (Math.random() - 0.5) * 0.015;
          const newPrice = +(a.price * (1 + drift)).toFixed(a.price < 5 ? 4 : 2);
          const change = +(a.change + drift * 100).toFixed(2);
          const history = [...a.history.slice(1), { t: a.history[a.history.length - 1].t + 1, price: newPrice }];
          return { ...a, price: newPrice, change: Math.max(-40, Math.min(40, change)), history };
        })
      );
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // Alert-condition checker
  useEffect(() => {
    const id = setInterval(() => {
      setAlerts((prevAlerts) => {
        let fired = [];
        const updated = prevAlerts.map((al) => {
          if (al.status !== "active") return al;
          const asset = assetsRef.current.find((a) => a.symbol === al.symbol);
          if (!asset) return al;
          const hit =
            (al.condition === "above" && asset.price >= al.target) ||
            (al.condition === "below" && asset.price <= al.target);
          if (hit) {
            fired.push(`${al.symbol} is now ${al.condition} ${al.target} (current: ${asset.price})`);
            return { ...al, status: "triggered" };
          }
          return al;
        });
        if (fired.length) {
          setNotifications((n) => [
            ...fired.map((msg, i) => ({ id: Date.now() + i, msg, read: false, time: "Just now" })),
            ...n,
          ]);
        }
        return updated;
      });
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const value = {
    theme, setTheme,
    user, setUser, login, register, logout, loading,
    assets,
    watchlist, setWatchlist,
    alerts, setAlerts,
    portfolio, setPortfolio,
    notifications, setNotifications,
    cash, setCash, buyAsset, sellAsset,
  };
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

