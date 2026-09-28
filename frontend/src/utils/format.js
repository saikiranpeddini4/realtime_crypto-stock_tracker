export const fmt = (n, d = 2) =>
  n >= 1000
    ? n.toLocaleString(undefined, { maximumFractionDigits: d })
    : n.toLocaleString(undefined, { maximumFractionDigits: n < 5 ? 4 : d });

