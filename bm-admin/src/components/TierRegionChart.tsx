import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TierRegionPoint } from "../services/adminDashboardApi";

export default function TierRegionChart({
  data,
}: {
  data: TierRegionPoint[];
}) {
  return (
    <div className="card">
      <p
        style={{
          margin: 0,
          color: "var(--text-muted)",
          fontWeight: 800,
          fontSize: "0.78rem",
          textTransform: "uppercase",
          letterSpacing: 0.7,
        }}
      >
        Retailer Segmentation
      </p>

      <h2 style={{ margin: "6px 0 0" }}>
        Retailer Tier Composition by Region
      </h2>

      <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
        Real retailer tier counts across BM Vietnam operating regions.
      </p>

      <div style={{ height: 340, marginTop: 24 }}>
        {data.length === 0 ? (
          <div
            style={{
              height: "100%",
              display: "grid",
              placeItems: "center",
              color: "var(--text-muted)",
              border: "1px dashed var(--border-soft)",
              borderRadius: 16,
            }}
          >
            No retailer tier data available yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />

              <XAxis
                dataKey="region"
                tick={{ fill: "#667085", fontSize: 12 }}
                axisLine={{ stroke: "#d0d5dd" }}
                tickLine={false}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: "#667085", fontSize: 12 }}
                axisLine={{ stroke: "#d0d5dd" }}
                tickLine={false}
              />

              <Tooltip
                labelStyle={{ color: "#101828", fontWeight: 800 }}
                contentStyle={{
                  background: "#ffffff",
                  border: "1px solid #d0d5dd",
                  borderRadius: 12,
                  color: "#101828",
                  boxShadow: "0 12px 24px rgba(16, 24, 40, 0.12)",
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{
                  paddingBottom: 14,
                  fontSize: 12,
                }}
              />

              <Bar dataKey="bronze" stackId="tiers" fill="#9c6b30" />
              <Bar dataKey="silver" stackId="tiers" fill="#98a2b3" />
              <Bar dataKey="gold" stackId="tiers" fill="#d6921e" />
              <Bar dataKey="diamond" stackId="tiers" fill="#06357a" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}