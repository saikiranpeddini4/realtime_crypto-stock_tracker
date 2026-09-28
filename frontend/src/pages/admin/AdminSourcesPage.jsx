import React, { useState, useEffect } from "react";
import { api } from "../../services/api.js";
import { useApp } from "../../context/AppContext.jsx";
import { MOCK_DATA_SOURCES, MOCK_AUDIT_LOGS } from "../../constants/appData.js";
import { Card, StatCard, AssetTable } from "../../components/market.jsx";

function AdminSourcesPage({ T }) {
  return (
    <div className="p-6 space-y-4">
      <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold">Data Sources</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {MOCK_DATA_SOURCES.map((s) => (
          <Card T={T} key={s.id} className="p-4 flex items-center justify-between">
            <div>
              <p style={{ color: T.text }} className="text-sm font-medium">{s.name}</p>
              <p style={{ color: T.muted }} className="text-xs mt-1">Updated {s.lastUpdated}</p>
            </div>
            <span
              style={{
                color: s.status === "online" ? T.up : T.down,
                background: s.status === "online" ? T.upSoft : T.downSoft,
              }}
              className="text-xs px-2 py-1 rounded-md capitalize"
            >
              {s.status}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}

export { AdminSourcesPage };
