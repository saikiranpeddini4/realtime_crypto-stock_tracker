/* ---------------------------------------------------------
   DESIGN TOKENS
   Ticker-board palette: deep charcoal-teal base, brass/gold
   accent (nod to old exchange ticker boards), mono numerals
   for price data, grotesk for UI.
--------------------------------------------------------- */
export const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

export const THEMES = {
  dark: {
    base: "#0B1210", surface: "#121C19", elevated: "#1A2622", elevatedHover: "#213029",
    border: "#25332E", text: "#EDEAE2", muted: "#8B9A94", accent: "#D4A857",
    accentSoft: "#3A3122", up: "#3FBF7F", down: "#E5566B", upSoft: "#173325", downSoft: "#341A20",
  },
  light: {
    base: "#F6F5F1", surface: "#FFFFFF", elevated: "#F0EEE7", elevatedHover: "#E8E5DB",
    border: "#DEDACD", text: "#1B2320", muted: "#66756F", accent: "#A87B2C",
    accentSoft: "#F1E4C8", up: "#1F8F52", down: "#C43A4E", upSoft: "#E3F3E9", downSoft: "#FBE6E9",
  },
};

/* ---------------------------------------------------------
   FALLBACK / MOCK DATA FOR SIMULATION & INITIAL STATE
--------------------------------------------------------- */
export function genHistory(base, points = 30, vol = 0.02) {
  let p = base;
  const out = [];
  for (let i = 0; i < points; i++) {
    p = p * (1 + (Math.random() - 0.5) * vol);
    out.push({ t: i, price: +p.toFixed(2) });
  }
  return out;
}

export const SEED_ASSETS = [
  { symbol: "AAPL", name: "Apple Inc.", type: "stock", price: 231.4, exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corp.", type: "stock", price: 512.8, exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", type: "stock", price: 342.1, exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corp.", type: "stock", price: 178.6, exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com Inc.", type: "stock", price: 228.9, exchange: "NASDAQ" },
  { symbol: "JPM", name: "JPMorgan Chase", type: "stock", price: 289.3, exchange: "NYSE" },
  { symbol: "BTC", name: "Bitcoin", type: "crypto", price: 112400, cap: "2.22T" },
  { symbol: "ETH", name: "Ethereum", type: "crypto", price: 4260, cap: "513B" },
  { symbol: "SOL", name: "Solana", type: "crypto", price: 198.5, cap: "107B" },
  { symbol: "BNB", name: "BNB", type: "crypto", price: 712, cap: "103B" },
  { symbol: "XRP", name: "XRP", type: "crypto", price: 2.41, cap: "140B" },
  { symbol: "ADA", name: "Cardano", type: "crypto", price: 0.87, cap: "31B" },
  { symbol: "EUR/USD", name: "Euro / US Dollar", type: "currency", price: 1.0842, base: "EUR", target: "USD" },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", type: "currency", price: 1.2735, base: "GBP", target: "USD" },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", type: "currency", price: 152.18, base: "USD", target: "JPY" },
  { symbol: "USD/INR", name: "US Dollar / Indian Rupee", type: "currency", price: 87.42, base: "USD", target: "INR" },
];

export function buildInitialAssets() {
  return SEED_ASSETS.map((a) => {
    const history = genHistory(a.price, 30);
    const prev = history[0].price;
    const last = history[history.length - 1].price;
    return { ...a, price: last, change: +(((last - prev) / prev) * 100).toFixed(2), history };
  });
}

export const MOCK_DATA_SOURCES = [
  { id: 1, name: "Crypto Feed API", status: "online", lastUpdated: "3s ago" },
  { id: 2, name: "Stock Market API", status: "online", lastUpdated: "5s ago" },
  { id: 3, name: "Forex Rates API", status: "online", lastUpdated: "8s ago" },
  { id: 4, name: "Historical Data Provider", status: "degraded", lastUpdated: "2m ago" },
];

export const MOCK_AUDIT_LOGS = [
  { id: 1, user: "ananya@mail.com", activity: "Logged in", time: "09:12:04" },
  { id: 2, user: "devesh@mail.com", activity: "Created price alert (BTC > 115000)", time: "09:14:41" },
  { id: 3, user: "admin", activity: "Marked data source degraded: Historical Data Provider", time: "09:20:10" },
  { id: 4, user: "priya@mail.com", activity: "Account suspended by admin", time: "09:25:55" },
  { id: 5, user: "rahul@mail.com", activity: "Added AAPL to watchlist", time: "09:31:02" },
];

/* ---------------------------------------------------------
   GLOBAL STATE (Context) â€” Auth / Market / Watchlist /
   Alerts / Portfolio / Notifications
--------------------------------------------------------- */
