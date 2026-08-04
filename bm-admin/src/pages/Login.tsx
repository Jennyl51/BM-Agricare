import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  saveAdminSession,
  startAdminLogin,
  verifyAdminCode,
} from "../services/adminAuthApi";

type LoginStep = "login" | "verify";

export default function Login() {
  const navigate = useNavigate();

  const [step, setStep] = useState<LoginStep>("login");
  const [email, setEmail] = useState("jennyl5118@berkeley.edu");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  const handleStartLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await startAdminLogin(normalizedEmail, password);

      setMessage(response.message || "Verification code sent.");
      setStep("verify");
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await verifyAdminCode(normalizedEmail, code);

      saveAdminSession(response);

      setPassword("");
      setCode("");

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await startAdminLogin(normalizedEmail, password);
      setCode("");
      setMessage(response.message || "A new verification code was sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend code.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div style={pageStyle}>
        <form className="card" onSubmit={handleVerifyCode} style={cardStyle}>
          <h1 style={{ marginTop: 0 }}>Email Verification</h1>

          <p style={mutedTextStyle}>
            We sent a 6-digit verification code to:
            <br />
            <strong>{normalizedEmail}</strong>
          </p>

          <label>Verification Code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            inputMode="numeric"
            style={inputStyle}
          />

          {message && <p style={successStyle}>{message}</p>}
          {error && <p style={errorStyle}>{error}</p>}

          <button
            className="primary-btn"
            style={{ width: "100%", opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify and Sign In"}
          </button>

          <button
            type="button"
            className="secondary-btn"
            onClick={handleResendCode}
            disabled={loading}
            style={{ width: "100%", marginTop: 12 }}
          >
            Resend Code
          </button>

          <button
            type="button"
            onClick={() => {
              setStep("login");
              setCode("");
              setError("");
              setMessage("");
            }}
            style={linkButtonStyle}
          >
            Back to password login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <form className="card" onSubmit={handleStartLogin} style={cardStyle}>
        <h1 style={{ marginTop: 0 }}>BM AgriCare Admin</h1>

        <p style={mutedTextStyle}>
          Sign in to manage invoices, retailers, and rewards.
        </p>

        <label>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <p
          style={{
            color: "#667085",
            background: "rgba(103, 153, 200, 0.12)",
            padding: 12,
            borderRadius: 12,
            marginTop: 0,
            lineHeight: 1.5,
          }}
        >
          After your password is confirmed, a verification code will be sent to
          your authorized admin email.
        </p>

        {message && <p style={successStyle}>{message}</p>}
        {error && <p style={errorStyle}>{error}</p>}

        <button
          className="primary-btn"
          style={{ width: "100%", opacity: loading ? 0.7 : 1 }}
          disabled={loading}
        >
          {loading ? "Sending Code..." : "Continue"}
        </button>
      </form>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "linear-gradient(135deg, #f5f7f2, #dfead9)",
};

const cardStyle: React.CSSProperties = {
  width: 420,
};

const mutedTextStyle: React.CSSProperties = {
  color: "#667085",
  lineHeight: 1.5,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  margin: "8px 0 16px",
  borderRadius: 12,
  border: "1px solid #ddd",
  outline: "none",
};

const errorStyle: React.CSSProperties = {
  color: "#e31b23",
  fontWeight: 700,
  marginTop: 8,
  marginBottom: 14,
};

const successStyle: React.CSSProperties = {
  color: "#2f7d32",
  fontWeight: 700,
  marginTop: 8,
  marginBottom: 14,
};

const linkButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 14,
  border: "none",
  background: "transparent",
  color: "var(--bm-blue)",
  fontWeight: 800,
  cursor: "pointer",
};