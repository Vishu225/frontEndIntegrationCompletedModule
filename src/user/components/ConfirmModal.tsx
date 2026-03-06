import { JSX } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmClass?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
}: ConfirmModalProps): JSX.Element | null {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="results-modal animate__animated animate__zoomIn animate__faster"
        style={{ maxWidth: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="results-modal-header">
          <h3
            className="fw-bold mb-0"
            style={{ color: "var(--primary-navy)", fontSize: "1rem" }}
          >
            <i
              className="bi bi-exclamation-triangle-fill me-2"
              style={{ color: "var(--danger)" }}
            />
            {title}
          </h3>
        </div>
        <div className="results-modal-body">
          <p
            style={{
              color: "var(--muted-text)",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
            }}
          >
            {message}
          </p>
          <div className="d-flex gap-3">
            <button
              onClick={onConfirm}
              className="action-btn delete"
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
              }}
            >
              {confirmLabel}
            </button>
            <button
              onClick={onCancel}
              className="action-btn close-btn"
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "var(--radius-md)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
