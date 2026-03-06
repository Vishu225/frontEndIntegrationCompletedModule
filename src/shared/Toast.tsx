import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3500,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 400);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const colors: Record<string, { bg: string; icon: string; border: string }> = {
    success: {
      bg: "rgba(39,174,96,0.12)",
      icon: "bi-check-circle-fill",
      border: "rgba(39,174,96,0.3)",
    },
    error: {
      bg: "rgba(231,76,60,0.1)",
      icon: "bi-x-circle-fill",
      border: "rgba(231,76,60,0.25)",
    },
    info: {
      bg: "rgba(122,170,206,0.12)",
      icon: "bi-info-circle-fill",
      border: "rgba(122,170,206,0.3)",
    },
  };
  const c = colors[type] || colors.info;
  const textColor =
    type === "success"
      ? "#27ae60"
      : type === "error"
        ? "var(--danger)"
        : "var(--soft-blue)";

  return (
    <div
      className={`animate__animated ${visible ? "animate__fadeInRight" : "animate__fadeOutRight"}`}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: "var(--radius-sm)",
        padding: "0.85rem 1.1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        minWidth: 260,
        maxWidth: 380,
        boxShadow: "var(--shadow-md)",
        color: textColor,
        fontWeight: 600,
        fontSize: "0.88rem",
      }}
    >
      <i
        className={`bi ${c.icon}`}
        style={{ fontSize: "1rem", flexShrink: 0 }}
      />
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: textColor,
            padding: "2px 4px",
            borderRadius: 6,
          }}
        >
          <i className="bi bi-x" />
        </button>
      )}
    </div>
  );
}
