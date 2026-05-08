import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { salesOverTime } from "../data/adminMockData";

type RangeKey = "week" | "month" | "year";

export default function SalesChart() {
  const [range, setRange] = useState<RangeKey>("month");

  const data = salesOverTime[range];

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Sales Over Time</h2>
          <p style={{ color: "#667085", marginTop: 6 }}>
            Compare product sales across different timelines.
          </p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value as RangeKey)}
          style={{
            height: 42,
            borderRadius: 12,
            border: "1px solid #ddd",
            padding: "0 12px",
          }}
        >
          <option value="week">1 Week</option>
          <option value="month">1 Month</option>
          <option value="year">1 Year</option>
        </select>
      </div>

      <div style={{ height: 320, marginTop: 24 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Entec" strokeWidth={3} />
            <Line type="monotone" dataKey="Nitrophoska" strokeWidth={3} />
            <Line type="monotone" dataKey="Fertiganic" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}