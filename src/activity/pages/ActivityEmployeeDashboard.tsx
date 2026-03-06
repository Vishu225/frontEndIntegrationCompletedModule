import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/AuthContext";
import { useToast } from "../../shared/useToast";
import { getActivePrograms } from "../api/goalService";
import {
  getOngoingActivities,
  getCompletedActivities,
  getProgramChallengesByActivity,
  enrollActivity,
  deEnrollUser,
  completeChallenge,
} from "../api/activityService";

interface Program {
  programId: number;
  programName: string;
  programDescription?: string;
  description?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  enrollmentStartDate?: string;
  enrollmentEndDate?: string;
}
interface Challenge {
  challengeId: number;
  programId?: number;
  program?: { programId: number; programName?: string };
  title: string;
  endDate?: string;
  progress?: number;
  totalProgress?: number;
  challengeStatus?: string;
}
interface Activity {
  activityId?: number;
  programId: number;
  enrollmentstatus?: string;
  enrollmentStatus?: string;
  completionStatus?: string;
  createdAt?: string;
  enrolledDate?: string;
  program?: Program;
  programName?: string;
  category?: string;
  description?: string;
}

const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "N/A";
const errMsg = (err: unknown) => {
  const e = err as { response?: { data?: unknown; status?: number } };
  const m = e.response?.data ?? "";
  if (typeof m === "string" && m.trim()) return m;
  if (m && typeof m === "object") {
    if ("message" in m) return String((m as { message: unknown }).message);
    if ("error" in m) return String((m as { error: unknown }).error);
  }
  const s = e.response?.status;
  if (s === 409) return "Challenge already completed.";
  if (s === 404) return "Activity or challenge not found.";
  return "";
};

function CategoryBadge({ category }: { category?: string }) {
  return (
    <span className="badge-category" style={{}}>
      {category ?? "General"}
    </span>
  );
}

