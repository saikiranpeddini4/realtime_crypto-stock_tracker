import React, { useState, useEffect } from "react";
import { api } from "../../services/api.js";
import { useApp } from "../../context/AppContext.jsx";
import { MOCK_DATA_SOURCES, MOCK_AUDIT_LOGS } from "../../constants/appData.js";
import { Card, StatCard, AssetTable } from "../../components/market.jsx";

function AdminUsersPage({ T }) {
  const { user } = useApp();
  const [users, setUsers] = useState([
    { id: 1, name: "Ananya Rao", email: "ananya@mail.com", status: "active", role: "user" },
    { id: 2, name: "Devesh Kulkarni", email: "devesh@mail.com", status: "active", role: "user" },
    { id: 3, name: "Priya Menon", email: "priya@mail.com", status: "suspended", role: "user" },
    { id: 4, name: "Rahul Verma", email: "rahul@mail.com", status: "active", role: "user" },
  ]);

  useEffect(() => {
    if (user && localStorage.getItem('marketboard_token')) {
      api.getAdminUsers().then((res) => {
        if (Array.isArray(res)) setUsers(res.map(u => ({ ...u, id: u._id || u.id })));
      }).catch((err) => console.warn("Admin users fetch error:", err.message));
    }
  }, [user]);

  const toggleStatus = async (u) => {
    const newStatus = u.status === "active" ? "suspended" : "active";
    setUsers((us) => us.map((x) => x.id === u.id ? { ...x, status: newStatus } : x));

    if (user && localStorage.getItem('marketboard_token')) {
      try {
        await api.updateAdminUserStatus(u.id, newStatus);
      } catch (err) {
        console.warn("Toggle status API error:", err.message);
      }
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 style={{ color: T.text, fontFamily: "'Space Grotesk', sans-serif" }} className="text-2xl font-semibold">Users</h1>
      <Card T={T} className="p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: T.muted, borderColor: T.border }} className="border-b text-left text-xs uppercase">
              <th className="py-2.5 pr-3">Name</th><th className="py-2.5 pr-3">Email</th>
              <th className="py-2.5 pr-3">Status</th><th className="py-2.5 pr-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderColor: T.border }} className="border-b last:border-0">
                <td style={{ color: T.text }} className="py-3 pr-3">{u.name}</td>
                <td style={{ color: T.muted }} className="py-3 pr-3">{u.email}</td>
                <td className="py-3 pr-3">
                  <span
                    style={{ color: u.status === "active" ? T.up : T.down, background: u.status === "active" ? T.upSoft : T.downSoft }}
                    className="text-xs px-2 py-1 rounded-md capitalize"
                  >
                    {u.status}
                  </span>
                </td>
                <td className="py-3 pr-3 text-right">
                  <button
                    onClick={() => toggleStatus(u)}
                    style={{ color: T.accent }}
                    className="text-xs"
                  >
                    {u.status === "active" ? "Suspend" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export { AdminUsersPage };
