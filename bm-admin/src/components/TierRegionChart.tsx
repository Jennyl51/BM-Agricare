import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Legend,
  } from "recharts";
  import { tierCompositionByRegion } from "../data/adminMockData";
  
  export default function TierRegionChart() {
    return (
      <div className="card">
        <h2 style={{ margin: 0 }}>Retailer Tier Composition by Region</h2>
        <p style={{ color: "#667085", marginTop: 6 }}>
          Percentage breakdown of retailer tiers in each region.
        </p>
  
        <div style={{ height: 320, marginTop: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierCompositionByRegion}>
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bronze" stackId="tiers" fill="#cd7f32" />
              <Bar dataKey="silver" stackId="tiers" fill="#c0c0c0" />
              <Bar dataKey="gold" stackId="tiers" fill="#fbb034" />
              <Bar dataKey="premium" stackId="tiers" fill="#06357a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }