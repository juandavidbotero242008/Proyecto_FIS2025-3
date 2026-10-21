"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney } from "@/lib/format";

const axis = { stroke: "#475569", fontSize: 11.5, tickLine: false, axisLine: false } as const;

type TooltipPayload = { name?: string; value?: number; color?: string; payload?: Record<string, unknown> }[];

function MoneyTooltip({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: TooltipPayload;
  label?: string;
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label && <div className="t">{label}</div>}
      {payload.map((p) => (
        <div key={p.name} className="row" style={{ gap: 8, padding: "2px 0" }}>
          <span className="legend-dot" style={{ background: p.color }} />
          <span className="muted" style={{ fontSize: 12 }}>
            {p.name}:
          </span>
          <strong className="tabular" style={{ fontSize: 12.5 }}>
            {formatMoney(Number(p.value), currency)}
          </strong>
        </div>
      ))}
    </div>
  );
}

/* ---------- Dona de categorías ---------- */
export function CategoryDonut({
  data,
  currency,
}: {
  data: { name: string; color: string; total: number }[];
  currency: string;
}) {
  const total = data.reduce((s, d) => s + d.total, 0);
  return (
    <div style={{ position: "relative", width: "100%", height: 210 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="name"
            innerRadius="65%"
            outerRadius="90%"
            paddingAngle={2}
            stroke="#111726"
            strokeWidth={2}
            cornerRadius={4}
            animationDuration={600}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<MoneyTooltip currency={currency} />} />
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
          textAlign: "center",
        }}
      >
        <div>
          <div className="dim" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--text)" }}>
            {formatMoney(total, currency, true)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Tendencia semanal ---------- */
export function WeeklyTrendChart({
  data,
  currency,
  height = 270,
}: {
  data: { label: string; expense: number; income: number }[];
  currency: string;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 6, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e293b" vertical={false} />
          <XAxis dataKey="label" {...axis} />
          <YAxis {...axis} width={54} tickFormatter={(v) => formatMoney(v, currency, true)} />
          <Tooltip content={<MoneyTooltip currency={currency} />} cursor={{ stroke: "#334155" }} />
          <Area
            type="monotone"
            dataKey="income"
            name="Ingresos"
            stroke="#10b981"
            strokeWidth={1.8}
            fill="url(#gIncome)"
            animationDuration={600}
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Gastos"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gExpense)"
            activeDot={{ r: 4, strokeWidth: 0, fill: "#3b82f6" }}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- Semana actual vs anterior por categoría ---------- */
export function WeekCompareChart({
  data,
  currency,
}: {
  data: { name: string; thisWeek: number; lastWeek: number }[];
  currency: string;
}) {
  return (
    <div style={{ width: "100%", height: Math.max(220, data.length * 40) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }} barGap={2}>
          <CartesianGrid stroke="#1e293b" horizontal={false} />
          <XAxis type="number" {...axis} tickFormatter={(v) => formatMoney(v, currency, true)} />
          <YAxis type="category" dataKey="name" {...axis} width={110} />
          <Tooltip content={<MoneyTooltip currency={currency} />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
          <Bar dataKey="lastWeek" name="Semana pasada" fill="#334155" radius={[0, 4, 4, 0]} barSize={10} />
          <Bar dataKey="thisWeek" name="Esta semana" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={10} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ---------- Gasto por día de la semana ---------- */
export function WeekdayChart({ data, currency }: { data: { day: string; total: number }[]; currency: string }) {
  const max = Math.max(...data.map((d) => d.total));
  return (
    <div style={{ width: "100%", height: 210 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="day" {...axis} />
          <YAxis hide />
          <Tooltip content={<MoneyTooltip currency={currency} />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
          <Bar dataKey="total" name="Gasto" radius={[4, 4, 0, 0]} barSize={22}>
            {data.map((d) => (
              <Cell key={d.day} fill={d.total === max && max > 0 ? "#3b82f6" : "#1e293b"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
