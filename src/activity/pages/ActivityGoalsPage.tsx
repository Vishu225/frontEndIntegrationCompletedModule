import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../shared/AuthContext";
import { useToast } from "../../shared/useToast";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../api/goalService";

interface Goal {
  goalId?: number;
  id?: number;
  title?: string;
  goalTitle?: string;
  description?: string;
  goalDescription?: string;
  targetDate?: string;
  endDate?: string; // GoalProgressResponseDTO uses endDate
  status?: string;
  goalStatus?: string;
  programId?: number;
  programName?: string;
}

const gId = (g: Goal) => g.goalId ?? g.id ?? 0;
const gTitle = (g: Goal) => g.title ?? g.goalTitle ?? "";
const gDesc = (g: Goal) => g.description ?? g.goalDescription ?? "";
const gStatus = (g: Goal) => g.status ?? g.goalStatus ?? "ACTIVE";
const fmtDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No date";
const getErrMsg = (err: unknown) => {
  const e = err as { response?: { data?: unknown } };
  const d = e.response?.data ?? "";
  return typeof d === "string"
    ? d
    : ((d as { message?: string })?.message ?? "");
};

const statusStyle = (s: string) => {
  switch (s.toUpperCase()) {
    case "COMPLETED":
      return { background: "rgba(68,179,126,0.12)", color: "#27ae60" };
    case "INACTIVE":
      return { background: "rgba(150,150,150,0.12)", color: "#888" };
    default:
      return {
        background: "rgba(122,170,206,0.15)",
        color: "var(--primary-navy)",
      };
  }
};

interface GoalFormData {
  title: string;
  description: string;
  targetDate: string;
  status: string;
}
const emptyForm: GoalFormData = {
  title: "",
  description: "",
  targetDate: "",
  status: "ACTIVE",
};

