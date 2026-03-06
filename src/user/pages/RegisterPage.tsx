import { JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../../shared/axiosInstance";

export default function RegisterPage(): JSX.Element {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    managerId: "",
    role: "EMPLOYEE",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post("/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        department: form.department,
        managerId: form.managerId ? Number(form.managerId) : undefined,
        role: form.role,
        status: form.status,
      });
      toast.success("Registration successful! Please log in.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: unknown) {
      const e = error as { response?: { status?: number; data?: unknown } };
      if (e.response?.status === 409) toast.error("User already exists!");
      else {
        const msg =
          typeof e.response?.data === "string"
            ? e.response.data
            : (e.response?.data as { message?: string })?.message ||
              "Registration failed.";
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg" style={{ minHeight: "100vh", padding: "1.5rem" }}>
      <Toaster position="top-right" />
      <div className="login-split-container animate__animated animate__fadeIn">
        <div className="login-brand-panel">
          <div>
            <div className="login-logo mb-4">
              <i className="bi bi-person-plus" />
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
              Join WellnessHub
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: "0.92rem",
                lineHeight: 1.65,
              }}
            >
              Create your account and start managing your wellness journey with
              your team.
            </p>
          </div>
          <div className="mt-auto pt-4 d-flex flex-column gap-3">
            {[
              { icon: "bi-check-circle", text: "Easy account setup" },
              { icon: "bi-lock-fill", text: "Your data is safe" },
              { icon: "bi-award", text: "Access wellness programs" },
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

        <div
          className="login-form-panel"
          style={{ justifyContent: "flex-start" }}
        >
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
              <i className="bi bi-person-plus-fill" />
            </div>
            <h2
              className="fw-bold mb-1"
              style={{ color: "var(--primary-navy)", fontSize: "1.45rem" }}
            >
              Create Account
            </h2>
            <p
              style={{
                color: "var(--muted-text)",
                fontSize: "0.85rem",
                margin: 0,
              }}
            >
              Fill in your details to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-0">
              <div className="col-12 col-sm-6">
                <div className="form-group mb-3">
                  <label>Full Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Jane Smith"
                  />
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="form-group mb-3">
                  <label>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
            </div>
            <div className="row g-3 mb-0">
              <div className="col-12 col-sm-6">
                <div className="form-group mb-3">
                  <label>Password</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="form-group mb-3">
                  <label>Department</label>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Engineering"
                  />
                </div>
              </div>
            </div>
            <div className="row g-3 mb-0">
              <div className="col-12 col-sm-4">
                <div className="form-group mb-3">
                  <label>
                    Manager ID{" "}
                    <span
                      style={{
                        color: "var(--muted-text)",
                        fontWeight: 400,
                        textTransform: "none",
                      }}
                    >
                      (opt.)
                    </span>
                  </label>
                  <input
                    name="managerId"
                    type="number"
                    value={form.managerId}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <div className="form-group mb-3">
                  <label>Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <div className="form-group mb-3">
                  <label>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
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
                marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <i
                    className="bi bi-arrow-repeat me-2"
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Registering…
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus-fill me-2" />
                  Create Account
                </>
              )}
            </button>
          </form>
          <div className="divider-text my-3">or</div>
          <p
            className="text-center mb-0"
            style={{ fontSize: "0.85rem", color: "var(--muted-text)" }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              style={{ color: "var(--primary-navy)", fontWeight: 700 }}
            >
              Sign in →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
