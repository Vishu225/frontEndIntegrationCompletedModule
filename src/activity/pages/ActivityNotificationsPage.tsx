import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../shared/AuthContext";
import { getNotifications } from "../api/notificationService";

interface Notification {
  id?: number;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt?: string;
}

const formatTime = (dt?: string) =>
  dt
    ? new Date(dt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const getTypeIcon = (type?: string) => {
  switch ((type ?? "").toUpperCase()) {
    case "ENROLLMENT":
      return "bi-person-plus";
    case "COMPLETION":
      return "bi-trophy";
    case "APPROVAL":
      return "bi-check-circle";
    case "REJECTION":
      return "bi-x-circle";
    default:
      return "bi-bell";
  }
};

const typeColor = (type?: string) => {
  switch ((type ?? "").toUpperCase()) {
    case "ENROLLMENT":
      return { bg: "rgba(122,170,206,0.15)", color: "var(--primary-navy)" };
    case "COMPLETION":
      return { bg: "rgba(68,179,126,0.12)", color: "#27ae60" };
    case "APPROVAL":
      return { bg: "rgba(68,179,126,0.12)", color: "#27ae60" };
    case "REJECTION":
      return { bg: "rgba(231,76,60,0.1)", color: "#e74c3c" };
    default:
      return { bg: "rgba(122,170,206,0.1)", color: "var(--soft-blue)" };
  }
};

export default function ActivityNotificationsPage() {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(false);
    try {
      const res = await getNotifications(String(userId), 0, 50);
      const data: Notification[] = res.data?.content || res.data || [];
      setNotifications(data.map((n) => ({ ...n, isRead: true })));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ padding: "2.2rem", margin: "0px auto" }}
    >
      <div className="page-header mb-4">
        <h1 className="page-title">
          <i
            className="bi bi-bell-fill me-3"
            style={{ color: "var(--soft-blue)" }}
          />
          Notifications
        </h1>
        <p className="page-subtitle">All your activity updates and alerts.</p>
      </div>

      <div className="prod-card" style={{ padding: "15px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2
            className="fw-bold mb-0"
            style={{ fontSize: "1rem", color: "var(--primary-navy)" }}
          >
            <i className="bi bi-inbox me-2" />
            Inbox
            {notifications.length > 0 && (
              <span
                style={{
                  background: "rgba(53,88,114,0.1)",
                  borderRadius: 10,
                  padding: "1px 8px",
                  fontSize: "0.75rem",
                  marginLeft: 8,
                }}
              >
                {notifications.length}
              </span>
            )}
          </h2>
          <button
            className="btn-outline-theme"
            style={{ fontSize: "0.82rem" }}
            onClick={fetchNotifications}
            disabled={loading}
          >
            {loading ? (
              <i
                className="bi bi-arrow-clockwise"
                style={{
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                }}
              />
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-1" />
                Refresh
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <i
              className="bi bi-arrow-clockwise"
              style={{
                fontSize: "2rem",
                color: "var(--soft-blue)",
                animation: "spin 1s linear infinite",
                display: "block",
                marginBottom: 8,
              }}
            />
            <span style={{ color: "var(--muted-text)" }}>
              Loading notifications…
            </span>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-info py-2 px-3">
            <i className="bi bi-exclamation-circle me-1" />
            Could not load notifications. Please check that the backend is
            running.
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="empty-state">
            <i
              className="bi bi-bell-slash"
              style={{ fontSize: "2.5rem", display: "block", marginBottom: 8 }}
            />
            <div className="fw-semibold">No notifications yet</div>
            <div style={{ color: "var(--muted-text)", fontSize: "0.85rem" }}>
              You'll see enrollment approvals, completions, and alerts here.
            </div>
          </div>
        )}

        {!loading && !error && notifications.length > 0 && (
          <div>
            {notifications.map((n, i) => {
              const { bg, color } = typeColor(n.type);
              return (
                <div
                  key={n.id ?? i}
                  className="d-flex gap-3 py-3 animate__animated animate__fadeIn"
                  style={{
                    borderBottom: "1px solid var(--border-light)",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color,
                      fontSize: "1.1rem",
                    }}
                  >
                    <i className={`bi ${getTypeIcon(n.type)}`} />
                  </div>
                  <div className="flex-fill">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 10,
                          background: bg,
                          color,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {n.type ?? "SYSTEM"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted-text)",
                        }}
                      >
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.85rem",
                        color: "var(--text-dark)",
                        lineHeight: 1.5,
                      }}
                    >
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
