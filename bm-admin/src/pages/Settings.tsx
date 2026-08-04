import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Globe2,
  LogOut,
  Moon,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  Type,
  UserRound,
} from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import {
  clearAdminSession,
  getSavedAdminUser,
} from "../services/adminAuthApi";
import type { CSSProperties, ReactNode } from "react";
import type {
  LanguageCode,
  TextSize,
  ThemeMode,
} from "../context/AppPreferencesContext";
import { useAppPreferences } from "../context/AppPreferencesContext";

const languageOptions: { value: LanguageCode; label: string }[] = [
  { value: "en", label: "English" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "zh", label: "中文" },
  { value: "ms", label: "Bahasa" },
];

const textSizeOptions: { value: TextSize; labelKey: string }[] = [
  { value: "small", labelKey: "textSmall" },
  { value: "medium", labelKey: "textMedium" },
  { value: "large", labelKey: "textLarge" },
];

const themeOptions: { value: ThemeMode; labelKey: string }[] = [
  { value: "light", labelKey: "lightMode" },
  { value: "dark", labelKey: "darkMode" },
];

export default function Settings() {
  const navigate = useNavigate();
  const {
    theme,
    language,
    textSize,
    setTheme,
    setLanguage,
    setTextSize,
    t,
  } = useAppPreferences();

  const savedAdmin = useMemo(() => getSavedAdminUser(), []);

  const [rememberPreferences, setRememberPreferences] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const adminName = savedAdmin?.display_name || "BM Shared Admin";
  const adminEmail = savedAdmin?.email || "admin@bm-agricare.com";

  const handleSave = () => {
    setSaveMessage(t("settingsSaved"));
    window.setTimeout(() => setSaveMessage(""), 2500);
  };

  const handleLogout = () => {
    clearAdminSession();
    setShowLogoutConfirm(false);
    navigate("/login", { replace: true });
  };

  return (
    <AdminLayout>
      <div className="page">
        <div className="bm-brand-strip" />

        <div style={{ marginTop: 22 }}>
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
            {t("sharedAdminSettings")}
          </p>

          <h1 style={{ marginBottom: 8 }}>{t("settings")}</h1>

          <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
            {t("settingsSubtitle")}
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
                title={t("adminProfile")}
                description={t("adminProfileDescription")}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginTop: 20,
                }}
              >
                <FormField label={t("adminDisplayName")}>
                  <input value={adminName} readOnly style={inputStyle} />
                </FormField>

                <FormField label={t("adminEmail")}>
                  <input value={adminEmail} readOnly style={inputStyle} />
                </FormField>
              </div>

              <div
                style={{
                  marginTop: 18,
                  background: "var(--info-bg)",
                  border: "1px solid rgba(103, 153, 200, 0.25)",
                  borderRadius: 16,
                  padding: 16,
                  color: "var(--info-text)",
                  lineHeight: 1.6,
                }}
              >
                <strong>{t("profileNoteTitle")}:</strong> {t("profileNoteText")}
              </div>
            </section>

            <section className="card">
              <SectionHeader
                icon={<Globe2 size={22} />}
                title={t("languagePreference")}
                description={t("languagePreferenceDescription")}
              />

              <div style={{ marginTop: 20 }}>
                <SegmentedControl
                  options={languageOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  value={language}
                  onChange={(value) => setLanguage(value as LanguageCode)}
                />
              </div>
            </section>

            <section className="card">
              <SectionHeader
                icon={theme === "light" ? <Sun size={22} /> : <Moon size={22} />}
                title={t("themePreference")}
                description={t("themePreferenceDescription")}
              />

              <div style={{ marginTop: 20 }}>
                <SegmentedControl
                  options={themeOptions.map((option) => ({
                    value: option.value,
                    label: t(option.labelKey),
                  }))}
                  value={theme}
                  onChange={(value) => setTheme(value as ThemeMode)}
                />
              </div>
            </section>

            <section className="card">
              <SectionHeader
                icon={<Type size={22} />}
                title={t("textSize")}
                description={t("textSizeDescription")}
              />

              <div style={{ marginTop: 20 }}>
                <SegmentedControl
                  options={textSizeOptions.map((option) => ({
                    value: option.value,
                    label: t(option.labelKey),
                  }))}
                  value={textSize}
                  onChange={(value) => setTextSize(value as TextSize)}
                />
              </div>

              <div
                style={{
                  marginTop: 20,
                  border: "1px solid var(--border-soft)",
                  borderRadius: 16,
                  padding: 18,
                  background: "var(--bg-soft)",
                }}
              >
                <p style={{ color: "var(--text-muted)", marginTop: 0 }}>
                  {t("preview")}
                </p>

                <p
                  style={{
                    lineHeight: 1.7,
                    marginBottom: 0,
                  }}
                >
                  {t("previewText")}
                </p>
              </div>
            </section>
          </div>

          <div style={{ display: "grid", gap: 24 }}>
            <section className="card">
              <SectionHeader
                icon={<SettingsIcon size={22} />}
                title={t("preferenceMemory")}
                description={t("preferenceMemoryDescription")}
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
                  <strong>{t("rememberDisplayPreferences")}</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--text-muted)" }}>
                    {t("rememberDisplayPreferencesDescription")}
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
                {t("saveSettings")}
              </button>

              {saveMessage && (
                <p
                  style={{
                    marginBottom: 0,
                    color: "var(--success-text)",
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
                title={t("accessSecurity")}
                description={t("accessSecurityDescription")}
              />

              <div
                style={{
                  marginTop: 18,
                  background: "var(--warning-bg)",
                  border: "1px solid rgba(251, 176, 52, 0.35)",
                  borderRadius: 16,
                  padding: 16,
                  color: "var(--warning-text)",
                  lineHeight: 1.6,
                }}
              >
                <strong>{t("sharedAccountReminderTitle")}:</strong>{" "}
                {t("sharedAccountReminderText")}
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
                {t("logout")}
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
                  background: "var(--danger-bg)",
                  color: "var(--danger-text)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 16,
                }}
              >
                <AlertTriangle size={24} />
              </div>

              <h2 style={{ marginTop: 0 }}>{t("logoutConfirmTitle")}</h2>

              <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
                {t("logoutConfirmText")}
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
                  {t("cancel")}
                </button>

                <button className="danger-btn" onClick={handleLogout}>
                  {t("logout")}
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
  icon: ReactNode;
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
          background: "var(--info-bg)",
          color: "var(--info-text)",
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
  children: ReactNode;
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
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "var(--bg-card)",
        border: "1px solid var(--border-soft)",
        borderRadius: 16,
        overflow: "hidden",
        flexWrap: "wrap",
      }}
    >
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              border: "none",
              padding: "12px 16px",
              background: active ? "var(--bm-blue)" : "transparent",
              color: active ? "white" : "var(--bm-blue)",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-soft)",
  borderRadius: 14,
  padding: "12px",
  background: "var(--bg-soft)",
  color: "var(--text-main)",
  outline: "none",
};

const modalBackdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(16, 32, 51, 0.45)",
  display: "grid",
  placeItems: "center",
  padding: 24,
  zIndex: 999,
};