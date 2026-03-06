import { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/AuthContext";

export default function ManagerDashboard(): JSX.Element {
  const { name } = useAuth();
  const navigate = useNavigate();

  const actions = [
    {
      icon: "bi-check2-circle",
      label: "Pending Approvals",
      desc: "Review and approve employee program enrollments.",
      path: "/activity/manager",
      color: "#44b37e",
    },
    {
      icon: "bi-trophy-fill",
      label: "Team Challenges",
      desc: "View and manage challenges for your team.",
      path: "/manager/challenges",
      color: "#e8a838",
    },
    {
      icon: "bi-bullseye",
      label: "Goals Tracking",
      desc: "Monitor goals set by your direct reports.",
      path: "/manager/goals",
      color: "#4a90d9",
    },
    {
      icon: "bi-clipboard-data-fill",
      label: "Surveys",
      desc: "View survey results for your team.",
      path: "/survey",
      color: "#a064f5",
    },
    {
      icon: "bi-person-circle",
      label: "My Profile",
      desc: "Update your account and preferences.",
      path: "/manager/profile",
      color: "#e05c5c",
    },
    {
      icon: "bi-bell-fill",
      label: "Notifications",
      desc: "View your latest activity notifications.",
      path: "/notifications",
      color: "#355872",
    },
  ];

  return (
    <div className="main-content animate__animated animate__fadeIn" style={{margin:"0px auto"}}>
      <div className="page-header mb-4">
        <h1 className="page-title">
          <i
            className="bi bi-person-workspace me-3"
            style={{ color: "var(--soft-blue)" }}
          />
          Manager Dashboard
        </h1>
        <p className="page-subtitle">
          Welcome, <strong>{name || "Manager"}</strong>! Manage your team's
          wellness journey.
        </p>
      </div>

      <div
        className="alert-card mb-4"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-navy)11, var(--soft-blue)11)",
          border: "1px solid var(--soft-blue)44",
          borderRadius: 14,
          padding: "1.1rem 1.4rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <i
          className="bi bi-info-circle-fill"
          style={{
            color: "var(--soft-blue)",
            fontSize: "1.3rem",
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              color: "var(--primary-navy)",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            Manager Responsibilities
          </div>
          <div style={{ color: "var(--muted-text)", fontSize: "0.8rem" }}>
            You can approve program requests, set challenges for your team, and
            track goals. Use the cards below to navigate quickly.
          </div>
        </div>
      </div>

      <div className="row g-3">
        {actions.map(({ icon, label, desc, path, color }) => (
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
