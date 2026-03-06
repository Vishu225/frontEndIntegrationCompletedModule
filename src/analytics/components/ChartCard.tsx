import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint, ChartType } from "../api/analyticsService";

const COLORS = [
  "#355872",
  "#7aaace",
  "#9cd5ff",
  "#27ae60",
  "#e67e22",
  "#6f42c1",
  "#e74c3c",
  "#f4a923",
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
  label?: string;
}) => {
  if (active && payload?.length) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid rgba(122,170,206,0.25)",
          borderRadius: 10,
          padding: "8px 14px",
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "#355872",
          boxShadow: "0 4px 12px rgba(53,88,114,0.12)",
        }}
      >
        <div style={{ color: "#8a9bb0", marginBottom: 2 }}>{label}</div>
        <div>
          {payload[0].name ?? "Value"}: <strong>{payload[0].value}</strong>
        </div>
      </div>
    );
  }
  return null;
};

interface ChartCardProps {
  title: string;
  badgeIcon: string;
  badgeLabel: string;
  type: ChartType;
  data: ChartDataPoint[];
  loading: boolean;
  onOpenChart: (type: ChartType, data: ChartDataPoint[], label: string) => void;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  badgeIcon,
  badgeLabel,
  type,
  data,
  loading,
  onOpenChart,
}) => (
  <div
    className="prod-card"
    style={{ cursor: "pointer" }}
    onClick={() => onOpenChart(type, data, title)}
  >
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h6 className="fw-bold mb-0" style={{ color: "var(--primary-navy)" }}>
        {title}
      </h6>
      <span className="badge-category" style={{ fontSize: "0.72rem" }}>
        <i className={`bi ${badgeIcon} me-1`} />
        {badgeLabel}
      </span>
    </div>
    {loading ? (
      <div className="empty-state">
        <i
          className="bi bi-arrow-clockwise"
          style={{
            fontSize: "1.6rem",
            display: "block",
            marginBottom: 8,
            animation: "spin 1s linear infinite",
          }}
        />
        Loading data…
      </div>
    ) : data.length === 0 ? (
      <div className="empty-state">
        <i
          className="bi bi-exclamation-circle"
          style={{ fontSize: "1.6rem", display: "block", marginBottom: 8 }}
        />
        No data available
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={260}>
        {type === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={95}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        ) : type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8a9bb0" }} />
            <YAxis tick={{ fontSize: 11, fill: "#8a9bb0" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#355872"
              strokeWidth={2.5}
              dot={{ fill: "#7aaace", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : (
          <BarChart data={data} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8a9bb0" }} />
            <YAxis tick={{ fontSize: 11, fill: "#8a9bb0" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    )}
  </div>
);

export default ChartCard;
export { CustomTooltip };
