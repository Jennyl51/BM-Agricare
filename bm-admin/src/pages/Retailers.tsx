import AdminLayout from "../components/AdminLayout";
import { retailers } from "../data/mockData";

export default function Retailers() {
  return (
    <AdminLayout>
      <div className="page">
        <h1>Retailers</h1>
        <p style={{ color: "#667085" }}>
          View retailer accounts, regions, tiers, and current points.
        </p>

        <div className="card" style={{ marginTop: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#667085" }}>
                <th>Retailer ID</th>
                <th>Name</th>
                <th>Region</th>
                <th>Tier</th>
                <th>Total Points</th>
              </tr>
            </thead>

            <tbody>
              {retailers.map((retailer) => (
                <tr key={retailer.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "16px 0" }}>{retailer.id}</td>
                  <td>{retailer.name}</td>
                  <td>{retailer.region}</td>
                  <td>{retailer.tier}</td>
                  <td>{retailer.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}