function OngoingProgramCard({
  activity,
  onDeEnroll,
  deEnrollingId,
  showToast,
  programs,
}: {
  activity: Activity;
  onDeEnroll: (id: number) => void;
  deEnrollingId: number | null;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
  programs: Program[];
}) {
  const activityId = activity.activityId;
  const programId = activity.programId;
  const resolvedActivityId: number | undefined =
    activityId ??
    (() => {
      const v = localStorage.getItem(`activity_prog_${programId}`);
      return v ? parseInt(v, 10) : undefined;
    })();

  const [expanded, setExpanded] = useState(false);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loadingCh, setLoadingCh] = useState(false);
  const [errCh, setErrCh] = useState(false);
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [completedIds, setCompletedIds] = useState<number[]>(() => {
    if (!resolvedActivityId) return [];
    try {
      return JSON.parse(
        localStorage.getItem(`completed_challenges_${resolvedActivityId}`) ??
          "[]",
      ) as number[];
    } catch {
      return [];
    }
  });

  const matchedProgram = programs.find((p) => p.programId === programId);
  const programName =
    activity.program?.programName ??
    activity.programName ??
    matchedProgram?.programName ??
    "Program #" + programId;
  const programCategory =
    activity.program?.category ?? activity.category ?? matchedProgram?.category;
  const pct =
    challenges.length > 0
      ? Math.round((completedIds.length / challenges.length) * 100)
      : 0;
  const allDone =
    challenges.length > 0 && completedIds.length >= challenges.length;

  const fetchChallenges = useCallback(async () => {
    setLoadingCh(true);
    setErrCh(false);
    try {
      const res = (await getProgramChallengesByActivity(programId)).data || [];
      setChallenges(res);
    } catch {
      setErrCh(true);
    } finally {
      setLoadingCh(false);
    }
  }, [programId]);

  const handleToggle = () => {
    if (!expanded) {
      setExpanded(true);
      setErrCh(false);
      setChallenges([]);
      fetchChallenges();
    } else setExpanded(false);
  };

  const handleCheck = async (ch: Challenge) => {
    if (!resolvedActivityId) {
      showToast("Activity ID not found. Please refresh.", "error");
      return;
    }
    if (completedIds.includes(ch.challengeId)) return;
    setCompletingId(ch.challengeId);
    try {
      await completeChallenge({
        activityId: resolvedActivityId,
        challengeId: ch.challengeId,
      });
      const updated = [...completedIds, ch.challengeId];
      setCompletedIds(updated);
      localStorage.setItem(
        `completed_challenges_${resolvedActivityId}`,
        JSON.stringify(updated),
      );
      showToast(
        updated.length >= challenges.length
          ? "🎉 All challenges complete! Awaiting manager approval."
          : "Challenge marked complete!",
        "success",
      );
    } catch (e) {
      showToast(errMsg(e) || "Failed.", "error");
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="prod-card mb-3">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <div className="d-flex gap-2 align-items-center mb-1">
            <CategoryBadge category={programCategory} />
            <span
              className="status-pill active"
              style={{ fontSize: "0.72rem" }}
            >
              <i className="bi bi-activity me-1" />
              In Progress
            </span>
          </div>
          <div
            className="fw-bold mb-1"
            style={{ color: "var(--primary-navy)", fontSize: "1rem" }}
          >
            {programName}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--muted-text)" }}>
            <i className="bi bi-calendar3 me-1" />
            Enrolled: {fmtDate(activity.createdAt ?? activity.enrolledDate)}
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn-outline-theme"
            onClick={handleToggle}
            disabled={loadingCh}
            style={{ fontSize: "0.82rem" }}
          >
            {loadingCh ? (
              <>
                <i
                  className="bi bi-arrow-clockwise"
                  style={{
                    animation: "spin 1s linear infinite",
                    display: "inline-block",
                  }}
                />{" "}
                Loading…
              </>
            ) : (
              <>
                <i className={`bi bi-chevron-${expanded ? "up" : "down"}`} />{" "}
                Challenges
              </>
            )}
          </button>
          <button
            className="btn-danger-theme"
            onClick={() => onDeEnroll(programId)}
            disabled={deEnrollingId === programId}
            style={{ fontSize: "0.82rem" }}
          >
            {deEnrollingId === programId ? (
              <i
                className="bi bi-arrow-clockwise"
                style={{
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                }}
              />
            ) : (
              <>
                <i className="bi bi-x-circle" /> De-Enroll
              </>
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div
          className="mt-3 pt-3"
          style={{ borderTop: "1px solid var(--border-light)" }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span
              className="fw-semibold"
              style={{ color: "var(--primary-navy)", fontSize: "0.85rem" }}
            >
              <i className="bi bi-list-check me-1" />
              Challenges
            </span>
            {challenges.length > 0 && (
              <span style={{ fontSize: "0.78rem", color: "var(--muted-text)" }}>
                {completedIds.length}/{challenges.length} completed
              </span>
            )}
          </div>
          {challenges.length > 0 && (
            <div className="mb-3">
              <div
                className="d-flex justify-content-between mb-1"
                style={{ fontSize: "0.75rem", color: "var(--muted-text)" }}
              >
                <span>Progress</span>
                <span>{pct}%</span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "rgba(122,170,206,0.2)",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 3,
                    background:
                      "linear-gradient(90deg, var(--primary-navy), var(--soft-blue))",
                    transition: "width 0.4s",
                  }}
                />
              </div>
            </div>
          )}
          {loadingCh ? (
            <div className="text-center py-3">
              <i
                className="bi bi-arrow-clockwise"
                style={{
                  fontSize: "1.5rem",
                  color: "var(--soft-blue)",
                  animation: "spin 1s linear infinite",
                  display: "block",
                }}
              />
            </div>
          ) : errCh ? (
            <div
              className="alert alert-info py-2 px-3"
              style={{ fontSize: "0.82rem" }}
            >
              <i className="bi bi-info-circle me-1" />
              Failed to load challenges. Please try again.
            </div>
          ) : challenges.length === 0 ? (
            <div
              className="text-center py-2"
              style={{ color: "var(--muted-text)", fontSize: "0.82rem" }}
            >
              No challenges for this program yet.
            </div>
          ) : (
            challenges.map((ch) => {
              const done = completedIds.includes(ch.challengeId);
              return (
                <div
                  key={ch.challengeId}
                  className="d-flex align-items-center gap-3 py-2"
                  style={{ borderBottom: "1px solid rgba(122,170,206,0.1)" }}
                >
                  <input
                    type="checkbox"
                    checked={done}
                    disabled={done || completingId === ch.challengeId}
                    onChange={() => handleCheck(ch)}
                    style={{ cursor: done ? "default" : "pointer" }}
                  />
                  {completingId === ch.challengeId && (
                    <i
                      className="bi bi-arrow-clockwise"
                      style={{
                        animation: "spin 1s linear infinite",
                        display: "inline-block",
                        color: "var(--soft-blue)",
                      }}
                    />
                  )}
                  <div>
                    <div
                      style={{
                        fontWeight: done ? 400 : 600,
                        color: done
                          ? "var(--muted-text)"
                          : "var(--primary-navy)",
                        textDecoration: done ? "line-through" : "none",
                        fontSize: "0.85rem",
                      }}
                    >
                      {ch.title}
                    </div>
                    {ch.endDate && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted-text)",
                        }}
                      >
                        Due: {new Date(ch.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {done && (
                    <i
                      className="bi bi-check-circle-fill ms-auto"
                      style={{ color: "#27ae60", fontSize: "1rem" }}
                    />
                  )}
                </div>
              );
            })
          )}
          {allDone && (
            <div
              className="alert alert-success mt-2 py-2 px-3"
              style={{ fontSize: "0.82rem" }}
            >
              <i className="bi bi-trophy-fill me-1" />
              🎉 All challenges complete! Awaiting manager approval.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ActivityEmployeeDashboard() {
  const { userId } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("new");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [completedActivities, setCompletedActivities] = useState<Activity[]>(
    [],
  );
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [deEnrollingId, setDeEnrollingId] = useState<number | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [pendingIds, setPendingIds] = useState<number[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem("pendingEnrollments") ?? "[]",
      ) as number[];
    } catch {
      return [];
    }
  });

  const fetchPrograms = useCallback(async () => {
    setLoadingPrograms(true);
    try {
      setPrograms((await getActivePrograms()).data || []);
    } catch {
      showToast("Failed to load programs.", "error");
    } finally {
      setLoadingPrograms(false);
    }
  }, [showToast]);

  const fetchActivities = useCallback(async () => {
    setLoadingActivities(true);
    try {
      const [ongoingRes, completedRes] = await Promise.all([
        getOngoingActivities(String(userId)),
        getCompletedActivities(String(userId)),
      ]);
      setActivities(ongoingRes.data || []);
      setCompletedActivities(completedRes.data || []);
    } catch {
      showToast("Failed to load your activities.", "error");
    } finally {
      setLoadingActivities(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);
  useEffect(() => {
    if (activeTab === "ongoing" || activeTab === "completed") fetchActivities();
  }, [activeTab, fetchActivities]);

  const savePending = (ids: number[]) => {
    setPendingIds(ids);
    localStorage.setItem("pendingEnrollments", JSON.stringify(ids));
  };

  const handleEnroll = async (programId: number) => {
    setEnrollingId(programId);
    try {
      const r = await enrollActivity({
        userId: userId ?? 0,
        programId,
      });
      const actId =
        (r.data as { activityId?: number; id?: number })?.activityId ??
        (r.data as { id?: number })?.id;
      if (actId)
        localStorage.setItem(`activity_prog_${programId}`, String(actId));
      savePending([...pendingIds, programId]);
      showToast("Enrollment request sent to your manager!", "success");
      setSelectedProgram(null);
    } catch (err) {
      const msg = errMsg(err);
      if (msg.toLowerCase().includes("enrollment is allowed only between"))
        showToast("Enrollment window has closed for this program.", "error");
      else if (msg.toLowerCase().includes("already enrolled")) {
        savePending([...pendingIds, programId]);
        showToast("You are already enrolled in this program.", "error");
      } else if (msg.toLowerCase().includes("manager not assigned"))
        showToast(
          "You don't have a manager assigned. Please contact HR.",
          "error",
        );
      else showToast(msg || "Enrollment failed. Please try again.", "error");
    } finally {
      setEnrollingId(null);
    }
  };

  const handleDeEnroll = async (programId: number) => {
    setDeEnrollingId(programId);
    try {
      await deEnrollUser({ userId: userId ?? 0, programId });
      setActivities((prev) => prev.filter((a) => a.programId !== programId));
      localStorage.removeItem(`activity_prog_${programId}`);
      savePending(pendingIds.filter((id) => id !== programId));
      showToast("De-enrolled successfully.", "success");
    } catch (err) {
      showToast(errMsg(err) || "Failed to de-enroll.", "error");
    } finally {
      setDeEnrollingId(null);
    }
  };

  const enrolledIds = [
    ...pendingIds,
    ...activities.map((a) => a.programId),
    ...completedActivities.map((a) => a.programId),
  ];
  const availablePrograms = programs.filter(
    (p) => !enrolledIds.includes(p.programId),
  );

  const tabs = [
    {
      key: "new",
      icon: "bi-grid-3x3-gap",
      label: "New Programs",
      count: loadingPrograms ? "…" : availablePrograms.length,
    },
    {
      key: "ongoing",
      icon: "bi-play-circle",
      label: "Ongoing",
      count: loadingActivities ? "…" : activities.length,
    },
    {
      key: "completed",
      icon: "bi-trophy",
      label: "Completed",
      count: loadingActivities ? "…" : completedActivities.length,
    },
  ];

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ padding: "2.2rem", margin: "0 auto" }}
    >
      <ToastContainer />
      <div className="page-header mb-4">
        <h1 className="page-title">
          <i
            className="bi bi-collection me-3"
            style={{ color: "var(--soft-blue)" }}
          />
          Wellness Programs
        </h1>
        <p className="page-subtitle">
          Browse, enroll, and track your wellness programs.
        </p>
      </div>

      <div className="prod-card mb-4">
        <div
          className="d-flex flex-wrap gap-2 mb-4"
          style={{ padding: "10px" }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
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
              <i className={`bi ${t.icon}`} />
              {t.label}
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
            </button>
          ))}
        </div>

        {activeTab === "new" &&
          (loadingPrograms ? (
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
                Loading programs…
              </span>
            </div>
          ) : availablePrograms.length === 0 ? (
            <div className="empty-state">
              <i
                className="bi bi-collection"
                style={{
                  fontSize: "2.5rem",
                  display: "block",
                  marginBottom: 8,
                }}
              />
              <div>No new programs available.</div>
            </div>
          ) : (
            <div className="row g-3">
              {availablePrograms.map((p) => (
                <div
                  key={p.programId}
                  className="col-12 col-md-6 col-lg-4"
                  style={{ padding: "20px" }}
                >
                  <div className="prod-card h-100" style={{ margin: 0 }}>
                    <div className="prod-card-header">
                      <CategoryBadge category={p.category} />
                      <div className="prod-card-title mt-2">
                        {p.programName}
                      </div>
                    </div>
                    <div className="prod-card-body">
                      <p
                        style={{
                          color: "var(--muted-text)",
                          fontSize: "0.82rem",
                          margin: 0,
                          lineHeight: 1.5,
                        }}
                      >
                        {p.programDescription ??
                          p.description ??
                          "No description."}
                      </p>
                      <div className="row g-2 mt-2">
                        {[
                          { l: "Start", v: fmtDate(p.startDate) },
                          { l: "End", v: fmtDate(p.endDate) },
                          {
                            l: "Enroll From",
                            v: fmtDate(p.enrollmentStartDate),
                          },
                          { l: "Enroll By", v: fmtDate(p.enrollmentEndDate) },
                        ].map(({ l, v }) => (
                          <div key={l} className="col-6">
                            <div
                              style={{
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                color: "var(--muted-text)",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                              }}
                            >
                              {l}
                            </div>
                            <div
                              style={{
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                color: "var(--primary-navy)",
                              }}
                            >
                              {v}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="prod-card-footer d-flex gap-2">
                      {pendingIds.includes(p.programId) ? (
                        <span
                          className="status-pill"
                          style={{
                            background: "rgba(255,193,7,0.15)",
                            color: "#856404",
                            fontSize: "0.78rem",
                          }}
                        >
                          <i className="bi bi-clock me-1" />
                          Pending Approval
                        </span>
                      ) : (
                        <button
                          className="btn-success-theme"
                          onClick={() => handleEnroll(p.programId)}
                          disabled={enrollingId === p.programId}
                          style={{ fontSize: "0.82rem" }}
                        >
                          {enrollingId === p.programId ? (
                            <>
                              <i
                                className="bi bi-arrow-clockwise"
                                style={{
                                  animation: "spin 1s linear infinite",
                                  display: "inline-block",
                                }}
                              />{" "}
                              Enrolling…
                            </>
                          ) : (
                            <>
                              <i className="bi bi-plus-circle" /> Enroll
                            </>
                          )}
                        </button>
                      )}
                      <button
                        className="btn-outline-theme"
                        onClick={() => setSelectedProgram(p)}
                        style={{ fontSize: "0.82rem" }}
                      >
                        <i className="bi bi-eye" /> Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

        {activeTab === "ongoing" &&
          (loadingActivities ? (
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
          ) : activities.length === 0 ? (
            <div className="empty-state">
              <i
                className="bi bi-play-circle"
                style={{
                  fontSize: "2.5rem",
                  display: "block",
                  marginBottom: 8,
                }}
              />
              <div>
                No ongoing programs. Enroll in a program to get started.
              </div>
            </div>
          ) : (
            <div>
              {activities.map((a) => (
                <OngoingProgramCard
                  key={a.activityId ?? a.programId}
                  activity={a}
                  onDeEnroll={handleDeEnroll}
                  deEnrollingId={deEnrollingId}
                  showToast={showToast}
                  programs={programs}
                />
              ))}
            </div>
          ))}

        {activeTab === "completed" &&
          (loadingActivities ? (
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
          ) : completedActivities.length === 0 ? (
            <div className="empty-state">
              <i
                className="bi bi-trophy"
                style={{
                  fontSize: "2.5rem",
                  display: "block",
                  marginBottom: 8,
                }}
              />
              <div>No completed programs yet.</div>
            </div>
          ) : (
            <div className="row g-3">
              {completedActivities.map((a) => (
                <div
                  key={a.activityId ?? a.programId}
                  className="col-12 col-md-6 col-lg-4"
                >
                  <div className="prod-card h-100" style={{ margin: 0 }}>
                    <div className="prod-card-header">
                      <CategoryBadge
                        category={a.program?.category ?? a.category}
                      />
                      <span
                        className="status-pill ms-2"
                        style={{
                          background: "rgba(40,167,69,0.1)",
                          color: "#27ae60",
                          fontSize: "0.72rem",
                        }}
                      >
                        <i className="bi bi-check-circle-fill me-1" />
                        Completed
                      </span>
                    </div>
                    <div className="prod-card-body">
                      <div className="prod-card-title">
                        {a.program?.programName ?? a.programName}
                      </div>
                      <p
                        style={{
                          color: "var(--muted-text)",
                          fontSize: "0.82rem",
                          margin: 0,
                        }}
                      >
                        {a.program?.programDescription ?? a.description ?? ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>

      <div className="row g-3">
        {[
          {
            path: "/employee/goals",
            icon: "bi-bullseye",
            label: "My Goals",
            desc: "Set and track personal wellness goals.",
            color: "#44b37e",
          },
          {
            path: "/survey",
            icon: "bi-clipboard2-check",
            label: "Surveys",
            desc: "Complete assigned wellness surveys.",
            color: "#a064f5",
          },
        ].map(({ path, icon, label, desc, color }) => (
          <div key={path} className="col-12 col-md-6">
            <div
              className="prod-card"
              style={{ cursor: "pointer", margin: 0 }}
              onClick={() => navigate(path)}
            >
              <div
                className="d-flex align-items-center gap-3"
                style={{ padding: "10px" }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 13,
                    background: `${color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color,
                    fontSize: "1.4rem",
                  }}
                >
                  <i className={`bi ${icon}`} />
                </div>
                <div>
                  <div className="prod-card-title" style={{ marginBottom: 2 }}>
                    {label}
                  </div>
                  <p
                    style={{
                      color: "var(--muted-text)",
                      fontSize: "0.82rem",
                      margin: 0,
                    }}
                  >
                    {desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProgram && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedProgram(null)}
        >
          <div
            className="results-modal animate__animated animate__zoomIn animate__faster"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="results-modal-header">
              <h2
                className="fw-bold mb-0"
                style={{ color: "var(--primary-navy)", fontSize: "1.05rem" }}
              >
                <CategoryBadge category={selectedProgram.category} />{" "}
                {selectedProgram.programName}
              </h2>
              <button
                onClick={() => setSelectedProgram(null)}
                className="action-btn close-btn"
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="results-modal-body">
              <p
                style={{
                  color: "var(--muted-text)",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                {selectedProgram.programDescription ??
                  selectedProgram.description ??
                  "No description."}
              </p>
              <div className="row g-2 mb-4">
                {[
                  { l: "Program Start", v: fmtDate(selectedProgram.startDate) },
                  { l: "Program End", v: fmtDate(selectedProgram.endDate) },
                  {
                    l: "Enrollment Opens",
                    v: fmtDate(selectedProgram.enrollmentStartDate),
                  },
                  {
                    l: "Enrollment Closes",
                    v: fmtDate(selectedProgram.enrollmentEndDate),
                  },
                ].map(({ l, v }) => (
                  <div key={l} className="col-6">
                    <div
                      style={{
                        background: "var(--bg-cream)",
                        borderRadius: 10,
                        padding: "0.75rem",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "var(--muted-text)",
                          textTransform: "uppercase",
                        }}
                      >
                        {l}
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--primary-navy)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {v}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="d-flex gap-2">
                {enrolledIds.includes(selectedProgram.programId) ? (
                  <div
                    className="alert alert-success py-2 px-3 mb-0 flex-fill"
                    style={{ fontSize: "0.82rem" }}
                  >
                    <i className="bi bi-check-circle-fill me-1" />
                    Already enrolled — pending manager approval
                  </div>
                ) : (
                  <button
                    className="btn-success-theme flex-fill"
                    onClick={() => handleEnroll(selectedProgram.programId)}
                    disabled={enrollingId === selectedProgram.programId}
                  >
                    {enrollingId === selectedProgram.programId ? (
                      <>
                        <i
                          className="bi bi-arrow-clockwise"
                          style={{
                            animation: "spin 1s linear infinite",
                            display: "inline-block",
                          }}
                        />{" "}
                        Enrolling…
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle" /> Enroll Now
                      </>
                    )}
                  </button>
                )}
                <button
                  className="btn-outline-theme"
                  onClick={() => setSelectedProgram(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
