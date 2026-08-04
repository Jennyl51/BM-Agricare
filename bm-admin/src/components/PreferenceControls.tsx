import type { CSSProperties } from "react";
import type { LanguageCode, TextSize } from "../context/AppPreferencesContext";
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
  
  export default function PreferenceControls() {
    const {
      theme,
      language,
      textSize,
      setLanguage,
      setTextSize,
      toggleTheme,
      t,
    } = useAppPreferences();
  
    return (
      <div
        className="no-print"
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="secondary-btn"
          onClick={toggleTheme}
          style={{
            padding: "9px 12px",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          {theme === "light" ? t("darkMode") : t("lightMode")}
        </button>
  
        <label style={labelStyle}>
          {t("language")}
          <select
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value as LanguageCode)
            }
            style={selectStyle}
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
  
        <label style={labelStyle}>
          {t("textSize")}
          <select
            value={textSize}
            onChange={(event) => setTextSize(event.target.value as TextSize)}
            style={selectStyle}
          >
            {textSizeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }
  
  const labelStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "var(--text-muted)",
    fontWeight: 800,
    fontSize: 13,
  };
  
  const selectStyle: CSSProperties = {
    padding: "9px 12px",
    borderRadius: 12,
    border: "1px solid var(--border-soft)",
    background: "var(--bg-card)",
    color: "var(--text-main)",
    fontWeight: 800,
  };