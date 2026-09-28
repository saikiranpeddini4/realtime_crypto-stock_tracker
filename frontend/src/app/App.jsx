import React, { useMemo, useState } from "react";
import { fontImport, THEMES } from "../constants/appData.js";
import { AppProvider, useApp } from "../context/AppContext.jsx";
import { TickerTape, Sidebar, Topbar } from "../components/market.jsx";
import { LoginPage } from "../pages/auth/LoginPage.jsx";
import { DashboardPage } from "../pages/dashboard/DashboardPage.jsx";
import { MarketPage } from "../pages/market/MarketPage.jsx";
import { AssetDetail } from "../pages/trading/AssetDialogs.jsx";
import { WatchlistPage } from "../pages/watchlist/WatchlistPage.jsx";
import { AlertsPage } from "../pages/alerts/AlertsPage.jsx";
import { PortfolioPage } from "../pages/portfolio/PortfolioPage.jsx";
import { NotificationsPage } from "../pages/notifications/NotificationsPage.jsx";
import { ProfilePage } from "../pages/profile/ProfilePage.jsx";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage.jsx";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage.jsx";
import { AdminSourcesPage } from "../pages/admin/AdminSourcesPage.jsx";
import { AdminLogsPage } from "../pages/admin/AdminLogsPage.jsx";
import { AdminReportsPage } from "../pages/admin/AdminReportsPage.jsx";

function Shell() {
  const { user, theme, assets } = useApp();
  const T = THEMES[theme];
  const [page, setPage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAssetRaw] = useState(null);

  const selectedAsset2 = useMemo(
    () => (selectedAsset ? assets.find((a) => a.symbol === selectedAsset.symbol) : null),
    [assets, selectedAsset]
  );

  if (!user) return <LoginPage T={T} />;

  return (
    <div style={{ background: T.base }} className="w-full h-screen flex flex-col overflow-hidden">
      <style>{fontImport}</style>
      <TickerTape T={T} />
      <div className="flex flex-1 min-h-0">
        <Sidebar T={T} page={page} setPage={setPage} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar T={T} search={search} setSearch={setSearch} setPage={setPage} />
          <div className="flex-1 overflow-y-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
            {page === "dashboard" && <DashboardPage T={T} setPage={setPage} setSelectedAsset={setSelectedAssetRaw} />}
            {page === "market" && <MarketPage T={T} search={search} setSelectedAsset={setSelectedAssetRaw} />}
            {page === "watchlist" && <WatchlistPage T={T} setSelectedAsset={setSelectedAssetRaw} />}
            {page === "alerts" && <AlertsPage T={T} />}
            {page === "portfolio" && <PortfolioPage T={T} />}
            {page === "notifications" && <NotificationsPage T={T} />}
            {page === "profile" && <ProfilePage T={T} />}
            {page === "admin-dashboard" && <AdminDashboardPage T={T} />}
            {page === "admin-users" && <AdminUsersPage T={T} />}
            {page === "admin-sources" && <AdminSourcesPage T={T} />}
            {page === "admin-logs" && <AdminLogsPage T={T} />}
            {page === "admin-reports" && <AdminReportsPage T={T} />}
          </div>
        </div>
      </div>
      {selectedAsset2 && <AssetDetail T={T} asset={selectedAsset2} onClose={() => setSelectedAssetRaw(null)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

