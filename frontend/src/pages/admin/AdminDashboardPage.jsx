import React, { useState, useEffect } from "react";
import { api } from "../../services/api.js";
import { useApp } from "../../context/AppContext.jsx";
import { MOCK_DATA_SOURCES, MOCK_AUDIT_LOGS } from "../../constants/appData.js";
import { Card, StatCard, AssetTable } from "../../components/market.jsx";

function AdminDashboardPage({ T }) {
  const { assets, alerts, user } = useApp();
  const [stats, setStats] = useState({ totalUsers: 4, activeUsers: 3, activeAlerts: alerts.filter(a=>a.status==='active').length, totalAssets: assets.length });

  useEffect(() => {
    if (user && localStorage.getItem('marketboard_token')) {
      api.getAdminStats().then((res) => {
        if (res) setStats(res);
      }).catch((err) => console.warn("Admin stats fetch error:", err.message));
    }
  }, [user]);

  const onlineSources = MOCK_DATA_SOURCES.filter((s) => s.status === "online").length;
  return (
    <div className="p-6 space-y-6">
      <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold">System Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard T={T} label="Total Users" value={stats.totalUsers} sub={`${stats.activeUsers} active`} accent />
        <StatCard T={T} label="Active Alerts" value={stats.activeAlerts} />
        <StatCard T={T} label="Data Sources Online" value={`${onlineSources}/${MOCK_DATA_SOURCES.length}`} />
        <StatCard T={T} label="Assets Tracked" value={stats.totalAssets || assets.length} />
      </div>
      <Card T={T} className="p-5">
        <h2 style={{ color: T.text }} className="text-sm font-medium mb-3">Recent activity</h2>
        <div className="space-y-2">
          {MOCK_AUDIT_LOGS.slice(0, 4).map((l) => (
            <div key={l.id} style={{ borderColor: T.border }} className="flex items-center justify-between border-b last:border-0 pb-2 text-sm">
              <span style={{ color: T.text }}>{l.activity}</span>
              <span style={{ color: T.muted }} className="text-xs font-mono">{l.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export { AdminDashboardPage };
