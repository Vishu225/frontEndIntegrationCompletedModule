import { JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { useAuth } from "../../shared/AuthContext";
import axiosInstance from "../../shared/axiosInstance";

// Modal shown to EMPLOYEE / MANAGER after login to collect their userId
// (JWT does not carry userId, and /viewAllUsers is ADMIN-only)
function UserIdModal({ onSubmit }: { onSubmit: (id: number) => void }) {
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputId, 10);
    if (!inputId || isNaN(num) || num <= 0) {
      setError("Please enter a valid positive User ID.");
      return;
    }
    onSubmit(num);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="animate__animated animate__zoomIn animate__faster"
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "2rem",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div className="text-center mb-3">
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background:
                "linear-gradient(135deg, var(--primary-navy), var(--soft-blue))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              color: "#fff",
              fontSize: "1.3rem",
            }}
          >
            <i className="bi bi-person-badge" />
          </div>
          <h5 className="fw-bold mb-1" style={{ color: "var(--primary-navy)" }}>
            Enter Your User ID
          </h5>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--muted-text)",
              margin: 0,
            }}
          >
            Your User ID is provided during HR onboarding and is required to
            identify your account. Contact HR if you don't have it.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label>User ID</label>
            <input
              type="number"
              className={`input-field${error ? " border-danger" : ""}`}
              placeholder="e.g. 42"
              value={inputId}
              min="1"
              onChange={(e) => {
                setInputId(e.target.value);
                setError("");
              }}
            />
            {error && (
              <div
                style={{ color: "#e74c3c", fontSize: "0.78rem", marginTop: 4 }}
              >
                <i className="bi bi-exclamation-circle me-1" />
                {error}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="btn-grad w-100"
            style={{ justifyContent: "center" }}
          >
            <i className="bi bi-check-lg me-1" /> Confirm &amp; Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post<string>(
        "/login",
        { email, password },
        { responseType: "text" } as object,
      );
      const token = res.data;
      const decoded = jwtDecode<{ role: string }>(token);
      const role = decoded.role?.replace("ROLE_", "");

      if (role === "ADMIN") {
        // ADMIN: auto-resolve userId from /viewAllUsers
        await login(token);
        toast.success("Logged in successfully!");
        navigate("/admin/dashboard");
      } else {
        // EMPLOYEE / MANAGER: need userId from user
        setPendingToken(token);
        setPendingRole(role);
      }
    } catch (error: unknown) {
      const e = error as { response?: { status?: number; data?: unknown } };
      if (e.response?.status === 404) toast.error("User not found!");
      else if (e.response?.status === 401 || e.response?.status === 403)
        toast.error("Invalid email or password.");
      else {
        const msg =
          typeof e.response?.data === "string"
            ? e.response.data
            : (e.response?.data as { message?: string })?.message ||
              "Login failed.";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserIdSubmit = async (userId: number) => {
    if (!pendingToken || !pendingRole) return;
    await login(pendingToken, userId);
    toast.success("Logged in successfully!");
    if (pendingRole === "MANAGER") navigate("/manager/dashboard");
    else navigate("/employee/dashboard");
    setPendingToken(null);
    setPendingRole(null);
  };

  return (
    <div className="login-bg" style={{ minHeight: "100vh", padding: "1.5rem" }}>
      <Toaster position="top-right" />
      {pendingToken && <UserIdModal onSubmit={handleUserIdSubmit} />}
      <div className="login-split-container animate__animated animate__fadeIn">
        {/* Left brand panel */}
        <div className="login-brand-panel">
          <div>
            <div className="login-logo mb-4">
              <i className="bi bi-heart-pulse" />
            </div>
            <h1
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: "#fff",
                letterSpacing: "-0.03em",
                marginBottom: "0.5rem",
              }}
            >
              WellnessHub
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: "0.92rem",
                lineHeight: 1.65,
              }}
            >
              Your complete wellness management platform. Track programs, manage
              users, and stay healthy.
            </p>
          </div>
          <div className="mt-auto pt-4 d-flex flex-column gap-3">
            {[
              { icon: "bi-shield-check", text: "Secure & private" },
              { icon: "bi-graph-up-arrow", text: "Track your progress" },
              { icon: "bi-people-fill", text: "Team wellness management" },
            ].map(({ icon, text }) => (
              <div key={text} className="d-flex align-items-center gap-3">
                <span className="login-feature-icon">
                  <i className={`bi ${icon}`} />
                </span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.82)",
                    fontSize: "0.87rem",
                    fontWeight: 500,
                  }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
          <div
            className="mt-4 pt-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "0.72rem",
                margin: 0,
              }}
            >
              © 2026 WellnessHub · Built for better living
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-form-panel">
          <div className="text-center mb-4">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                margin: "0 auto 14px",
                background:
                  "linear-gradient(135deg, var(--primary-navy), var(--soft-blue))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "1.4rem",
                boxShadow: "0 8px 20px rgba(53,88,114,0.25)",
              }}
            >
              <i className="bi bi-box-arrow-in-right" />
            </div>
            <h2
              className="fw-bold mb-1"
              style={{ color: "var(--primary-navy)", fontSize: "1.45rem" }}
            >
              Sign In
            </h2>
            <p
              style={{
                color: "var(--muted-text)",
                fontSize: "0.85rem",
                margin: 0,
              }}
            >
              Welcome back! Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Email Address</label>
              <div style={{ position: "relative" }}>
                <i
                  className="bi bi-envelope"
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted-text)",
                    fontSize: "0.9rem",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                  style={{ paddingLeft: "2.4rem" }}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="form-group mb-4">
              <label>Password</label>
              <div style={{ position: "relative" }}>
                <i
                  className="bi bi-lock"
                  style={{
                    position: "absolute",
                    left: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted-text)",
                    fontSize: "0.9rem",
                  }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field"
                  style={{ paddingLeft: "2.4rem" }}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-grad w-100"
              style={{
                padding: "13px",
                fontSize: "0.95rem",
                justifyContent: "center",
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? (
                <>
                  <i
                    className="bi bi-arrow-repeat me-2"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Signing in…
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="divider-text my-3">or</div>
          <p
            className="text-center mb-0"
            style={{ fontSize: "0.85rem", color: "var(--muted-text)" }}
          >
            Don't have an account?{" "}
            <a
              href="/register"
              style={{ color: "var(--primary-navy)", fontWeight: 700 }}
            >
              Register here →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
