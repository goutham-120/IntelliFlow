import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { registerOrganization } from "../../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [orgCode, setOrgCode] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOrgSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (orgName.trim() && orgCode.trim()) {
      setStep(2);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await registerOrganization({
        orgName,
        orgCode,
        adminName,
        adminEmail,
        adminPassword,
      });

      login({ token: data.token, user: data.user });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Instrument Sans', 'DM Sans', sans-serif",
        background: "#ffffff",
        color: "#111111",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Instrument+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --green: #2d6a4f;
          --green-light: #f0f7f4;
          --green-mid: #d8ede6;
          --ink: #111111;
          --ink2: #444;
          --muted: #888;
          --border: #e8e8e4;
          --bg2: #f9f9f7;
          --error-bg: #fff5f5;
          --error-border: #fca5a5;
          --error-text: #b91c1c;
        }
        a { text-decoration: none; }
        .register-shell {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          background:
            radial-gradient(circle at top left, rgba(216, 237, 230, 0.75), transparent 30%),
            linear-gradient(180deg, #ffffff 0%, var(--bg2) 100%);
        }
        .register-card {
          width: 100%;
          max-width: 520px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 32px 28px;
          box-shadow: 0 24px 60px rgba(17, 17, 17, 0.08);
          backdrop-filter: blur(10px);
        }
        .tag {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          background: var(--green-light);
          color: var(--green);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .rf-input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 0.92rem;
          color: var(--ink);
          background: #fff;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          margin-top: 6px;
        }
        .rf-input:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 4px rgba(45, 106, 79, 0.08);
        }
        .rf-input::placeholder { color: #bbb; }
        .rf-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--ink2);
          display: block;
        }
        .rf-btn {
          width: 100%;
          padding: 13px 16px;
          background: var(--green);
          color: #fff;
          font-family: 'Instrument Sans', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s;
        }
        .rf-btn:hover:not(:disabled) { background: #235a40; transform: translateY(-1px); }
        .rf-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .rf-link { color: var(--green); font-weight: 600; text-decoration: none; }
        .rf-link:hover { text-decoration: underline; }
        .step-dot {
          height: 6px;
          border-radius: 999px;
          transition: all 0.25s;
        }
        @media (max-width: 640px) {
          .register-shell {
            align-items: flex-start;
            padding: 24px 14px 32px;
          }
          .register-card { padding: 24px 18px; border-radius: 16px; }
        }
      `}</style>

      <div className="register-shell">
        <div className="register-card">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div className="tag" style={{ marginBottom: 16 }}>Create workspace</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "var(--green)",
                  borderRadius: 7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                }}
              >
                I
              </div>
              <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: "1.2rem", letterSpacing: "0.01em" }}>
                Intelli<span style={{ color: "var(--green)" }}>Flow</span>
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontSize: "clamp(2rem, 5vw, 2.5rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "0.01em",
                marginBottom: 10,
              }}
            >
              Set up your organization
            </h1>
            <p style={{ fontSize: "0.92rem", color: "var(--ink2)", lineHeight: 1.7 }}>
              Create your workspace and first admin account in one clean flow.
            </p>
          </div>

          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 24 }}>
            <div className="step-dot" style={{ width: step === 1 ? 28 : 16, background: step === 1 ? "var(--green)" : "var(--green-mid)" }} />
            <div className="step-dot" style={{ width: step === 2 ? 28 : 16, background: step === 2 ? "var(--green)" : "var(--green-mid)" }} />
          </div>

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: "10px 14px",
                background: "var(--error-bg)",
                border: "1px solid var(--error-border)",
                borderRadius: 10,
                color: "var(--error-text)",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleOrgSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label className="rf-label">Organization name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Example: ABC College"
                  className="rf-input"
                  required
                />
              </div>

              <div>
                <label className="rf-label">Organization code</label>
                <input
                  type="text"
                  value={orgCode}
                  onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                  placeholder="Example: IFLOW-001"
                  className="rf-input"
                  required
                />
                <p style={{ marginTop: 6, fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                  This unique code will be used by your members during login.
                </p>
              </div>

              <button type="submit" className="rf-btn">
                Continue
              </button>

              <p style={{ textAlign: "center", fontSize: "0.84rem", color: "var(--muted)" }}>
                Already have an organization?{" "}
                <Link to="/login" className="rf-link">Login</Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div
                style={{
                  padding: "12px 16px",
                  background: "var(--green-light)",
                  border: "1px solid #c6dfd7",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Organization
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--ink)", fontSize: "0.95rem", marginTop: 2 }}>{orgName}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--ink2)", marginTop: 1 }}>{orgCode}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  style={{ fontSize: "0.78rem", color: "var(--green)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  Change
                </button>
              </div>

              <div>
                <label className="rf-label">Admin full name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Example: Goutham"
                  className="rf-input"
                  required
                />
              </div>

              <div>
                <label className="rf-label">Admin email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="rf-input"
                  required
                />
              </div>

              <div>
                <label className="rf-label">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="rf-input"
                  required
                />
                <p style={{ marginTop: 6, fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                  This will be the first admin account and it opens directly into the dashboard.
                </p>
              </div>

              <button type="submit" className="rf-btn" disabled={loading}>
                {loading ? "Creating..." : "Create organization"}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.84rem", color: "var(--muted)" }}>
                Want to login instead?{" "}
                <Link to="/login" className="rf-link">Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
