import { useState } from "react";

interface FaqItemData {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqItemData[] = [
  {
    q: "How do I enroll in a wellness program?",
    a: "Go to your Employee Dashboard and browse available programs under the 'New Programs' tab. Click 'Enroll Now' on any program card. Your manager will review and approve your enrollment request.",
  },
  {
    q: "How long does enrollment approval take?",
    a: "Enrollment approvals are typically processed by your manager within 1–2 business days. You will receive a notification once your request is approved or rejected.",
  },
  {
    q: "How do I complete a challenge within a program?",
    a: "Navigate to the 'Ongoing Programs' tab on your dashboard and expand the program card. You will see a checklist of all challenges. Check off each challenge as you complete it — progress is saved automatically.",
  },
  {
    q: "What happens after I complete all challenges?",
    a: "Once you have checked off all challenges in a program, a completion request is submitted to your manager for approval. After your manager approves it, the program moves to your 'Completed' tab.",
  },
  {
    q: "How do I set personal wellness goals?",
    a: "Click the 'My Goals' card on your dashboard to be redirected to the Goals module. You can create, track, and update your personal wellness goals there.",
  },
  {
    q: "How do I update my profile information?",
    a: "Go to the Profile page using the sidebar. You can edit your full name, department, and password. Email changes must be requested through the admin.",
  },
  {
    q: "Can I de-enroll from a program?",
    a: "Yes — open the program on the 'Ongoing Programs' tab and click the 'De-Enroll' button. Note that this removes all your progress data for that program.",
  },
  {
    q: "Why am I not receiving notifications?",
    a: "Check your notification preferences in Settings › Notification Preferences. Make sure the relevant notification type is enabled. Also ensure your manager has you properly assigned in the system.",
  },
  {
    q: "I get an error when enrolling — what should I do?",
    a: "The most common causes are: (1) Your manager has not been assigned yet — contact HR; (2) You are already enrolled in this program; (3) The enrollment window has closed. Contact HR for further assistance.",
  },
  {
    q: "How do I contact my manager or HR team?",
    a: "For urgent matters, reach out to your direct manager via your company's internal communication tools. For system issues, contact your HR administrator.",
  },
];

function FaqItem({ item }: { item: FaqItemData }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid var(--border-light)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="d-flex justify-content-between align-items-center w-100 py-3"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 12,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: "var(--primary-navy)",
            fontSize: "0.9rem",
          }}
        >
          <i
            className="bi bi-question-circle me-2"
            style={{ color: "var(--soft-blue)" }}
          />
          {item.q}
        </span>
        <i
          className={`bi bi-chevron-${open ? "up" : "down"}`}
          style={{ color: "var(--muted-text)", flexShrink: 0 }}
        />
      </button>
      {open && (
        <div
          className="animate__animated animate__fadeIn pb-3 ps-4"
          style={{
            color: "var(--muted-text)",
            fontSize: "0.875rem",
            lineHeight: 1.7,
          }}
        >
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function ActivityHelpPage() {
  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ margin: "0px auto", padding: "15px" }}
    >
      <div className="page-header mb-4">
        <h1 className="page-title">
          <i
            className="bi bi-patch-question me-3"
            style={{ color: "var(--soft-blue)" }}
          />
          FAQs
        </h1>
        <p className="page-subtitle">
          Frequently asked questions about WellnessTrack.
        </p>
      </div>
      <div className="prod-card">
        {FAQ_ITEMS.map((item, i) => (
          <FaqItem key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
