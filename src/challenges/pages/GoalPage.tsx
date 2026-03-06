import { useState, useEffect } from "react";
import { useAuth } from "../../shared/AuthContext";
import { useToast } from "../../shared/useToast";
import {
  getAllGoals,
  getGoalHistory,
  insertGoal,
  updateGoal,
  deleteGoal,
  IGoal,
} from "../api/goalService";

const getErrMsg = (err: unknown) => {
  const e = err as { response?: { data?: unknown } };
  const d = e.response?.data ?? "";
  return typeof d === "string"
    ? d
    : ((d as { message?: string })?.message ?? "");
};

const emptyGoal: Omit<IGoal, "goalId" | "completionPercent"> = {
  title: "",
  endDate: "",
  progress: 0,
  totalProgress: 100,
  status: "ACTIVE",
};

function GoalFormModal({
  mode,
  goal,
  onClose,
  onSaved,
  userId,
  showToast,
}: {
  mode: "Insert" | "Update";
  goal: IGoal;
  onClose: () => void;
  onSaved: () => void;
  userId: string;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [form, setForm] = useState<IGoal>(goal);
  const [saving, setSaving] = useState(false);

  const set =
    (field: keyof IGoal) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({
        ...f,
        [field]: [
          "goalId",
          "progress",
          "totalProgress",
          "completionPercent",
        ].includes(field)
          ? Number(e.target.value)
          : e.target.value,
      }));

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.title?.trim()) {
      showToast("Title is required.", "error");
      return;
    }
    setSaving(true);
    try {
      if (mode === "Insert") {
        await insertGoal(userId, {
          title: form.title,
          endDate: form.endDate,
          progress: 0,
          totalProgress: form.totalProgress,
          status: "ACTIVE",
        });
        showToast("Goal created!", "success");
      } else {
        await updateGoal(userId, form);
        showToast("Goal updated!", "success");
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(getErrMsg(err) || "Failed to save goal.", "error");
    } finally {
      setSaving(false);
    }
  };

  const canComplete = form.progress >= form.totalProgress;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="results-modal animate__animated animate__zoomIn animate__faster"
        style={{ maxWidth: 460 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="results-modal-header">
          <h2
            className="fw-bold mb-0"
            style={{ color: "var(--primary-navy)", fontSize: "1rem" }}
          >
            <i
              className={`bi ${mode === "Insert" ? "bi-plus-circle" : "bi-pencil-square"} me-2`}
            />
            {mode === "Insert" ? "New Goal" : "Edit Progress"}
          </h2>
          <button className="action-btn close-btn" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="results-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Title *</label>
              <input
                className="input-field"
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Walk 10,000 steps daily"
                required
              />
            </div>
            {mode === "Insert" ? (
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      className="input-field"
                      type="date"
                      value={form.endDate?.slice(0, 10) ?? ""}
                      onChange={set("endDate")}
                      required
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="form-group">
                    <label>Target Value</label>
                    <input
                      className="input-field"
                      type="number"
                      value={form.totalProgress}
                      onChange={set("totalProgress")}
                      min={1}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-7">
                  <div className="form-group">
                    <label>Progress</label>
                    <input
                      className="input-field"
                      type="number"
                      value={form.progress}
                      onChange={set("progress")}
                      min={0}
                      max={form.totalProgress}
                    />
                  </div>
                </div>
                <div className="col-12 col-sm-5">
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="input-field"
                      value={form.status}
                      onChange={set("status")}
                    >
                      <option value="ACTIVE">Active</option>
                      <option
                        value="COMPLETED"
                        disabled={!canComplete}
                        title={
                          !canComplete
                            ? `Progress must reach ${form.totalProgress}`
                            : ""
                        }
                      >
                        Completed
                      </option>
                    </select>
                    {!canComplete && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--soft-blue)",
                          marginTop: 4,
                        }}
                      >
                        ⚠️ Progress must reach {form.totalProgress} to complete
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="d-flex gap-2 mt-3">
              <button
                type="submit"
                className="btn-grad flex-fill"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Saving…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1" />
                    Save Goal
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

export default function GoalPage() {
  const { userId } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [goals, setGoals] = useState<IGoal[]>([]);
  const [view, setView] = useState<"Current" | "History">("Current");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<IGoal | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res =
        view === "Current"
          ? await getAllGoals(userId)
          : await getGoalHistory(userId);
      const raw: IGoal[] = res.data?.content || res.data || [];
      setGoals(
        view === "Current" ? raw.filter((g) => g.status !== "COMPLETED") : raw,
      );
    } catch {
      showToast("Failed to load goals.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [view, userId]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this goal?") || !userId) return;
    setDeletingId(id);
    try {
      await deleteGoal(userId, id);
      setGoals((p) => p.filter((g) => g.goalId !== id));
      showToast("Goal deleted.", "info");
    } catch (err) {
      showToast(getErrMsg(err) || "Failed to delete.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const baseGoal: IGoal = {
    goalId: 0,
    title: "",
    endDate: "",
    progress: 0,
    totalProgress: 100,
    status: "ACTIVE",
    completionPercent: 0,
  };

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ padding: "2.2rem", margin: "0px auto" }}
    >
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="page-title">
            <i
              className="bi bi-bullseye me-3"
              style={{ color: "var(--soft-blue)" }}
            />
            Wellness Goals
          </h1>
          <p className="page-subtitle">Track your personal health journey.</p>
        </div>
        {view === "Current" && (
          <button className="btn-grad" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-circle me-1" />
            Add New Goal
          </button>
        )}
      </div>

      <div className="d-flex gap-2 mb-4">
        {(["Current", "History"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor:
                view === v ? "var(--primary-navy)" : "rgba(122,170,206,0.3)",
              background: view === v ? "var(--primary-navy)" : "transparent",
              color: view === v ? "white" : "var(--muted-text)",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <i
              className={`bi ${v === "Current" ? "bi-crosshair" : "bi-trophy"}`}
            />
            {v === "Current" ? "Current Goals" : "Goal History"}
          </button>
        ))}
      </div>

      <div className="prod-card" style={{ padding: "15px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2
            className="fw-bold mb-0"
            style={{ fontSize: "1rem", color: "var(--primary-navy)" }}
          >
            {view === "Current" ? "My Active Goals" : "My Goal History"}
          </h2>
          <span style={{ fontSize: "0.78rem", color: "var(--muted-text)" }}>
            {goals.length} goal{goals.length !== 1 ? "s" : ""}
          </span>
        </div>
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
          </div>
        ) : goals.length === 0 ? (
          <div className="empty-state">
            <i
              className="bi bi-bullseye"
              style={{ fontSize: "2.5rem", display: "block", marginBottom: 8 }}
            />
            <div>
              {view === "Current"
                ? "No active goals. Create your first goal!"
                : "No goal history yet."}
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table
              className="wellness-table w-100"
              style={{ tableLayout: "fixed" }}
            >
              <thead>
                <tr>
                  <th style={{ width: "35%" }}>Goal</th>
                  <th style={{ width: "17%" }}>End Date</th>
                  <th style={{ width: "30%" }}>Progress</th>
                  <th style={{ width: "18%", textAlign: "right" }}>
                    {view === "Current" ? "Actions" : "Status"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {goals.map((g) => {
                  const pct = Math.round(
                    (g.progress / (g.totalProgress || 100)) * 100,
                  );
                  const isDone = g.status === "COMPLETED";
                  return (
                    <tr
                      key={g.goalId}
                      className="animate__animated animate__fadeIn"
                    >
                      <td
                        className="fw-semibold"
                        style={{ color: "var(--primary-navy)" }}
                      >
                        {g.title}
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>
                        <i
                          className="bi bi-calendar3 me-1"
                          style={{ color: "var(--soft-blue)" }}
                        />
                        {g.endDate
                          ? new Date(g.endDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td>
                        <div
                          style={{
                            height: 6,
                            borderRadius: 3,
                            background: "rgba(122,170,206,0.15)",
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              borderRadius: 3,
                              background: isDone
                                ? "#27ae60"
                                : "linear-gradient(90deg, var(--primary-navy), var(--soft-blue))",
                              transition: "width 0.4s",
                            }}
                          />
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--muted-text)",
                          }}
                        >
                          {g.progress} / {g.totalProgress} ({pct}%)
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {view === "Current" ? (
                          <div className="d-flex gap-1 justify-content-end">
                            <button
                              className="action-btn edit"
                              onClick={() => setEditGoal(g)}
                              title="Edit"
                            >
                              <i className="bi bi-pencil" />
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDelete(g.goalId)}
                              disabled={deletingId === g.goalId}
                              title="Delete"
                            >
                              {deletingId === g.goalId ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                <i className="bi bi-trash" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span
                            className="status-pill"
                            style={{
                              background: "rgba(68,179,126,0.1)",
                              color: "#27ae60",
                              fontSize: "0.72rem",
                            }}
                          >
                            <i className="bi bi-check-circle-fill me-1" />
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <GoalFormModal
          mode="Insert"
          goal={{ ...baseGoal }}
          onClose={() => setShowForm(false)}
          onSaved={loadData}
          userId={String(userId ?? "0")}
          showToast={showToast}
        />
      )}
      {editGoal && (
        <GoalFormModal
          mode="Update"
          goal={editGoal}
          onClose={() => setEditGoal(null)}
          onSaved={loadData}
          userId={String(userId ?? "0")}
          showToast={showToast}
        />
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