function GoalModal({
  goal,
  onClose,
  onSaved,
  showToast,
}: {
  goal?: Goal | null;
  onClose: () => void;
  onSaved: () => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const { userId } = useAuth();
  const isEdit = !!goal;
  const [form, setForm] = useState<GoalFormData>(
    goal
      ? {
          title: gTitle(goal),
          description: gDesc(goal),
          targetDate: goal.targetDate?.slice(0, 10) ?? "",
          status: gStatus(goal),
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<GoalFormData>>({});

  const validate = (): boolean => {
    const e: Partial<GoalFormData> = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.targetDate) e.targetDate = "Target date is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        // UpdateGoalRequestDTO: { progress, status, title }
        await updateGoal(gId(goal!), {
          title: form.title,
          status: form.status,
          progress: 0,
          userId: userId ?? 0,
        });
        showToast("Goal updated!", "success");
      } else {
        // CreateSelfGoalRequestDTO: { title, endDate, totalProgress }
        await createGoal({
          title: form.title,
          endDate: form.targetDate,
          totalProgress: 100,
          userId: userId ?? 0,
        });
        showToast("Goal created!", "success");
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(getErrMsg(err) || "Failed to save goal.", "error");
    } finally {
      setSaving(false);
    }
  };

  const set =
    (field: keyof GoalFormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="results-modal animate__animated animate__zoomIn animate__faster"
        style={{ maxWidth: 480 }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="results-modal-header">
          <h2
            className="fw-bold mb-0"
            style={{ color: "var(--primary-navy)", fontSize: "1rem" }}
          >
            <i
              className={`bi ${isEdit ? "bi-pencil-square" : "bi-plus-circle"} me-2`}
            />
            {isEdit ? "Edit Goal" : "New Goal"}
          </h2>
          <button className="action-btn close-btn" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="results-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Goal Title *</label>
              <input
                className="input-field"
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Run 5km daily"
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>
            <div className="form-group mb-3">
              <label>Description</label>
              <textarea
                className="input-field"
                rows={3}
                value={form.description}
                onChange={set("description")}
                placeholder="Describe your goal…"
                style={{ resize: "vertical" }}
              />
            </div>
            <div className="row g-3 mb-3">
              <div className="col-12 col-sm-6">
                <div className="form-group">
                  <label>Target Date *</label>
                  <input
                    className="input-field"
                    type="date"
                    value={form.targetDate}
                    onChange={set("targetDate")}
                  />
                  {errors.targetDate && (
                    <div className="form-error">{errors.targetDate}</div>
                  )}
                </div>
              </div>
              {isEdit && (
                <div className="col-12 col-sm-6">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="input-field"
                      value={form.status}
                      onChange={set("status")}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="d-flex gap-2 mt-3">
              <button
                type="submit"
                className="btn-grad flex-fill"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {isEdit ? "Saving…" : "Creating…"}
                  </>
                ) : (
                  <>
                    <i
                      className={`bi ${isEdit ? "bi-check-lg" : "bi-plus-circle"} me-1`}
                    />
                    {isEdit ? "Save Changes" : "Create Goal"}
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-outline-theme"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ActivityGoalsPage() {
  const { userId } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await getGoals(String(userId));
      // Backend returns Page<GoalProgressResponseDTO> — unwrap .content
      const raw = res.data;
      setGoals(Array.isArray(raw) ? raw : (raw?.content ?? []));
    } catch {
      showToast("Failed to load goals.", "error");
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDelete = async (goal: Goal) => {
    const id = gId(goal);
    setDeletingId(id);
    try {
      await deleteGoal(id, userId ?? 0);
      setGoals((prev) => prev.filter((g) => gId(g) !== id));
      showToast("Goal deleted.", "info");
    } catch (err) {
      showToast(getErrMsg(err) || "Failed to delete.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const counts = {
    active: goals.filter((g) => gStatus(g).toUpperCase() === "ACTIVE").length,
    completed: goals.filter((g) => gStatus(g).toUpperCase() === "COMPLETED")
      .length,
    total: goals.length,
  };

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ padding: "2.2rem", margin: "0 auto" }}
    >
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="page-title">
            <i
              className="bi bi-bullseye me-3"
              style={{ color: "var(--soft-blue)" }}
            />
            My Goals
          </h1>
          <p className="page-subtitle">
            Set and track your personal wellness goals.
          </p>
        </div>
        <button className="btn-grad" onClick={() => setShowCreate(true)}>
          <i className="bi bi-plus-circle me-1" />
          New Goal
        </button>
      </div>

      <div className="row g-3 mb-4">
        {[
          {
            label: "Total Goals",
            value: counts.total,
            icon: "bi-bullseye",
            bg: "#eef4fa",
          },
          {
            label: "Active",
            value: counts.active,
            icon: "bi-play-circle",
            bg: "rgba(122,170,206,0.12)",
          },
          {
            label: "Completed",
            value: counts.completed,
            icon: "bi-trophy",
            bg: "rgba(68,179,126,0.1)",
          },
        ].map(({ label, value, icon, bg }) => (
          <div key={label} className="col-12 col-md-4">
            <div className="prod-card" style={{ margin: 0, background: bg }}>
              <div className="d-flex align-items-center gap-3">
                <div className="header-icon">
                  <i className={`bi ${icon}`} />
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

      <div className="prod-card">
        {loading ? (
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
            <span style={{ color: "var(--muted-text)" }}>Loading goals…</span>
          </div>
        ) : goals.length === 0 ? (
          <div className="empty-state">
            <i
              className="bi bi-bullseye"
              style={{ fontSize: "2.5rem", display: "block", marginBottom: 8 }}
            />
            <div className="fw-semibold">No goals yet</div>
            <div
              style={{
                color: "var(--muted-text)",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              Create your first personal wellness goal to get started.
            </div>
            <button className="btn-grad" onClick={() => setShowCreate(true)}>
              <i className="bi bi-plus-circle me-1" />
              Create First Goal
            </button>
          </div>
        ) : (
          <div className="row g-3">
            {goals.map((g) => {
              const s = gStatus(g).toUpperCase();
              const ss = statusStyle(s);
              return (
                <div key={gId(g)} className="col-12 col-md-6 col-lg-4">
                  <div
                    className="prod-card h-100 animate__animated animate__fadeIn"
                    style={{ margin: 0, padding: "10px" }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span
                        style={{
                          ...ss,
                          padding: "2px 10px",
                          borderRadius: 10,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {s === "ACTIVE"
                          ? "Active"
                          : s === "COMPLETED"
                            ? "Completed"
                            : "Inactive"}
                      </span>
                      <div className="d-flex gap-1">
                        <button
                          className="action-btn edit"
                          onClick={() => setEditGoal(g)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(g)}
                          disabled={deletingId === gId(g)}
                          title="Delete"
                        >
                          {deletingId === gId(g) ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            <i className="bi bi-trash" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="prod-card-title mb-1">{gTitle(g)}</div>
                    {gDesc(g) && (
                      <p
                        style={{
                          color: "var(--muted-text)",
                          fontSize: "0.8rem",
                          margin: "0 0 8px",
                          lineHeight: 1.5,
                        }}
                      >
                        {gDesc(g)}
                      </p>
                    )}
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--muted-text)",
                      }}
                    >
                      <i className="bi bi-calendar3 me-1" />
                      Target: {fmtDate(g.targetDate ?? g.endDate)}
                    </div>
                    {g.programName && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--soft-blue)",
                          marginTop: 4,
                        }}
                      >
                        <i className="bi bi-collection me-1" />
                        {g.programName}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <GoalModal
          onClose={() => setShowCreate(false)}
          onSaved={fetchGoals}
          showToast={showToast}
        />
      )}
      {editGoal && (
        <GoalModal
          goal={editGoal}
          onClose={() => setEditGoal(null)}
          onSaved={fetchGoals}
          showToast={showToast}
        />
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
