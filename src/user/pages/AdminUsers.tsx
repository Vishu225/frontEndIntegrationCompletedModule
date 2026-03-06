import { JSX, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import EditUserModal from "../components/EditUserModal";
import AddUserModal from "../components/AddUserModal";
import ConfirmModal from "../components/ConfirmModal";
import RoleBadge from "../components/RoleBadge";
import StatusBadge from "../components/StatusBadge";
import axiosInstance from "../../shared/axiosInstance";

interface User {
  userId: number;
  name: string;
  email: string;
  department: string;
  managerId: number | null;
  role: string;
  status: string;
  createdAt: string | null;
}

export default function AdminUsers(): JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const PAGE_SIZE = 10;
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const loadUsers = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<User[]>("/viewAllUsers");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (): Promise<void> => {
    if (!deleteUser) return;
    try {
      const res = await axiosInstance.delete<string>(
        `/deleteUserAdmin/${deleteUser.userId}`,
      );
      const msg =
        typeof res.data === "string"
          ? res.data
          : `${deleteUser.name} has been deactivated.`;
      toast.success(msg);
      setDeleteUser(null);
      loadUsers();
    } catch (error: unknown) {
      const e = error as { response?: { data?: unknown } };
      const msg =
        typeof e.response?.data === "string"
          ? (e.response.data as string)
          : (e.response?.data as { message?: string })?.message ||
            "Delete failed.";
      toast.error(msg);
      setDeleteUser(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const managerCount = users.filter((u) => u.role === "MANAGER").length;

  const statData = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: "bi-people-fill",
      accent: "#e67e22",
    },
    {
      label: "Active Users",
      value: activeUsers,
      icon: "bi-person-check-fill",
      accent: "#27ae60",
    },
    {
      label: "Managers",
      value: managerCount,
      icon: "bi-briefcase-fill",
      accent: "#6f42c1",
    },
    {
      label: "Admins",
      value: adminCount,
      icon: "bi-shield-fill-check",
      accent: "var(--primary-navy)",
    },
  ];

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ margin: "0px auto" }}
    >
      <Toaster position="top-right" />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="header-icon" style={{ width: 48, height: 48 }}>
            <i className="bi bi-people-fill" />
          </div>
          <div>
            <h2
              className="fw-bold mb-0"
              style={{ color: "var(--primary-navy)", fontSize: "1.45rem" }}
            >
              User Management
            </h2>
            <p
              className="mb-0"
              style={{ color: "var(--muted-text)", fontSize: "0.83rem" }}
            >
              {totalUsers} total users · {activeUsers} active
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="btn-grad"
          style={{ gap: 8, padding: "10px 20px" }}
        >
          <i className="bi bi-person-plus-fill" /> Add User
        </button>
      </div>

      <div className="stats-grid">
        {statData.map((s) => (
          <div key={s.label} className="stat-card">
            <div
              className="stat-icon"
              style={{
                margin: 0,
                width: 46,
                height: 46,
                borderRadius: 12,
                flexShrink: 0,
                background: `${s.accent}22`,
                color: s.accent,
              }}
            >
              <i className={`bi ${s.icon}`} />
            </div>
            <div>
              <div className="stat-number" style={{ fontSize: "1.55rem" }}>
                {s.value}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-3 mb-4 p-3"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(122,170,206,0.15)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="position-relative mb-3">
          <i
            className="bi bi-search position-absolute"
            style={{
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted-text)",
              fontSize: "0.85rem",
              pointerEvents: "none",
            }}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name, email or department…"
            className="input-field"
            style={{ paddingLeft: "2.4rem", fontSize: "0.85rem" }}
          />
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--muted-text)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginRight: 4,
            }}
          >
            Role
          </span>
          {(["", "EMPLOYEE", "MANAGER", "ADMIN"] as const).map((r) => {
            const active = roleFilter === r;
            const labels: Record<string, string> = {
              "": "All",
              EMPLOYEE: "Employee",
              MANAGER: "Manager",
              ADMIN: "Admin",
            };
            const icons: Record<string, string> = {
              "": "bi-people-fill",
              EMPLOYEE: "bi-person-fill",
              MANAGER: "bi-briefcase-fill",
              ADMIN: "bi-shield-fill-check",
            };
            return (
              <button
                key={r}
                onClick={() => {
                  setRoleFilter(r);
                  setPage(0);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 13px",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: active ? 700 : 500,
                  border: active
                    ? "1.5px solid var(--primary-navy)"
                    : "1.5px solid rgba(122,170,206,0.3)",
                  background: active ? "var(--primary-navy)" : "transparent",
                  color: active ? "white" : "var(--muted-text)",
                  transition: "all 0.15s",
                }}
              >
                <i
                  className={`bi ${icons[r]}`}
                  style={{ fontSize: "0.72rem" }}
                />
                {labels[r]}
              </button>
            );
          })}
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "var(--muted-text)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginRight: 4,
            }}
          >
            Status
          </span>
          {(["", "ACTIVE", "INACTIVE"] as const).map((s) => {
            const active = statusFilter === s;
            const labels: Record<string, string> = {
              "": "All",
              ACTIVE: "Active",
              INACTIVE: "Inactive",
            };
            const icons: Record<string, string> = {
              "": "bi-circle-fill",
              ACTIVE: "bi-check-circle-fill",
              INACTIVE: "bi-x-circle-fill",
            };
            const activeColors: Record<string, string> = {
              "": "var(--primary-navy)",
              ACTIVE: "#27ae60",
              INACTIVE: "#e74c3c",
            };
            return (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(0);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 13px",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: active ? 700 : 500,
                  border: active
                    ? `1.5px solid ${activeColors[s]}`
                    : "1.5px solid rgba(122,170,206,0.3)",
                  background: active ? activeColors[s] : "transparent",
                  color: active ? "white" : "var(--muted-text)",
                  transition: "all 0.15s",
                }}
              >
                <i
                  className={`bi ${icons[s]}`}
                  style={{ fontSize: "0.72rem" }}
                />
                {labels[s]}
              </button>
            );
          })}
          {(search || roleFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("");
                setStatusFilter("");
                setPage(0);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 20,
                cursor: "pointer",
                fontSize: "0.76rem",
                fontWeight: 600,
                border: "1.5px solid rgba(231,76,60,0.35)",
                background: "rgba(231,76,60,0.06)",
                color: "#e74c3c",
              }}
            >
              <i className="bi bi-x-lg" style={{ fontSize: "0.65rem" }} /> Clear
              all
            </button>
          )}
        </div>
      </div>

      <div
        className="rounded-3 overflow-hidden"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(122,170,206,0.18)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {loading ? (
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: 220 }}
          >
            <div className="text-center">
              <i
                className="bi bi-arrow-repeat d-block mb-2"
                style={{
                  fontSize: "2rem",
                  color: "var(--soft-blue)",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span style={{ color: "var(--muted-text)", fontSize: "0.85rem" }}>
                Loading users…
              </span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0" style={{ fontSize: "0.85rem" }}>
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(53,88,114,0.04) 0%, rgba(122,170,206,0.07) 100%)",
                  }}
                >
                  {[
                    "ID",
                    "Name / Email",
                    "Department",
                    "Manager",
                    "Role",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "13px 16px",
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--muted-text)",
                        borderBottom: "2px solid rgba(122,170,206,0.2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ padding: "3rem", textAlign: "center" }}
                    >
                      <i
                        className="bi bi-inbox d-block mb-2"
                        style={{
                          fontSize: "2.5rem",
                          color: "var(--muted-text)",
                        }}
                      />
                      <span
                        style={{
                          color: "var(--muted-text)",
                          fontSize: "0.88rem",
                        }}
                      >
                        No users found
                      </span>
                    </td>
                  </tr>
                ) : (
                  paged.map((u, idx) => (
                    <tr
                      key={u.userId}
                      style={{
                        background:
                          idx % 2 === 0
                            ? "var(--white)"
                            : "rgba(247,248,240,0.5)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((
                          e.currentTarget as HTMLTableRowElement
                        ).style.background = "rgba(156,213,255,0.08)")
                      }
                      onMouseLeave={(e) =>
                        ((
                          e.currentTarget as HTMLTableRowElement
                        ).style.background =
                          idx % 2 === 0
                            ? "var(--white)"
                            : "rgba(247,248,240,0.5)")
                      }
                    >
                      <td
                        style={{
                          padding: "13px 16px",
                          borderBottom: "1px solid rgba(122,170,206,0.08)",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: "rgba(53,88,114,0.07)",
                            color: "var(--muted-text)",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {u.userId}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          borderBottom: "1px solid rgba(122,170,206,0.08)",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background:
                                "linear-gradient(135deg, var(--primary-navy), var(--soft-blue))",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                            }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              className="fw-semibold"
                              style={{
                                color: "var(--primary-navy)",
                                fontSize: "0.87rem",
                                lineHeight: 1.2,
                              }}
                            >
                              {u.name}
                            </div>
                            <div
                              style={{
                                color: "var(--muted-text)",
                                fontSize: "0.76rem",
                              }}
                            >
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          borderBottom: "1px solid rgba(122,170,206,0.08)",
                        }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          <i
                            className="bi bi-building"
                            style={{
                              color: "var(--soft-blue)",
                              fontSize: "0.78rem",
                            }}
                          />
                          <span
                            style={{
                              color: "var(--muted-text)",
                              fontSize: "0.83rem",
                            }}
                          >
                            {u.department}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          borderBottom: "1px solid rgba(122,170,206,0.08)",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--muted-text)",
                            fontSize: "0.83rem",
                          }}
                        >
                          {u.managerId ?? (
                            <span
                              style={{
                                fontStyle: "italic",
                                fontSize: "0.75rem",
                              }}
                            >
                              —
                            </span>
                          )}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          borderBottom: "1px solid rgba(122,170,206,0.08)",
                        }}
                      >
                        <RoleBadge role={u.role} />
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          borderBottom: "1px solid rgba(122,170,206,0.08)",
                        }}
                      >
                        <StatusBadge status={u.status} />
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          borderBottom: "1px solid rgba(122,170,206,0.08)",
                        }}
                      >
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => setEditUser(u)}
                            className="action-btn edit"
                            title="Edit user"
                            style={{ width: 32, height: 32, borderRadius: 9 }}
                          >
                            <i
                              className="bi bi-pencil-square"
                              style={{ fontSize: "0.82rem" }}
                            />
                          </button>
                          <button
                            onClick={() => setDeleteUser(u)}
                            className="action-btn delete"
                            title="Delete user"
                            style={{ width: 32, height: 32, borderRadius: 9 }}
                          >
                            <i
                              className="bi bi-trash3"
                              style={{ fontSize: "0.82rem" }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div
            className="d-flex align-items-center justify-content-between px-4 py-3"
            style={{ borderTop: "1px solid rgba(122,170,206,0.15)" }}
          >
            <span style={{ color: "var(--muted-text)", fontSize: "0.82rem" }}>
              Showing {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
              <strong style={{ color: "var(--primary-navy)" }}>
                {filtered.length}
              </strong>{" "}
              users
            </span>
            <div className="d-flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="action-btn view"
                style={{
                  width: "auto",
                  padding: "6px 14px",
                  gap: 6,
                  opacity: page === 0 ? 0.4 : 1,
                }}
              >
                <i
                  className="bi bi-chevron-left"
                  style={{ fontSize: "0.75rem" }}
                />{" "}
                Prev
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i).map(
                (i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      border: "1.5px solid",
                      borderColor:
                        page === i
                          ? "var(--primary-navy)"
                          : "rgba(122,170,206,0.3)",
                      background:
                        page === i ? "var(--primary-navy)" : "transparent",
                      color: page === i ? "white" : "var(--muted-text)",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    {i + 1}
                  </button>
                ),
              )}
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="action-btn view"
                style={{
                  width: "auto",
                  padding: "6px 14px",
                  gap: 6,
                  opacity: page >= totalPages - 1 ? 0.4 : 1,
                }}
              >
                Next{" "}
                <i
                  className="bi bi-chevron-right"
                  style={{ fontSize: "0.75rem" }}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <AddUserModal onClose={() => setShowAdd(false)} onSuccess={loadUsers} />
      )}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={loadUsers}
        />
      )}
      <ConfirmModal
        isOpen={!!deleteUser}
        title="Delete User"
        message={`Are you sure you want to deactivate ${deleteUser?.name ?? "this user"}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteUser(null)}
        confirmLabel="Delete"
        confirmClass="action-btn delete"
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
