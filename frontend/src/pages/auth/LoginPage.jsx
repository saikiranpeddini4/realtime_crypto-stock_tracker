import React, { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  LayoutDashboard, LineChart as LineChartIcon, Star, Bell, Briefcase, User,
  Settings, LogOut, Search, Moon, Sun, TrendingUp, TrendingDown, Plus, X,
  ShieldCheck, Users, Database, ScrollText, FileBarChart, ChevronRight,
  BellRing, Trash2, ArrowUpRight, ArrowDownRight, Wallet, ShoppingCart,
  Repeat, Check, Eye, EyeOff, TrendingUp as BrandIcon,
} from "lucide-react";
import { api } from "../../services/api.js";
import { useApp } from "../../context/AppContext.jsx";
import { fmt } from "../../utils/format.js";
import { Delta, Card, StatCard, MiniSpark, AssetTable } from "../../components/market.jsx";

function LoginPage({ T }) {
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (isRegister) {
      const normalizedName = name.trim();
      const normalizedEmail = email.trim();
      if (!normalizedName || !normalizedEmail || !password) {
        setError("Please fill in all fields.");
        setSubmitting(false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        setError("Enter a valid email address.");
        setSubmitting(false);
        return;
      }
      if (normalizedName.length > 80) {
        setError("Name must be 80 characters or fewer.");
        setSubmitting(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setSubmitting(false);
        return;
      }
      const res = await register(normalizedName, normalizedEmail, password);
      if (!res.ok) {
        setError(res.error);
      } else {
        setIsRegister(false);
        setPassword("");
        setSuccess("Account created. Sign in with your new credentials.");
      }
    } else {
      const normalizedEmail = email.trim();
      if (!normalizedEmail || !password) {
        setError("Please enter your email and password.");
        setSubmitting(false);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        setError("Enter a valid email address.");
        setSubmitting(false);
        return;
      }
      const res = await login(normalizedEmail, password);
      if (!res.ok) setError(res.error);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ background: T.base }} className="min-h-screen w-full flex items-center justify-center px-4">
      <Card T={T} className="w-full max-w-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <div style={{ background: T.accent }} className="w-9 h-9 rounded-md flex items-center justify-center text-black" aria-hidden="true">
            <BrandIcon size={19} strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: T.text }} className="text-lg font-semibold">
            Market<span style={{ color: T.accent }}>Board</span>
          </span>
        </div>
        <h1 style={{ color: T.text }} className="text-xl font-semibold mb-1">
          {isRegister ? "Create account" : "Sign in"}
        </h1>
        <p style={{ color: T.muted }} className="text-sm mb-6">
          {isRegister ? "Register to use the market simulator" : "Access your market dashboard"}
        </p>

        {error && (
          <div role="alert" style={{ background: T.downSoft, color: T.down, borderColor: T.down }} className="p-2.5 mb-4 rounded-lg text-xs border">
            {error}
          </div>
        )}
        {success && (
          <div role="status" aria-live="polite" style={{ background: T.accentSoft, color: T.accent, borderColor: T.accent }} className="p-2.5 mb-4 rounded-lg text-xs border">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label htmlFor="register-name" style={{ color: T.muted }} className="text-xs">Full Name</label>
              <input
                id="register-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Rao"
                autoComplete="name"
                maxLength={80}
                required
                style={{ background: T.elevated, color: T.text, borderColor: T.border }}
                className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none"
              />
            </div>
          )}

          <div>
            <label htmlFor="login-email" style={{ color: T.muted }} className="text-xs">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. ananya@mail.com"
              autoComplete="email"
              required
              style={{ background: T.elevated, color: T.text, borderColor: T.border }}
              className="w-full mt-1 px-3 py-2 rounded-lg text-sm border outline-none"
            />
          </div>

          <div>
            <label htmlFor="login-password" style={{ color: T.muted }} className="text-xs">Password</label>
            <div className="relative mt-1">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={isRegister ? 8 : undefined}
                required
                style={{ background: T.elevated, color: T.text, borderColor: T.border }}
                className="w-full px-3 py-2 pr-10 rounded-lg text-sm border outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                style={{ color: T.muted }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ background: T.accent }}
            className="w-full py-2.5 mt-2 rounded-lg font-medium text-black disabled:opacity-50"
          >
            {submitting ? "Processing..." : isRegister ? "Register" : "Enter dashboard"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); setSuccess(""); }}
            style={{ color: T.accent }}
            className="text-xs hover:underline"
          >
            {isRegister ? "Already have an account? Sign in" : "Need an account? Register here"}
          </button>
        </div>
      </Card>
    </div>
  );
}


export { LoginPage };
