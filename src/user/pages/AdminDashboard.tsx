import { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/AuthContext";

export default function AdminDashboard(): JSX.Element {
  const { name } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      icon: "bi-people-fill",
      label: "Manage Users",
      desc: "Add, edit or remove users across all roles.",
      path: "/admin/users",
      color: "#355872",
    },
    {
      icon: "bi-collection-fill",
      label: "Programs",
      desc: "Create and manage wellness programs.",
      path: "/programs/manage",
      color: "#4a90d9",
    },
    {
      icon: "bi-trophy-fill",
      label: "Challenges",
      desc: "Set up fitness challenges for your team.",
      path: "/admin/challenges",
      color: "#e8a838",
    },
    {
      icon: "bi-bar-chart-fill",
      label: "Analytics",
      desc: "View health metrics and program reports.",
      path: "/analytics",
      color: "#44b37e",
    },
    {
      icon: "bi-clipboard-data-fill",
      label: "Surveys",
      desc: "Design and manage wellness surveys.",
      path: "/survey",
      color: "#a064f5",
    },
    {
      icon: "bi-person-circle",
      label: "My Profile",
      desc: "View and update your account details.",
      path: "/admin/profile",
      color: "#e05c5c",
    },
  ];

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ margin: "0px auto" }}
    >
      <div className="page-header mb-4">
        <h1 className="page-title">
          <i
            className="bi bi-speedometer2 me-3"
            style={{ color: "var(--soft-blue)" }}
          />
          Admin Dashboard
        </h1>
        <p className="page-subtitle">
          Welcome back, <strong>{name || "Admin"}</strong>! Here's your control
          panel.
        </p>
      </div>

      {/* <div className="row g-4 mb-4">
        {[
          {
            icon: "bi-people",
            label: "Quick Actions",
            val: "6 Modules",
            sub: "Everything you need, one click away",
          },
          {
            icon: "bi-shield-check",
            label: "System Status",
            val: "Online",
            sub: "All services running",
          },
        ].map((s) => (
          <div className="col-12 col-sm-6 col-lg-3" key={s.label}>
            <div className="stat-card">
              <div className="stat-icon">
                <i className={`bi ${s.icon}`} />
              </div>
              <div>
                <div className="stat-value">{s.val}</div>
                <div className="stat-label">{s.label}</div>
                <div
                  style={{ fontSize: "0.72rem", color: "var(--muted-text)" }}
                >
                  {s.sub}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> */}

      <h5 className="mb-3 fw-semibold" style={{ color: "var(--primary-navy)" }}>
        Quick Access
      </h5>
      <div className="row g-3">
        {cards.map(({ icon, label, desc, path, color }) => (
          <div className="col-12 col-sm-6 col-lg-4 d-flex" key={label}>
            <div className="dash-nav-card w-100" onClick={() => navigate(path)}>
              <div
                className="dash-nav-card-icon"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                  boxShadow: `0 6px 16px ${color}44`,
                }}
              >
                <i className={`bi ${icon}`} />
              </div>
              <div className="dash-nav-card-body">
                <div className="dash-nav-card-title">{label}</div>
                <p className="dash-nav-card-desc">{desc}</p>
              </div>
              <div
                className="dash-nav-card-footer"
                style={{ borderTop: `2px solid ${color}22` }}
              >
                <span style={{ color, fontSize: "0.78rem", fontWeight: 700 }}>
                  Open <i className="bi bi-arrow-right-short" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
