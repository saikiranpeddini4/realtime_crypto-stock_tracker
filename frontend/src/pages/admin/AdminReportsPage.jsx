import React, { useState, useEffect } from "react";
import { api } from "../../services/api.js";
import { useApp } from "../../context/AppContext.jsx";
import { MOCK_DATA_SOURCES, MOCK_AUDIT_LOGS } from "../../constants/appData.js";
import { Card, StatCard, AssetTable } from "../../components/market.jsx";

function AdminReportsPage({ T }) {
  const { assets } = useApp();
  const [type, setType] = useState("market-summary");
  const [generated, setGenerated] = useState(false);
  return (
    <div className="p-6 space-y-4">
      <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold">Reports</h1>
      <Card T={T} className="p-5 space-y-4">
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label style={{ color: T.muted }} className="text-xs">Report type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={{ background: T.elevated, color: T.text, borderColor: T.border }} className="block mt-1 px-3 py-2 rounded-lg text-sm border">
              <option value="market-summary">Market Summary</option>
              <option value="user-activity">User Activity</option>
              <option value="alert-history">Alert History</option>
            </select>
          </div>
          <button onClick={() => setGenerated(true)} style={{ background: T.accent }} className="px-4 py-2 rounded-lg text-sm font-medium text-black">
            Generate report
          </button>
        </div>
        {generated && (
          <div style={{ borderColor: T.border }} className="border-t pt-4">
            {type === "market-summary" && (
              <AssetTable T={T} assets={assets.slice(0, 8)} onSelect={() => {}} onToggleWatch={() => {}} watchlist={[]} />
            )}
            {type === "user-activity" && (
              <ul style={{ color: T.text }} className="text-sm space-y-1">
                <li>Ananya Rao â€” active</li>
                <li>Devesh Kulkarni â€” active</li>
                <li>Admin User â€” active</li>
              </ul>
            )}
            {type === "alert-history" && (
              <p style={{ color: T.muted }} className="text-sm">System price alerts monitored via MongoDB.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

export { AdminReportsPage };
