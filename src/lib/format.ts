export const CURRENCIES = [
  { code: "USD", label: "Dólar (USD)" },
  { code: "COP", label: "Peso colombiano (COP)" },
  { code: "MXN", label: "Peso mexicano (MXN)" },
  { code: "PEN", label: "Sol peruano (PEN)" },
  { code: "EUR", label: "Euro (EUR)" },
];

export function formatMoney(value: number, currency = "USD", compact = false): string {
  const noDecimals = currency === "COP";
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: noDecimals || compact ? 0 : 2,
    minimumFractionDigits: noDecimals || compact ? 0 : 2,
  }).format(value);
}

export function formatDate(d: Date | string, opts: Intl.DateTimeFormatOptions = {}): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...opts,
  }).format(date);
}

export function formatPercent(value: number, withSign = false): string {
  const s = `${Math.abs(value).toFixed(1)} %`;
  if (!withSign) return s;
  return value > 0 ? `+${s}` : value < 0 ? `−${s}` : s;
}

export const PAYMENT_METHODS = {
  CASH: "Efectivo",
  DEBIT_CARD: "Tarjeta débito",
  CREDIT_CARD: "Tarjeta crédito",
  TRANSFER: "Transferencia",
  OTHER: "Otro",
} as const;

export const CATEGORY_GROUPS = {
  NEED: "Necesidad",
  WANT: "Deseo",
  SAVING: "Ahorro",
  INCOME: "Ingreso",
} as const;
