import AdminLayout from "../components/AdminLayout";
import { products } from "../data/adminMockData";

export default function Products() {
  return (
    <AdminLayout>
      <div className="page">
        <h1>Products</h1>
        <p style={{ color: "#667085" }}>
          Manage BM AgriCare product information and point factors.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginTop: 24,
          }}
        >
          {products.map((product) => (
            <div className="card" key={product.product_id}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ margin: 0, color: "#667085" }}>
                  Product #{product.product_id}
                </p>
                <span
                  style={{
                    background: product.is_active ? "#e7f6ec" : "#f2f4f7",
                    color: product.is_active ? "#027a48" : "#667085",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <h2>{product.product_name}</h2>
              <p style={{ color: "#667085" }}>{product.category}</p>

              <p>
                <strong>Point Factor:</strong> {product.point_factor} points/unit
              </p>

              <p style={{ lineHeight: 1.6 }}>{product.description}</p>

              <div>
                <strong>Key Benefits</strong>
                <ul style={{ paddingLeft: 20 }}>
                  {product.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>

              <button className="secondary-btn">Edit Product</button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}