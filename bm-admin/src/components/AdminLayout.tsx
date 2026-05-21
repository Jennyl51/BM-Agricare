import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Gift,
  LogOut,
  Package,
  Newspaper,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Invoices", path: "/invoices", icon: FileCheck },
  { label: "Retailers", path: "/retailers", icon: Users },
  { label: "Products", path: "/products", icon: Package },
  { label: "Rewards", path: "/rewards", icon: Gift },
  { label: "Resources", path: "/resources", icon: Newspaper },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 250,
          background: "#17351f",
          color: "white",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ marginTop: 0 }}>BM AgriCare</h2>
        <p style={{ opacity: 0.7, fontSize: 14 }}>Admin Dashboard</p>

        <nav style={{ display: "grid", gap: 10, marginTop: 32, flex: 1, alignContent: "start" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 14,
                  background: active ? "#2f6b3f" : "transparent",
                  color: "white",
                }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "transparent",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 14,
            padding: 12,
            cursor: "pointer",
          }}
        >
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}