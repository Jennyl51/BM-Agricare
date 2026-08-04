import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileCheck,
  Users,
  Gift,
  LogOut,
  Package,
  Newspaper,
  Settings as SettingsIcon,
} from "lucide-react";
import PreferenceControls from "./PreferenceControls";
import {
  clearAdminSession,
  getSavedAdminUser,
} from "../services/adminAuthApi";
import { useAppPreferences } from "../context/AppPreferencesContext";

const navItems = [
  { labelKey: "dashboard", path: "/dashboard", icon: LayoutDashboard },
  { labelKey: "invoices", path: "/invoices", icon: FileCheck },
  { labelKey: "retailers", path: "/retailers", icon: Users },
  { labelKey: "products", path: "/products", icon: Package },
  { labelKey: "rewards", path: "/rewards", icon: Gift },
  { labelKey: "resources", path: "/resources", icon: Newspaper },
  { labelKey: "settings", path: "/settings", icon: SettingsIcon },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useAppPreferences();

  const adminUser = getSavedAdminUser();

  const handleLogout = () => {
    clearAdminSession();
    navigate("/login", { replace: true });
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-main)",
        color: "var(--text-main)",
      }}
    >
      <aside
        style={{
          width: 250,
          background:
            "linear-gradient(180deg, var(--sidebar-bg), var(--sidebar-bg-dark))",
          color: "var(--sidebar-text)",
          padding: 24,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "sticky",
          top: 0,
          boxSizing: "border-box",
          flexShrink: 0,
          boxShadow: "8px 0 24px rgba(16, 24, 40, 0.08)",
        }}
      >
        <div>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>BM AgriCare</h2>
          <p
            style={{
              opacity: 0.9,
              fontSize: "0.9rem",
              margin: 0,
              color: "var(--sidebar-muted)",
            }}
          >
            {t("adminDashboard")}
          </p>
        </div>

        <nav
          style={{
            display: "grid",
            gap: 10,
            marginTop: 32,
            flex: 1,
            alignContent: "start",
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);

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
                  background: active
                    ? "var(--sidebar-active-bg)"
                    : "transparent",
                  color: "var(--sidebar-text)",
                  textDecoration: "none",
                  fontWeight: active ? 900 : 700,
                  boxShadow: active
                    ? "inset 0 0 0 1px rgba(255,255,255,0.2)"
                    : "none",
                  transition: "background 0.15s ease, transform 0.15s ease",
                }}
                onMouseEnter={(event) => {
                  if (!active) {
                    event.currentTarget.style.background =
                      "var(--sidebar-hover-bg)";
                  }
                }}
                onMouseLeave={(event) => {
                  if (!active) {
                    event.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <Icon size={18} />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        {adminUser && (
          <div
            style={{
              border: "1px solid rgba(255,255,255,0.22)",
              borderRadius: 16,
              padding: 12,
              marginBottom: 12,
              background: "rgba(255,255,255,0.1)",
            }}
          >
            <p
              style={{
                margin: "0 0 4px",
                fontSize: "0.76rem",
                color: "var(--sidebar-muted)",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: 0.6,
              }}
            >
              {t("signedInAs")}
            </p>

            <p style={{ margin: 0, fontWeight: 900 }}>
              {adminUser.display_name || "BM Admin"}
            </p>

            <p
              style={{
                margin: "4px 0 0",
                fontSize: "0.8rem",
                color: "var(--sidebar-muted)",
                overflowWrap: "anywhere",
              }}
            >
              {adminUser.email}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.1)",
            color: "var(--sidebar-text)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRadius: 14,
            padding: 12,
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          <LogOut size={18} />
          {t("logout")}
        </button>
      </aside>

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "24px 28px",
          background: "var(--bg-main)",
        }}
      >
        <div
          className="no-print"
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 18,
          }}
        >
          <PreferenceControls />
        </div>

        {children}
      </main>
    </div>
  );
}