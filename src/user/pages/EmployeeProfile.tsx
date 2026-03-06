import { JSX, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import { useAuth } from "../../shared/AuthContext";
import axiosInstance from "../../shared/axiosInstance";

interface UserProfile {
  userId: number;
  name: string;
  email: string;
  department: string;
  managerId: number | null;
  role: string;
  status: string;
  createdAt?: string | number[];
}

export default function EmployeeProfile(): JSX.Element {
  const { userId, role, logout, name, email } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    email: "",
    name: "",
    password: "",
    department: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // /updateProfile and /deleteProfile are EMPLOYEE-only endpoints
  const canEdit = role === "EMPLOYEE";

  const fetchProfile = async () => {
    if (!userId) return;
    try {
      const res = await axiosInstance.get<UserProfile>(
        `/viewProfile/${userId}`,
      );
      setProfile(res.data);
      setEditForm({
        email: res.data.email,
        name: res.data.name,
        password: "",
        department: res.data.department,
      });
    } catch {
      // Last-resort placeholder so the page never stays blank
      setProfile({
        userId: userId,
        name: name ?? "—",
        email: email ?? "—",
        department: "—",
        managerId: null,
        role: role ?? "—",
        status: "ACTIVE",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!editForm.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!editForm.password || editForm.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!editForm.department.trim()) {
      toast.error("Department is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await axiosInstance.put<string>("/updateProfile", editForm);
      toast.success(
        typeof res.data === "string" ? res.data : "Profile updated!",
      );
      setIsEditing(false);
      await fetchProfile();
    } catch (error: unknown) {
      const e = error as { response?: { data?: unknown } };
      toast.error(
        typeof e.response?.data === "string"
          ? e.response.data
          : (e.response?.data as { message?: string })?.message ||
              "Update failed.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      const res = await axiosInstance.delete<string>(
        `/deleteProfile/${userId}`,
      );
      toast.success(
        typeof res.data === "string" ? res.data : "Account deactivated.",
      );
      setTimeout(() => logout(), 1200);
    } catch (error: unknown) {
      const e = error as { response?: { data?: unknown } };
      toast.error(
        typeof e.response?.data === "string"
          ? e.response.data
          : (e.response?.data as { message?: string })?.message ||
              "Deactivation failed.",
      );
    } finally {
      setShowDeactivate(false);
    }
  };

  const formatDate = (d?: string | number[]) => {
    if (!d) return "—";
    // LocalDateTime serialized as array [year, month, day, hour, min, sec]
    if (Array.isArray(d)) {
      const [yr, mo, day] = d as number[];
      return new Date(yr, mo - 1, day).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    const parsed = new Date(d);
    return isNaN(parsed.getTime())
      ? "—"
      : parsed.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };
  const roleStyle: Record<string, { bg: string; color: string; icon: string }> =
    {
      ADMIN: {
        bg: "rgba(53,88,114,0.08)",
        color: "var(--primary-navy)",
        icon: "bi-shield-check",
      },
      MANAGER: {
        bg: "rgba(111,66,193,0.1)",
        color: "#6f42c1",
        icon: "bi-briefcase",
      },
      EMPLOYEE: {
        bg: "rgba(156,213,255,0.25)",
        color: "var(--soft-blue)",
        icon: "bi-person",
      },
    };

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ padding: "2.2rem", margin: "0px auto" }}
    >
      <Toaster position="top-right" />
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="header-icon">
          <i className="bi bi-person-vcard" />
        </div>
        <div>
          <h2
            className="fw-bold mb-0"
            style={{ color: "var(--primary-navy)", fontSize: "1.5rem" }}
          >
            My Profile
          </h2>
          <p
            className="mb-0"
            style={{ color: "var(--muted-text)", fontSize: "0.88rem" }}
          >
            {canEdit
              ? "View and manage your account information"
              : "Your account information"}
          </p>
        </div>
      </div>

      {loading ? (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ minHeight: "40vh" }}
        >
          <div style={{ textAlign: "center" }}>
            <i
              className="bi bi-arrow-repeat"
              style={{
                fontSize: "2.5rem",
                color: "var(--soft-blue)",
                display: "block",
                animation: "spin 1s linear infinite",
              }}
            />
            <p className="mt-2" style={{ color: "var(--muted-text)" }}>
              Loading profile…
            </p>
          </div>
        </div>
      ) : profile ? (
        <div style={{ maxWidth: 680 }}>
          {!isEditing && (
            <div className="prod-card animate__animated animate__fadeIn" style={{padding:"20px"}}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, var(--primary-navy), var(--soft-blue))",
                  borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                  padding: "2rem 2.25rem",
                  margin: "-2.25rem -2.25rem 2rem -2.25rem",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -40,
                    right: -40,
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                    pointerEvents: "none",
                  }}
                />
                <div className="d-flex align-items-center gap-4">
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.2)",
                      border: "3px solid rgba(255,255,255,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      fontWeight: 800,
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3
                      className="fw-bold mb-1"
                      style={{ color: "white", fontSize: "1.3rem" }}
                    >
                      {profile.name}
                    </h3>
                    <p
                      className="mb-0"
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "0.88rem",
                      }}
                    >
                      <i className="bi bi-envelope me-1" />
                      {profile.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="row g-3 mb-4">
                {[
                  {
                    label: "Department",
                    icon: "bi-building",
                    iconColor: "var(--soft-blue)",
                    content: (
                      <p
                        className="mb-0 fw-semibold"
                        style={{
                          color: "var(--primary-navy)",
                          fontSize: "0.92rem",
                        }}
                      >
                        {profile.department}
                      </p>
                    ),
                  },
                  {
                    label: "Role",
                    icon: roleStyle[profile.role]?.icon ?? "bi-person",
                    iconColor: roleStyle[profile.role]?.color,
                    content: (
                      <span
                        className="role-badge"
                        style={{
                          background: roleStyle[profile.role]?.bg,
                          color: roleStyle[profile.role]?.color,
                          display: "inline-flex",
                        }}
                      >
                        <i
                          className={`bi ${roleStyle[profile.role]?.icon ?? "bi-person"} me-1`}
                        />
                        {profile.role}
                      </span>
                    ),
                  },
                  {
                    label: "Status",
                    icon:
                      profile.status === "ACTIVE"
                        ? "bi-check-circle-fill"
                        : "bi-x-circle-fill",
                    iconColor:
                      profile.status === "ACTIVE" ? "#27ae60" : "#e74c3c",
                    content: (
                      <span
                        className={`status-pill ${profile.status === "ACTIVE" ? "active" : "inactive"}`}
                      >
                        {profile.status}
                      </span>
                    ),
                  },
                  {
                    label: "Manager ID",
                    icon: "bi-person-badge",
                    iconColor: "var(--soft-blue)",
                    content: (
                      <p
                        className="mb-0 fw-semibold"
                        style={{
                          color: "var(--primary-navy)",
                          fontSize: "0.92rem",
                        }}
                      >
                        {profile.managerId ?? (
                          <span
                            style={{
                              color: "var(--muted-text)",
                              fontStyle: "italic",
                              fontWeight: 400,
                            }}
                          >
                            Not assigned
                          </span>
                        )}
                      </p>
                    ),
                  },
                  {
                    label: "User ID",
                    icon: "bi-fingerprint",
                    iconColor: "#e67e22",
                    content: (
                      <p
                        className="mb-0 fw-semibold"
                        style={{
                          color: "var(--primary-navy)",
                          fontSize: "0.92rem",
                        }}
                      >
                        #{profile.userId}
                      </p>
                    ),
                  },
                  {
                    label: "Member Since",
                    icon: "bi-calendar3",
                    iconColor: "var(--soft-blue)",
                    content: (
                      <p
                        className="mb-0 fw-semibold"
                        style={{
                          color: "var(--primary-navy)",
                          fontSize: "0.92rem",
                        }}
                      >
                        {formatDate(profile.createdAt)}
                      </p>
                    ),
                  },
                ].map(({ label, icon, iconColor, content }) => (
                  <div key={label} className="col-6">
                    <div
                      style={{
                        background: "var(--bg-cream)",
                        border: "1px solid rgba(122,170,206,0.18)",
                        borderRadius: 14,
                        padding: "1.1rem 1.25rem",
                        height: "100%",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: 9,
                            flexShrink: 0,
                            background: "var(--white)",
                            border: "1px solid rgba(122,170,206,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: iconColor,
                            fontSize: "0.85rem",
                          }}
                        >
                          <i className={`bi ${icon}`} />
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            color: "var(--muted-text)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {label}
                        </p>
                      </div>
                      {content}
                    </div>
                  </div>
                ))}
              </div>

              {canEdit && (
                <div
                  className="d-flex gap-3 pt-4 mt-1"
                  style={{ borderTop: "1px solid var(--border-light)" }}
                >
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-grad"
                    style={{ padding: "10px 20px", fontSize: "0.88rem" }}
                  >
                    <i className="bi bi-pencil-square" /> Edit Profile
                  </button>
                  <button
                    onClick={() => setShowDeactivate(true)}
                    className="action-btn delete"
                    style={{
                      width: "auto",
                      padding: "10px 20px",
                      fontSize: "0.88rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <i className="bi bi-person-dash" /> Deactivate Account
                  </button>
                </div>
              )}
            </div>
          )}

          {canEdit && isEditing && (
            <div className="prod-card animate__animated animate__fadeIn">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-md)",
                    background:
                      "linear-gradient(135deg, var(--primary-navy), var(--soft-blue))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.2rem",
                  }}
                >
                  <i className="bi bi-pencil-square" />
                </div>
                <div>
                  <h4
                    className="fw-bold mb-0"
                    style={{ color: "var(--primary-navy)" }}
                  >
                    Edit Profile
                  </h4>
                  <p
                    className="mb-0"
                    style={{ color: "var(--muted-text)", fontSize: "0.82rem" }}
                  >
                    Update your account information
                  </p>
                </div>
              </div>
              <div className="form-group mb-4">
                <label>Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  className="input-field"
                  style={{
                    background: "#f0f4f8",
                    color: "var(--muted-text)",
                    cursor: "not-allowed",
                  }}
                />
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--muted-text)",
                    marginTop: 4,
                    marginBottom: 0,
                  }}
                >
                  Email cannot be changed
                </p>
              </div>
              <div className="form-group mb-4">
                <label>Full Name</label>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="input-field"
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group mb-4">
                <label>New Password</label>
                <div className="position-relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={editForm.password}
                    onChange={handleEditChange}
                    className="input-field"
                    placeholder="Enter new password (min 6 chars)"
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--muted-text)",
                      cursor: "pointer",
                    }}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                    />
                  </button>
                </div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--muted-text)",
                    marginTop: 4,
                    marginBottom: 0,
                  }}
                >
                  Password will be re-encoded on save
                </p>
              </div>
              <div className="form-group mb-5">
                <label>Department</label>
                <input
                  name="department"
                  value={editForm.department}
                  onChange={handleEditChange}
                  className="input-field"
                  placeholder="Your department"
                />
              </div>
              <div className="d-flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-grad"
                  style={{ flex: 1, opacity: saving ? 0.7 : 1 }}
                >
                  {saving ? (
                    <>
                      <i
                        className="bi bi-arrow-repeat"
                        style={{ animation: "spin 1s linear infinite" }}
                      />{" "}
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg" /> Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm((p) => ({ ...p, password: "" }));
                  }}
                  className="action-btn close-btn"
                  style={{
                    width: "auto",
                    padding: "10px 20px",
                    fontSize: "0.88rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <i className="bi bi-x-lg" /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <i className="bi bi-person-x" style={{ fontSize: "3rem" }} />
          <p className="mt-2">No profile data found.</p>
        </div>
      )}

      {canEdit && (
        <ConfirmModal
          isOpen={showDeactivate}
          title="Deactivate Account"
          message="Are you sure you want to deactivate your account? This will log you out immediately."
          onConfirm={handleDeactivate}
          onCancel={() => setShowDeactivate(false)}
          confirmLabel="Deactivate"
        />
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
