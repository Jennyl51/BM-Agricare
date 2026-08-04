import { useMemo, useState } from "react";
import {
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { SalesPoint } from "../services/adminDashboardApi";
import { useAppPreferences } from "../context/AppPreferencesContext";

type RangeKey = "week" | "month" | "year";

const brandColors: Record<string, string> = {
  Entec: "#4f8f20",
  Nitrophoska: "#06357a",
  Fertiganic: "#6799c8",
  Novatec: "#807f83",
  Yuroka: "#7ac143",
  Gowin: "#5b6b3a",
  Growel: "#b54708",
  Other: "#98a2b3",
};

function formatVnd(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
}

export default function SalesChart({
  salesOverTime,
}: {
  salesOverTime: Record<RangeKey, SalesPoint[]>;
}) {
  const { t } = useAppPreferences();
  const [range, setRange] = useState<RangeKey>("month");

  const rawData = salesOverTime[range] || [];

  const brands = useMemo(() => {
    const keys = new Set<string>();

    rawData.forEach((point) => {
      Object.keys(point).forEach((key) => {
        if (key !== "date") {
          keys.add(key);
        }
      });
    });

    return Array.from(keys);
  }, [rawData]);

  const data = useMemo(() => {
    return rawData.map((point) => {
      const filledPoint: SalesPoint = { ...point };

      brands.forEach((brand) => {
        if (filledPoint[brand] === undefined || filledPoint[brand] === null) {
          filledPoint[brand] = 0;
        }
      });

      return filledPoint;
    });
  }, [rawData, brands]);

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div>
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
            {t("invoiceRevenue")}
          </p>

          <h2 style={{ margin: "6px 0 0" }}>{t("invoiceSalesOverTime")}</h2>

          <p style={{ color: "var(--text-muted)", marginTop: 6 }}>
            {t("invoiceSalesSubtitle")}
          </p>
        </div>

        <select
          value={range}
          onChange={(event) => setRange(event.target.value as RangeKey)}
          style={{
            height: 42,
            borderRadius: 12,
            border: "1px solid var(--border-soft)",
            padding: "0 12px",
            background: "var(--bg-card)",
            color: "var(--text-main)",
            fontWeight: 700,
          }}
        >
          <option value="week">{t("oneWeek")}</option>
          <option value="month">{t("oneMonth")}</option>
          <option value="year">{t("oneYear")}</option>
        </select>
      </div>

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
            {t("noInvoiceSalesData")}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid
                stroke="#d0d5dd"
                strokeOpacity={0.45}
                strokeDasharray="2 4"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{ fill: "#667085", fontSize: 12 }}
                axisLine={{ stroke: "#d0d5dd" }}
                tickLine={false}
              />

              <YAxis
                tickCount={9}
                tick={{ fill: "#667085", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) =>
                  Number(value) >= 1000000
                    ? `${Math.round(Number(value) / 1000000)}M`
                    : String(value)
                }
              />

              <Tooltip
                formatter={(value, name) => [
                  formatVnd(Number(value)),
                  String(name),
                ]}
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
                iconType="line"
                wrapperStyle={{
                  paddingBottom: 14,
                  fontSize: 12,
                }}
              />

              {brands.map((brand) => (
                <Line
                  key={brand}
                  type="linear"
                  dataKey={brand}
                  stroke={brandColors[brand] || "#667085"}
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}