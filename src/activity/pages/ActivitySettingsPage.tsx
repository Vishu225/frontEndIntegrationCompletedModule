import { useState } from "react";
import { useAuth } from "../../shared/AuthContext";
import { useToast } from "../../shared/useToast";
import axiosInstance from "../../shared/axiosInstance";

interface NotifType {
  key: string;
  label: string;
  desc: string;
  icon: string;
}
const NOTIF_TYPES: NotifType[] = [
  {
    key: "SURVEY",
    label: "Survey Notifications",
    desc: "Get notified when new surveys are available",
    icon: "clipboard-check",
  },
  {
    key: "CHALLENGE",
    label: "Challenge Notifications",
    desc: "Updates on wellness challenges and milestones",
    icon: "trophy",
  },
  {
    key: "GOAL",
    label: "Goal Notifications",
    desc: "Reminders and updates about your personal goals",
    icon: "bullseye",
  },
  {
    key: "PROGRAM",
    label: "Program Notifications",
    desc: "Enrollment approvals and new program alerts",
    icon: "stars",
  },
  {
    key: "SYSTEM",
    label: "System Notifications",
    desc: "Important system announcements and maintenance",
    icon: "gear",
  },
];

const getErrMsg = (err: unknown): string => {
  const e = err as { response?: { data?: unknown } };
  const d = e.response?.data ?? "An error occurred.";
  return typeof d === "string"
    ? d
    : ((d as { message?: string })?.message ?? JSON.stringify(d));
};

