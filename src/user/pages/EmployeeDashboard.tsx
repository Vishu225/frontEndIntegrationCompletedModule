import { JSX } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/AuthContext";

export default function EmployeeDashboard(): JSX.Element {
  const { name } = useAuth();
  const navigate = useNavigate();

  const actions = [
    {
      icon: "bi-collection-fill",
      label: "Programs",
      desc: "Browse and enroll in wellness programs.",
      path: "/employee/programs",
      color: "#4a90d9",
    },
    {
      icon: "bi-bullseye",
      label: "My Goals",
      desc: "Track and update your personal wellness goals.",
      path: "/employee/goals",
      color: "#44b37e",
    },
    {
      icon: "bi-clipboard-data-fill",
      label: "Surveys",
      desc: "Complete assigned wellness surveys.",
      path: "/survey",
      color: "#a064f5",
    },
    {
      icon: "bi-person-circle",
      label: "My Profile",
      desc: "Update your account and preferences.",
      path: "/employee/profile",
      color: "#e05c5c",
    },
    {
      icon: "bi-bell-fill",
      label: "Notifications",
      desc: "View program updates and announcements.",
      path: "/notifications",
      color: "#355872",
    },
    {
      icon: "bi-question-circle-fill",
      label: "Help & FAQ",
      desc: "Get support and answers to common questions.",
      path: "/help",
      color: "#e8a838",
    },
  ];

  const tips = [
    {
      icon: "bi-droplet-fill",
      text: "Drink 8 glasses of water daily.",
      color: "#4fc3f7",
    },
    {
      icon: "bi-person-walking",
      text: "Aim for 30 mins of activity daily.",
      color: "#44b37e",
    },
    {
      icon: "bi-moon-fill",
      text: "Get 7–9 hours of sleep each night.",
      color: "#a064f5",
    },
    {
      icon: "bi-heart-fill",
      text: "Practice mindfulness for 5 mins a day.",
      color: "#e05c5c",
    },
  ];

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ margin: "0 auto" }}
    >
      <div className="page-header mb-4">
        <h1 className="page-title">
          <i
            className="bi bi-house-heart-fill me-3"
            style={{ color: "var(--soft-blue)" }}
          />
          My Dashboard
        </h1>
        <p className="page-subtitle">
          Hello, <strong>{name || "Employee"}</strong>! Here's your wellness hub
          for today.
        </p>
      </div>

      <div className="row g-3 mb-4">
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

      <h5 className="mb-3 fw-semibold" style={{ color: "var(--primary-navy)" }}>
        <i className="bi bi-lightbulb-fill me-2" style={{ color: "#e8a838" }} />
        Daily Wellness Tips
      </h5>
      <div className="row g-3">
        {tips.map(({ icon, text, color }) => (
          <div className="col-12 col-sm-6 col-lg-3" key={text}>
            <div
              style={{
                background: "#fff",
                border: "1px solid var(--border-light)",
                borderRadius: 12,
                padding: "0.9rem 1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.85rem",
                boxShadow: "0 2px 8px rgba(53,88,114,0.06)",
              }}
            >
              <i
                className={`bi ${icon}`}
                style={{ color, fontSize: "1.4rem", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--muted-text)",
                  lineHeight: 1.5,
                }}
              >
                {text}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
