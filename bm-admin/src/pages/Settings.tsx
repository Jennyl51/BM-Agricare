import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Globe2,
  LogOut,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Type,
  UserRound,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";

type Language = "English" | "Vietnamese" | "Chinese";
type TextSize = "Small" | "Medium" | "Large";

export default function Settings() {
  const navigate = useNavigate();

  const [adminName, setAdminName] = useState("BM Shared Admin");
  const [adminEmail, setAdminEmail] = useState("admin@bm-agricare.com");
  const [language, setLanguage] = useState<Language>("English");
  const [textSize, setTextSize] = useState<TextSize>("Medium");
  const [rememberPreferences, setRememberPreferences] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleSave = () => {
    setSaveMessage("Settings saved locally for this browser session.");
    window.setTimeout(() => setSaveMessage(""), 2500);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  return (
    <AdminLayout>
      <div className="page">
        <div>
          <p
            style={{
              margin: 0,
              color: "var(--bm-blue)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              fontSize: 13,
            }}
          >
            Shared Admin Settings
          </p>

          <h1 style={{ marginBottom: 8 }}>Settings</h1>

          <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
            Manage shared admin profile information, display preferences, and
            logout actions for the BM Admin Dashboard.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 24,
            marginTop: 24,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 24 }}>
            <section className="card">
              <SectionHeader
                icon={<UserRound size={22} />}
                title="Admin Profile"
                description="This dashboard currently uses one shared admin account for BM managers."
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginTop: 20,
                }}
              >
                <FormField label="Admin Display Name">
                  <input
                    value={adminName}
                    onChange={(event) => setAdminName(event.target.value)}
                    style={inputStyle}
                  />
                </FormField>

                <FormField label="Admin Email">
                  <input
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                    style={inputStyle}
                  />
                </FormField>
              </div>

              <div
                style={{
                  marginTop: 18,
                  background: "rgba(103, 153, 200, 0.12)",
                  border: "1px solid rgba(103, 153, 200, 0.25)",
                  borderRadius: 16,
                  padding: 16,
                  color: "var(--bm-blue)",
                  lineHeight: 1.6,
                }}
              >
                <strong>Note:</strong> Since BM requested one shared admin login,
                this page does not create separate admin accounts yet. Individual
                manager preferences can be added later if BM wants separate admin
                users.
              </div>
            </section>

            <section className="card">
              <SectionHeader
                icon={<Globe2 size={22} />}
                title="Language Preference"
                description="Choose the preferred dashboard language for the shared admin view."
              />

              <div style={{ marginTop: 20 }}>
                <SegmentedControl
                  options={["English", "Vietnamese", "Chinese"]}
                  value={language}
                  onChange={(value) => setLanguage(value as Language)}
                />
              </div>
            </section>

            <section className="card">
              <SectionHeader
                icon={<Type size={22} />}
                title="Text Size"
                description="Adjust dashboard text size for readability and accessibility."
              />

              <div style={{ marginTop: 20 }}>
                <SegmentedControl
                  options={["Small", "Medium", "Large"]}
                  value={textSize}
                  onChange={(value) => setTextSize(value as TextSize)}
                />
              </div>

              <div
                style={{
                  marginTop: 20,
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 18,
                  background: "#fff",
                }}
              >
                <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
                  Preview
                </p>

                <p
                  style={{
                    fontSize:
                      textSize === "Small"
                        ? 14
                        : textSize === "Large"
                        ? 20
                        : 16,
                    lineHeight: 1.7,
                    marginBottom: 0,
                  }}
                >
                  This is how dashboard text may look with the selected text
                  size.
                </p>
              </div>
            </section>
          </div>

          <div style={{ display: "grid", gap: 24 }}>
            <section className="card">
              <SectionHeader
                icon={<SettingsIcon size={22} />}
                title="Preference Memory"
                description="Local preference memory for the current browser."
              />

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  marginTop: 20,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberPreferences}
                  onChange={(event) =>
                    setRememberPreferences(event.target.checked)
                  }
                  style={{ marginTop: 4 }}
                />

                <span>
                  <strong>Remember display preferences</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--text-muted)" }}>
                    For now, this is a placeholder for future local storage or
                    database-backed admin preferences.
                  </p>
                </span>
              </label>

              <button
                className="primary-btn"
                onClick={handleSave}
                style={{
                  marginTop: 22,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Save size={18} />
                Save Settings
              </button>

              {saveMessage && (
                <p
                  style={{
                    marginBottom: 0,
                    color: "#2f7d32",
                    fontWeight: 700,
                  }}
                >
                  {saveMessage}
                </p>
              )}
            </section>

            <section className="card">
              <SectionHeader
                icon={<ShieldCheck size={22} />}
                title="Access & Security"
                description="Manage logout for the shared admin session."
              />

              <div
                style={{
                  marginTop: 18,
                  background: "rgba(251, 176, 52, 0.14)",
                  border: "1px solid rgba(251, 176, 52, 0.35)",
                  borderRadius: 16,
                  padding: 16,
                  color: "#7a4b00",
                  lineHeight: 1.6,
                }}
              >
                <strong>Shared account reminder:</strong> Multiple managers may
                use the same admin login, so avoid changing settings during an
                active review session unless the team agrees.
              </div>

              <button
                className="danger-btn"
                onClick={() => setShowLogoutConfirm(true)}
                style={{
                  marginTop: 20,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <LogOut size={18} />
                Log Out
              </button>
            </section>
          </div>
        </div>

        {showLogoutConfirm && (
          <div style={modalBackdropStyle}>
            <div className="card" style={{ width: "min(460px, 100%)" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "rgba(227, 27, 35, 0.12)",
                  color: "var(--ingredients-red)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 16,
                }}
              >
                <AlertTriangle size={24} />
              </div>

              <h2 style={{ marginTop: 0 }}>Log out of admin dashboard?</h2>

              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                This will return you to the login page. Any unsaved local edits
                may be lost.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 24,
                }}
              >
                <button
                  className="secondary-btn"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </button>

                <button className="danger-btn" onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          background: "rgba(103, 153, 200, 0.16)",
          color: "var(--bm-blue)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <h2 style={{ margin: 0 }}>{title}</h2>
        <p style={{ color: "var(--text-muted)", margin: "6px 0 0" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontWeight: 800, color: "var(--text-main)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "#fff",
        border: "1px solid var(--border)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {options.map((option) => {
        const active = option === value;

        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            style={{
              border: "none",
              padding: "12px 16px",
              background: active ? "var(--bm-blue)" : "transparent",
              color: active ? "white" : "var(--bm-blue)",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "12px",
  background: "white",
  color: "var(--text-main)",
  outline: "none",
};

const modalBackdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(16, 32, 51, 0.45)",
  display: "grid",
  placeItems: "center",
  padding: 24,
  zIndex: 999,
};