import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../shared/AuthContext";
import { useToast } from "../../shared/useToast";
import {
  getEnrolledActivities,
  enrollmentApproval,
  getCompletionActivities,
  completionApproval,
} from "../api/activityService";

const TABS = { ENROLLMENT: "enrollment", COMPLETION: "completion" } as const;
type TabKey = (typeof TABS)[keyof typeof TABS];

interface Activity {
  activityId?: number;
  id?: number;
  userId?: number;
  employeeId?: number;
  programId?: number;
  programName?: string;
  category?: string;
  description?: string;
  createdAt?: string;
  enrollmentStatus?: string;
  enrollmentstatus?: string;
  program?: { programName?: string; category?: string; description?: string };
}

const getErrMsg = (err: unknown): string => {
  const e = err as { response?: { data?: unknown } };
  const d = e.response?.data ?? "An error occurred.";
  return typeof d === "string"
    ? d
    : ((d as { message?: string })?.message ?? JSON.stringify(d));
};

function ActivityRow({
  activity,
  onApprove,
  onReject,
  processingIds,
  showCompletion,
}: {
  activity: Activity;
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  processingIds: Set<number>;
  showCompletion: boolean;
}) {
  const [dismissed, setDismissed] = useState(false);
  const [animOut, setAnimOut] = useState(false);
  const actId = (activity.activityId ?? activity.id) as number;
  const isProcessing = processingIds.has(actId);

  const handle = async (fn: (id: number) => Promise<void>) => {
    setAnimOut(true);
    await fn(actId);
    setTimeout(() => setDismissed(true), 500);
  };

  if (dismissed) return null;

  const enrolledOn = activity.createdAt
    ? new Date(activity.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "—";
  const desc = activity.program?.description ?? activity.description ?? "—";

  return (
    <tr
      className={
        animOut
          ? "animate__animated animate__fadeOut"
          : "animate__animated animate__fadeIn"
      }
    >
      <td>
        <span className="emp-id-pill">
          {activity.userId ?? activity.employeeId ?? "—"}
        </span>
      </td>
      <td className="fw-semibold" style={{ color: "var(--primary-navy)" }}>
        {activity.program?.programName ?? activity.programName ?? "—"}
      </td>
      <td>
        <span className="badge-category" style={{ fontSize: "0.75rem" }}>
          {activity.program?.category ?? activity.category ?? "—"}
        </span>
      </td>
      <td style={{ fontSize: "0.8rem", color: "var(--muted-text)" }}>
        <span title={desc}>
          {desc.length > 60 ? desc.slice(0, 60) + "…" : desc}
        </span>
      </td>
      <td style={{ fontSize: "0.8rem" }}>{enrolledOn}</td>
      {showCompletion && (
        <td>
          <span className="status-pill active" style={{ fontSize: "0.72rem" }}>
            100%
          </span>
        </td>
      )}
      <td>
        <div className="d-flex gap-2">
          <button
            className="btn-success-theme"
            style={{ fontSize: "0.78rem", padding: "4px 10px" }}
            disabled={isProcessing}
            onClick={() => handle(onApprove)}
          >
            {isProcessing ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
              />
            ) : (
              <>
                <i className="bi bi-check-circle me-1" />
                Approve
              </>
            )}
          </button>
          <button
            className="btn-danger-theme"
            style={{ fontSize: "0.78rem", padding: "4px 10px" }}
            disabled={isProcessing}
            onClick={() => handle(onReject)}
          >
            {isProcessing ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
              />
            ) : (
              <>
                <i className="bi bi-x-circle me-1" />
                Reject
              </>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

function RequestTable({
  rows,
  onApprove,
  onReject,
  processingIds,
  showCompletion,
}: {
  rows: Activity[];
  onApprove: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  processingIds: Set<number>;
  showCompletion: boolean;
}) {
  if (rows.length === 0)
    return (
      <div className="empty-state animate__animated animate__fadeIn">
        <i
          className="bi bi-inbox"
          style={{ fontSize: "2.5rem", display: "block", marginBottom: 8 }}
        />
        <div>No pending requests at this time.</div>
      </div>
    );
  return (
    <div className="table-responsive">
      <table className="wellness-table w-100">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Program Name</th>
            <th>Category</th>
            <th>Description</th>
            <th>Enrolled On</th>
            {showCompletion && <th>Completion</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <ActivityRow
              key={a.activityId ?? a.id}
              activity={a}
              onApprove={onApprove}
              onReject={onReject}
              processingIds={processingIds}
              showCompletion={showCompletion}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ActivityManagerDashboard() {
  const { userId: managerId } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>(TABS.ENROLLMENT);
  const [enrollmentRequests, setEnrollmentRequests] = useState<Activity[]>([]);
  const [completionRequests, setCompletionRequests] = useState<Activity[]>([]);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);
  const [loadingCompletion, setLoadingCompletion] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const mark = (id: number) => setProcessingIds((p) => new Set([...p, id]));
  const unmark = (id: number) =>
    setProcessingIds((p) => {
      const s = new Set(p);
      s.delete(id);
      return s;
    });
  const removeEnrollment = (id: number) =>
    setEnrollmentRequests((p) =>
      p.filter((a) => (a.activityId ?? a.id) !== id),
    );
  const removeCompletion = (id: number) =>
    setCompletionRequests((p) =>
      p.filter((a) => (a.activityId ?? a.id) !== id),
    );

  const fetchEnrollmentRequests = useCallback(async () => {
    if (!managerId) return;
    setLoadingEnrollment(true);
    try {
      setEnrollmentRequests(
        Array.isArray((await getEnrolledActivities(String(managerId))).data)
          ? (await getEnrolledActivities(String(managerId))).data
          : [],
      );
    } catch (e) {
      showToast(getErrMsg(e), "error");
    } finally {
      setLoadingEnrollment(false);
    }
  }, [managerId, showToast]);

  const fetchCompletionRequests = useCallback(async () => {
    if (!managerId) return;
    setLoadingCompletion(true);
    try {
      setCompletionRequests(
        Array.isArray((await getCompletionActivities(String(managerId))).data)
          ? (await getCompletionActivities(String(managerId))).data
          : [],
      );
    } catch (e) {
      showToast(getErrMsg(e), "error");
    } finally {
      setLoadingCompletion(false);
    }
  }, [managerId, showToast]);

  useEffect(() => {
    fetchEnrollmentRequests();
    fetchCompletionRequests();
  }, [fetchEnrollmentRequests, fetchCompletionRequests]);

  const handleEnrollApprove = async (id: number) => {
    mark(id);
    try {
      await enrollmentApproval(id, "APPROVE");
      showToast("Enrollment approved!", "success");
      removeEnrollment(id);
    } catch (e) {
      showToast(getErrMsg(e), "error");
    } finally {
      unmark(id);
    }
  };
  const handleEnrollReject = async (id: number) => {
    mark(id);
    try {
      await enrollmentApproval(id, "REJECT");
      showToast("Enrollment rejected.", "info");
      removeEnrollment(id);
    } catch (e) {
      showToast(getErrMsg(e), "error");
    } finally {
      unmark(id);
    }
  };
  const handleCompletionApprove = async (id: number) => {
    mark(id);
    try {
      await completionApproval(id, "APPROVE");
      showToast("Completion approved!", "success");
      removeCompletion(id);
    } catch (e) {
      showToast(getErrMsg(e), "error");
    } finally {
      unmark(id);
    }
  };
  const handleCompletionReject = async (id: number) => {
    mark(id);
    try {
      await completionApproval(id, "REJECT");
      showToast("Completion request rejected.", "info");
      removeCompletion(id);
    } catch (e) {
      showToast(getErrMsg(e), "error");
    } finally {
      unmark(id);
    }
  };

  const tabs = [
    {
      key: TABS.ENROLLMENT,
      icon: "person-plus",
      label: "Enrollment Requests",
      count: enrollmentRequests.length,
      color: "var(--soft-blue)",
    },
    {
      key: TABS.COMPLETION,
      icon: "trophy",
      label: "Completion Requests",
      count: completionRequests.length,
      color: "#44b37e",
    },
  ];

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ padding: "2.2rem", margin:"0px auto"}}
    >
      <ToastContainer />
      <div className="page-header mb-4">
        <h1 className="page-title">
          <i
            className="bi bi-clipboard2-check me-3"
            style={{ color: "var(--soft-blue)" }}
          />
          Manager Dashboard
        </h1>
        <p className="page-subtitle">
          Review and act on employee enrollment and completion requests.
        </p>
      </div>

      <div className="row g-3 mb-4">
        {[
          {
            icon: "person-check",
            value: enrollmentRequests.length,
            label: "Pending Enrollments",
            bg: "#eef4fa",
          },
          {
            icon: "trophy",
            value: completionRequests.length,
            label: "Pending Completions",
            bg: "#eafaf2",
          },
          {
            icon: "person-badge",
            value: managerId ?? "—",
            label: "Your Manager ID",
            bg: "var(--bg-cream)",
          },
        ].map(({ icon, value, label, bg }) => (
          <div key={label} className="col-12 col-md-4">
            <div className="prod-card" style={{ margin: 0, background: bg }}>
              <div className="d-flex align-items-center gap-3">
                <div className="header-icon">
                  <i className={`bi bi-${icon}`} />
                </div>
                <div>
                  <div className="stat-value" style={{ fontSize: "1.6rem" }}>
                    {value}
                  </div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor:
                activeTab === t.key
                  ? "var(--primary-navy)"
                  : "rgba(122,170,206,0.3)",
              background:
                activeTab === t.key ? "var(--primary-navy)" : "transparent",
              color: activeTab === t.key ? "white" : "var(--muted-text)",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <i className={`bi bi-${t.icon}`} />
            {t.label}
            {t.count > 0 && (
              <span
                style={{
                  background:
                    activeTab === t.key
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(53,88,114,0.08)",
                  borderRadius: 10,
                  padding: "1px 7px",
                  fontSize: "0.75rem",
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
        <button
          className="btn-outline-theme ms-auto"
          style={{ fontSize: "0.82rem" }}
          onClick={
            activeTab === TABS.ENROLLMENT
              ? fetchEnrollmentRequests
              : fetchCompletionRequests
          }
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Refresh
        </button>
      </div>

      {activeTab === TABS.ENROLLMENT && (
        <div className="prod-card animate__animated animate__fadeIn" style={{padding:"15px"}}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2
              className="fw-bold mb-0"
              style={{ fontSize: "1rem", color: "var(--primary-navy)" }}
            >
              <i
                className="bi bi-person-plus me-2"
                style={{ color: "var(--soft-blue)" }}
              />
              Pending Enrollment Requests
            </h2>
            <span style={{ fontSize: "0.78rem", color: "var(--muted-text)" }}>
              {enrollmentRequests.length} request
              {enrollmentRequests.length !== 1 ? "s" : ""} awaiting review
            </span>
          </div>
          {loadingEnrollment ? (
            <div className="text-center py-4">
              <i
                className="bi bi-arrow-clockwise"
                style={{
                  fontSize: "2rem",
                  color: "var(--soft-blue)",
                  animation: "spin 1s linear infinite",
                  display: "block",
                }}
              />
            </div>
          ) : (
            <RequestTable
              rows={enrollmentRequests}
              onApprove={handleEnrollApprove}
              onReject={handleEnrollReject}
              processingIds={processingIds}
              showCompletion={false}
            />
          )}
        </div>
      )}

      {activeTab === TABS.COMPLETION && (
        <div className="prod-card animate__animated animate__fadeIn" style={{padding:"15px"}}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2
              className="fw-bold mb-0"
              style={{ fontSize: "1rem", color: "var(--primary-navy)" }}
            >
              <i className="bi bi-trophy me-2" style={{ color: "#44b37e" }} />
              Pending Completion Requests
            </h2>
            <span style={{ fontSize: "0.78rem", color: "var(--muted-text)" }}>
              {completionRequests.length} request
              {completionRequests.length !== 1 ? "s" : ""} awaiting review
            </span>
          </div>
          {loadingCompletion ? (
            <div className="text-center py-4">
              <i
                className="bi bi-arrow-clockwise"
                style={{
                  fontSize: "2rem",
                  color: "var(--soft-blue)",
                  animation: "spin 1s linear infinite",
                  display: "block",
                }}
              />
            </div>
          ) : (
            <RequestTable
              rows={completionRequests}
              onApprove={handleCompletionApprove}
              onReject={handleCompletionReject}
              processingIds={processingIds}
              showCompletion={true}
            />
          )}
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