function SectionCard({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="prod-card mb-3" style={{padding:"15px"}}>
      <button
        onClick={onToggle}
        className="d-flex justify-content-between align-items-center w-100"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="header-icon">
            <i className={`bi bi-${icon}`} />
          </div>
          <span
            className="fw-bold"
            style={{ color: "var(--primary-navy)", fontSize: "0.95rem" }}
          >
            {title}
          </span>
        </div>
        <i
          className={`bi bi-chevron-${expanded ? "up" : "down"}`}
          style={{ color: "var(--muted-text)" }}
        />
      </button>
      {expanded && (
        <div
          className="animate__animated animate__fadeIn mt-3 pt-3"
          style={{ borderTop: "1px solid var(--border-light)" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function ActivitySettingsPage() {
  const { email } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [openSection, setOpenSection] = useState<string | null>("account");
  const [accountForm, setAccountForm] = useState({
    fullName: "",
    department: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountErrors, setAccountErrors] = useState<
    Partial<typeof accountForm>
  >({});
  const [notifPrefs, setNotifPrefs] = useState<Record<string, boolean>>(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("notificationPrefs") ?? "{}",
      ) as Record<string, boolean>;
      return Object.fromEntries(
        NOTIF_TYPES.map(({ key }) => [
          key,
          saved[key] !== undefined ? saved[key] : true,
        ]),
      );
    } catch {
      return Object.fromEntries(NOTIF_TYPES.map(({ key }) => [key, true]));
    }
  });

  const toggleSection = (key: string) =>
    setOpenSection((p) => (p === key ? null : key));

  const validateAccount = (): boolean => {
    const e: Partial<typeof accountForm> = {};
    if (!accountForm.fullName.trim()) e.fullName = "Name is required.";
    if (accountForm.newPassword && accountForm.newPassword.length < 6)
      e.newPassword = "Min. 6 characters.";
    if (
      accountForm.newPassword &&
      accountForm.newPassword !== accountForm.confirmPassword
    )
      e.confirmPassword = "Passwords do not match.";
    setAccountErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAccount()) return;
    setSavingAccount(true);
    const payload: Record<string, string> = {
      fullName: accountForm.fullName,
      department: accountForm.department,
    };
    if (accountForm.newPassword) payload.password = accountForm.newPassword;
    try {
      await axiosInstance.put("/updateProfile", payload);
      showToast("Account settings saved successfully!", "success");
      setAccountForm((f) => ({ ...f, newPassword: "", confirmPassword: "" }));
    } catch (err) {
      showToast(getErrMsg(err), "error");
    } finally {
      setSavingAccount(false);
    }
  };

  const set =
    (field: keyof typeof accountForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setAccountForm((f) => ({ ...f, [field]: e.target.value }));

  const handleNotifChange = (key: string, value: boolean) => {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    localStorage.setItem("notificationPrefs", JSON.stringify(updated));
    showToast(
      `${key} notifications ${value ? "enabled" : "disabled"}.`,
      "info",
    );
  };

  const setAllNotifs = (value: boolean) => {
    const all = Object.fromEntries(NOTIF_TYPES.map(({ key }) => [key, value]));
    setNotifPrefs(all);
    localStorage.setItem("notificationPrefs", JSON.stringify(all));
    showToast(
      `All notifications ${value ? "enabled" : "disabled"}.`,
      value ? "success" : "info",
    );
  };

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ padding: "2.2rem" , margin:"0px auto" }}
    >
      <ToastContainer />
      <div className="page-header mb-4">
        <h1 className="page-title">
          <i
            className="bi bi-sliders me-3"
            style={{ color: "var(--soft-blue)" }}
          />
          Settings
        </h1>
        <p className="page-subtitle">
          Manage your account and notification preferences.
        </p>
      </div>

      <SectionCard
        title="Account Settings"
        icon="person-gear"
        expanded={openSection === "account"}
        onToggle={() => toggleSection("account")}
      >
        <form onSubmit={handleSaveAccount}>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--muted-text)",
              marginBottom: "1.2rem",
            }}
          >
            Signed in as <strong>{email}</strong>
          </p>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  className="input-field"
                  value={accountForm.fullName}
                  onChange={set("fullName")}
                  placeholder="Your full name"
                />
                {accountErrors.fullName && (
                  <div className="form-error">{accountErrors.fullName}</div>
                )}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label>Department</label>
                <input
                  className="input-field"
                  value={accountForm.department}
                  onChange={set("department")}
                  placeholder="e.g. Engineering, HR"
                />
              </div>
            </div>
          </div>
          <p
            className="fw-semibold mb-2"
            style={{ fontSize: "0.85rem", color: "var(--primary-navy)" }}
          >
            <i className="bi bi-lock me-2" />
            Change Password{" "}
            <span style={{ fontWeight: 400, color: "var(--muted-text)" }}>
              (leave blank to keep current)
            </span>
          </p>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label>New Password</label>
                <input
                  className="input-field"
                  type="password"
                  value={accountForm.newPassword}
                  onChange={set("newPassword")}
                  placeholder="Min. 6 characters"
                />
                {accountErrors.newPassword && (
                  <div className="form-error">{accountErrors.newPassword}</div>
                )}
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Re-enter new password"
                  value={accountForm.confirmPassword}
                  onChange={set("confirmPassword")}
                />
                {accountErrors.confirmPassword && (
                  <div className="form-error">
                    {accountErrors.confirmPassword}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button type="submit" className="btn-grad" disabled={savingAccount}>
            {savingAccount ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving…
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-1" />
                Save Account Settings
              </>
            )}
          </button>
        </form>
      </SectionCard>

      <SectionCard
        title="Notification Preferences"
        icon="bell"
        expanded={openSection === "notifications"}
        onToggle={() => toggleSection("notifications")}
      >
        <div className="d-flex gap-2 mb-3">
          <button
            className="btn-success-theme"
            style={{ fontSize: "0.82rem" }}
            onClick={() => setAllNotifs(true)}
          >
            <i className="bi bi-bell me-1" />
            Enable All
          </button>
          <button
            className="btn-outline-theme"
            style={{ fontSize: "0.82rem" }}
            onClick={() => setAllNotifs(false)}
          >
            <i className="bi bi-bell-slash me-1" />
            Disable All
          </button>
        </div>
        {NOTIF_TYPES.map(({ key, label, desc, icon }) => (
          <div
            key={key}
            className="d-flex align-items-center gap-3 py-3"
            style={{ borderBottom: "1px solid var(--border-light)" }}
          >
            <div className="header-icon" style={{ width: 38, height: 38 }}>
              <i className={`bi bi-${icon}`} />
            </div>
            <div className="flex-fill">
              <div
                className="fw-semibold"
                style={{ fontSize: "0.88rem", color: "var(--primary-navy)" }}
              >
                {label}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted-text)" }}>
                {desc}
              </div>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                gap: 8,
              }}
            >
              <input
                type="checkbox"
                checked={!!notifPrefs[key]}
                onChange={(e) => handleNotifChange(key, e.target.checked)}
                style={{ width: 18, height: 18, cursor: "pointer" }}
              />
              <span
                style={{
                  fontSize: "0.8rem",
                  color: notifPrefs[key] ? "#27ae60" : "var(--muted-text)",
                  fontWeight: 600,
                }}
              >
                {notifPrefs[key] ? "On" : "Off"}
              </span>
            </label>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}
