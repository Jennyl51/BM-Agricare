import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@bm-agricare.com");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "linear-gradient(135deg, #f5f7f2, #dfead9)",
      }}
    >
      <form className="card" onSubmit={handleLogin} style={{ width: 420 }}>
        <h1 style={{ marginTop: 0 }}>BM AgriCare Admin</h1>
        <p style={{ color: "#667085" }}>Sign in to manage invoices, retailers, and rewards.</p>

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 12, margin: "8px 0 16px", borderRadius: 12, border: "1px solid #ddd" }}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 12, margin: "8px 0 20px", borderRadius: 12, border: "1px solid #ddd" }}
        />

        <button className="primary-btn" style={{ width: "100%" }}>
          Sign In
        </button>
      </form>
    </div>
  );
}