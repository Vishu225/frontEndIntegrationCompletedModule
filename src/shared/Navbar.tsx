import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axiosInstance from "./axiosInstance";

interface Notification {
  id?: number;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt?: string;
}

export default function Navbar() {
  const { role, name, email, logout, userId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get(
        `/api/notifications/user/${userId}?page=0&size=10`,
      );
      const data: Notification[] = res.data?.content || res.data || [];
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {
      // ignore
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchNotifications();
    const token = localStorage.getItem("token");
    const url = `http://localhost:8089/api/notifications/subscribe/${userId}${token ? `?token=${token}` : ""}`;
    eventSourceRef.current = new EventSource(url);
    eventSourceRef.current.onmessage = (event) => {
      try {
        const notif: Notification = JSON.parse(event.data as string);
        setNotifications((prev) => [notif, ...prev]);
        setUnreadCount((c) => c + 1);
      } catch {
        // non-JSON ping
      }
    };
    eventSourceRef.current.onerror = () => {
      eventSourceRef.current?.close();
    };
    return () => eventSourceRef.current?.close();
  }, [userId, fetchNotifications]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const linkClass = (path: string) =>
    `nav-item${isActive(path) ? " active" : ""}`;

  // Role-based dashboard path
  const dashboardPath =
    role === "ADMIN"
      ? "/admin/dashboard"
      : role === "MANAGER"
        ? "/manager/dashboard"
        : "/employee/dashboard";

  const profilePath =
    role === "ADMIN"
      ? "/admin/profile"
      : role === "MANAGER"
        ? "/manager/profile"
        : "/employee/profile";

  const displayName = name ?? email ?? "User";

  return (
    <nav className="modern-nav d-flex flex-column">
      {/* Brand */}
      <div className="nav-brand mb-3">
        <div className="brand-icon">
          <i className="bi bi-heart-pulse-fill" />
        </div>
        <span className="brand-name">WellnessHub</span>
      </div>

      {/* User info + role badge */}
      <div className="px-2 mb-3">
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--muted-text)",
            marginBottom: "0.3rem",
          }}
        >
          Welcome,{" "}
          <strong style={{ color: "var(--primary-navy)" }}>
            {displayName}
          </strong>
        </p>
        <span
          className={`role-badge ${
            role === "ADMIN"
              ? "role-admin"
              : role === "MANAGER"
                ? "role-manager"
                : "role-employee"
          }`}
        >
          <i
            className={`bi ${
              role === "ADMIN"
                ? "bi-shield-check"
                : role === "MANAGER"
                  ? "bi-briefcase"
                  : "bi-person"
            } me-1`}
          />
          {role}
        </span>
      </div>

      {/* Nav items */}
      <div className="d-flex flex-column gap-1 flex-grow-1">
        <Link to={dashboardPath} className={linkClass(dashboardPath)}>
          <i className="bi bi-speedometer2" /> Dashboard
        </Link>

        {/* ADMIN-only */}
        {role === "ADMIN" && (
          <>
            <Link to="/admin/users" className={linkClass("/admin/users")}>
              <i className="bi bi-people" /> User Management
            </Link>
            <Link
              to="/programs/manage"
              className={linkClass("/programs/manage")}
            >
              <i className="bi bi-collection" /> Programs
            </Link>
            <Link
              to="/admin/challenges"
              className={linkClass("/admin/challenges")}
            >
              <i className="bi bi-trophy" /> Challenges
            </Link>
            <Link to="/analytics" className={linkClass("/analytics")}>
              <i className="bi bi-bar-chart-line" /> Analytics
            </Link>
            <Link to="/survey" className={linkClass("/survey")}>
              <i className="bi bi-clipboard-data" /> Surveys
            </Link>
          </>
        )}

        {/* MANAGER-only */}
        {role === "MANAGER" && (
          <>
            <Link
              to="/manager/activity"
              className={linkClass("/manager/activity")}
            >
              <i className="bi bi-activity" /> Activity
            </Link>
            <Link
              to="/manager/challenges"
              className={linkClass("/manager/challenges")}
            >
              <i className="bi bi-trophy" /> Challenges
            </Link>
            <Link to="/manager/goals" className={linkClass("/manager/goals")}>
              <i className="bi bi-bullseye" /> Goals
            </Link>
            <Link to="/survey" className={linkClass("/survey")}>
              <i className="bi bi-clipboard-data" /> Surveys
            </Link>
          </>
        )}

        {/* EMPLOYEE-only */}
        {role === "EMPLOYEE" && (
          <>
            <Link
              to="/employee/activity"
              className={linkClass("/employee/activity")}
            >
              <i className="bi bi-activity" /> Activity
            </Link>
            <Link to="/employee/goals" className={linkClass("/employee/goals")}>
              <i className="bi bi-bullseye" /> My Goals
            </Link>
            <Link
              to="/survey/employee"
              className={linkClass("/survey/employee")}
            >
              <i className="bi bi-clipboard-data" /> Surveys
            </Link>
          </>
        )}

        {/* All roles */}
        <Link to={profilePath} className={linkClass(profilePath)}>
          <i className="bi bi-person-circle" /> My Profile
        </Link>

        {(role === "EMPLOYEE" || role === "MANAGER") && (
          <>
            <Link to="/settings" className={linkClass("/settings")}>
              <i className="bi bi-gear" /> Settings
            </Link>
            <Link to="/help" className={linkClass("/help")}>
              <i className="bi bi-question-circle" /> FAQs
            </Link>
          </>
        )}

        {/* Notifications bell */}
        <button
          className={`nav-item${isActive("/notifications") ? " active" : ""}`}
          style={{ position: "relative" }}
          onClick={() => {
            setUnreadCount(0);
            setNotifications((prev) =>
              prev.map((n) => ({ ...n, isRead: true })),
            );
            navigate("/notifications");
          }}
        >
          <i className="bi bi-bell" /> Notifications
          {unreadCount > 0 && (
            <span
              className="animate__animated animate__bounceIn"
              style={{
                position: "absolute",
                top: 6,
                right: 10,
                background: "#e74c3c",
                color: "white",
                borderRadius: "50%",
                width: 18,
                height: 18,
                fontSize: "0.65rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Logout */}
      <button onClick={handleLogout} className="nav-item logout-btn mt-auto">
        <i className="bi bi-box-arrow-left" /> Logout
      </button>
    </nav>
  );
}
