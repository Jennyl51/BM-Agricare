import AdminLayout from "../components/AdminLayout";
import { rewards } from "../data/mockData";

export default function Rewards() {
  return (
    <AdminLayout>
      <div className="page">
        <h1>Rewards</h1>
        <p style={{ color: "#667085" }}>
          Manage reward items, points required, minimum tier, and stock.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
          <button className="primary-btn">Add Reward</button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginTop: 20,
          }}
        >
          {rewards.map((reward) => (
            <div className="card" key={reward.id}>
              <p style={{ margin: 0, color: "#667085", fontSize: 14 }}>{reward.id}</p>
              <h2>{reward.name}</h2>
              <p>
                <strong>Points:</strong> {reward.points}
              </p>
              <p>
                <strong>Minimum Tier:</strong> {reward.tier}
              </p>
              <p>
                <strong>Stock:</strong> {reward.stock}
              </p>

              <button className="secondary-btn">Edit</button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}