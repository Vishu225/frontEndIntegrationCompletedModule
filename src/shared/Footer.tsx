import { useState } from "react";

function LegalModal({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div
      className="modal-backdrop-custom animate__animated animate__fadeIn"
      onClick={onClose}
    >
      <div
        className="results-modal animate__animated animate__zoomIn"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 500 }}
      >
        <div className="results-modal-header">
          <h5
            style={{ fontWeight: 700, color: "var(--primary-navy)", margin: 0 }}
          >
            {title}
          </h5>
          <button className="btn-icon" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="results-modal-body">
          <p
            style={{
              color: "var(--muted-text)",
              lineHeight: 1.7,
              fontSize: "0.88rem",
            }}
          >
            This {title.toLowerCase()} governs the use of WellnessHub, the
            internal employee wellness and engagement management system. By
            accessing this platform, you agree to use it solely for authorised
            business purposes. All data is processed in compliance with
            applicable data protection laws. WellnessHub reserves the right to
            update this document at any time. For questions, contact your HR
            department or system administrator.
          </p>
          <p style={{ color: "var(--muted-text)", fontSize: "0.82rem" }}>
            Last updated: February 2026. Version 1.0.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [legalModal, setLegalModal] = useState<string | null>(null);
  return (
    <>
      <footer className="app-footer">
        <div className="footer-grid">
          <div>
            <div className="footer-brand-row">
              <div className="brand-icon footer-brand-icon">
                <i className="bi bi-heart-pulse-fill" />
              </div>
              <span className="footer-brand-name">WellnessHub</span>
            </div>
            <p className="footer-tagline">
              Internal Employee Wellness &amp; Engagement Management System
            </p>
          </div>
          <div>
            <div className="footer-section-heading">Platform</div>
            <button
              className="footer-link"
              onClick={() => (window.location.href = "/employee/dashboard")}
            >
              <i className="bi bi-speedometer2 footer-link-icon" /> Employee
              Dashboard
            </button>
            <button
              className="footer-link"
              onClick={() => (window.location.href = "/manager/dashboard")}
            >
              <i className="bi bi-person-check footer-link-icon" /> Manager
              Dashboard
            </button>
            <button
              className="footer-link"
              onClick={() => (window.location.href = "/profile")}
            >
              <i className="bi bi-person-circle footer-link-icon" /> My Profile
            </button>
          </div>
          <div>
            <div className="footer-section-heading">Support</div>
            <button
              className="footer-link"
              onClick={() => (window.location.href = "/help")}
            >
              <i className="bi bi-question-circle footer-link-icon" /> FAQs
            </button>
            <button
              className="footer-link"
              onClick={() => (window.location.href = "/settings")}
            >
              <i className="bi bi-gear footer-link-icon" /> Settings
            </button>
          </div>
          <div>
            <div className="footer-section-heading">Legal</div>
            <button
              className="footer-link"
              onClick={() => setLegalModal("Privacy Policy")}
            >
              <i className="bi bi-shield-check footer-link-icon" /> Privacy
              Policy
            </button>
            <button
              className="footer-link"
              onClick={() => setLegalModal("Terms of Service")}
            >
              <i className="bi bi-file-text footer-link-icon" /> Terms of
              Service
            </button>
            <div
              style={{
                marginTop: "1rem",
                fontSize: "0.72rem",
                color: "var(--muted-text)",
              }}
            >
              © 2026 WellnessHub
            </div>
          </div>
        </div>
      </footer>
      {legalModal && (
        <LegalModal title={legalModal} onClose={() => setLegalModal(null)} />
      )}
    </>
  );
}
