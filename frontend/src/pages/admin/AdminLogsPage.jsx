import React, { useState, useEffect } from "react";
import { api } from "../../services/api.js";
import { useApp } from "../../context/AppContext.jsx";
import { MOCK_DATA_SOURCES, MOCK_AUDIT_LOGS } from "../../constants/appData.js";
import { Card, StatCard, AssetTable } from "../../components/market.jsx";

function AdminLogsPage({ T }) {
  return (
    <div className="p-6 space-y-4">
      <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold">Audit Logs</h1>
      <Card T={T} className="p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: T.muted, borderColor: T.border }} className="border-b text-left text-xs uppercase">
              <th className="py-2.5 pr-3">User</th><th className="py-2.5 pr-3">Activity</th><th className="py-2.5 pr-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_AUDIT_LOGS.map((l) => (
              <tr key={l.id} style={{ borderColor: T.border }} className="border-b last:border-0">
                <td style={{ color: T.text }} className="py-3 pr-3 font-mono text-xs">{l.user}</td>
                <td style={{ color: T.text }} className="py-3 pr-3">{l.activity}</td>
                <td style={{ color: T.muted }} className="py-3 pr-3 font-mono text-xs">{l.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export { AdminLogsPage };
