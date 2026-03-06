import { useState, useEffect } from "react";
import { useAuth } from "../../shared/AuthContext";
import { useToast } from "../../shared/useToast";
import {
  getAllPrograms,
  getChallengesByProgram,
  insertChallenge,
  updateChallenge,
  deleteChallenge,
  IChallenge,
  IProgram,
} from "../api/challengeService";

const getErrMsg = (err: unknown) => {
  const e = err as { response?: { data?: unknown } };
  const d = e.response?.data ?? "";
  return typeof d === "string"
    ? d
    : ((d as { message?: string })?.message ?? "");
};

const emptyChallenge: Omit<IChallenge, "challengeId"> = {
  title: "",
  endDate: "",
  totalProgress: 0,
  challengeStatus: "ACTIVE",
  programId: 0,
};

function ChallengeModal({
  challenge,
  programs,
  isEdit,
  onClose,
  onSaved,
  managerId,
  showToast,
}: {
  challenge: Partial<IChallenge>;
  programs: IProgram[];
  isEdit: boolean;
  onClose: () => void;
  onSaved: () => void;
  managerId: string;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}) {
  const [form, setForm] = useState<Partial<IChallenge>>(challenge);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = "Title is required.";
    if (!form.endDate) e.endDate = "End date is required.";
    if (!isEdit && (!form.programId || form.programId === 0))
      e.programId = "Select a program.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = ev.target;
    setForm((p) => ({
      ...p,
      [name]: ["challengeId", "totalProgress", "programId"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateChallenge(managerId, form.challengeId!, {
          title: form.title,
          endDate: form.endDate,
          status: form.challengeStatus,
          totalProgress: form.totalProgress,
        });
        showToast("Challenge updated!", "success");
      } else {
        await insertChallenge(form.programId!, managerId, {
          title: form.title!,
          endDate: form.endDate!,
          totalProgress: form.totalProgress ?? 0,
          challengeStatus: form.challengeStatus ?? "ACTIVE",
          programId: form.programId!,
        });
        showToast("Challenge created!", "success");
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(getErrMsg(err) || "Failed to save.", "error");
    } finally {
      setSaving(false);
    }
  };

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
              className={`bi ${isEdit ? "bi-pencil-square" : "bi-plus-circle"} me-2`}
            />
            {isEdit ? "Edit Challenge" : "New Challenge"}
          </h2>
          <button className="action-btn close-btn" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="results-modal-body">
          <form onSubmit={handleSubmit}>
            {!isEdit && (
              <div className="form-group mb-3">
                <label>Program *</label>
                <select
                  className="input-field"
                  name="programId"
                  value={form.programId ?? 0}
                  onChange={handleChange}
                >
                  <option value={0} disabled>
                    — Select a Program —
                  </option>
                  {programs.map((p) => (
                    <option key={p.programId} value={p.programId}>
                      {p.programName}
                    </option>
                  ))}
                </select>
                {errors.programId && (
                  <div className="form-error">{errors.programId}</div>
                )}
              </div>
            )}
            <div className="form-group mb-3">
              <label>Title *</label>
              <input
                className="input-field"
                name="title"
                value={form.title ?? ""}
                onChange={handleChange}
                placeholder="e.g. Walk 10,000 steps"
              />
              {errors.title && <div className="form-error">{errors.title}</div>}
            </div>
            <div className="row g-3 mb-3">
              <div className="col-12 col-sm-6">
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    className="input-field"
                    type="date"
                    name="endDate"
                    value={form.endDate?.slice(0, 10) ?? ""}
                    onChange={handleChange}
                  />
                  {errors.endDate && (
                    <div className="form-error">{errors.endDate}</div>
                  )}
                </div>
              </div>
              <div className="col-12 col-sm-6">
                <div className="form-group">
                  <label>Total Progress Target</label>
                  <input
                    className="input-field"
                    type="number"
                    name="totalProgress"
                    value={form.totalProgress ?? 0}
                    onChange={handleChange}
                    min={0}
                  />
                </div>
              </div>
            </div>
            <div className="form-group mb-3">
              <label>Status</label>
              <select
                className="input-field"
                name="challengeStatus"
                value={form.challengeStatus ?? "ACTIVE"}
                onChange={handleChange}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
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
                    Saving…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1" />
                    Save Challenge
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

export default function ChallengePage() {
  const { userId } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const managerId = String(userId ?? "");
  const [challenges, setChallenges] = useState<IChallenge[]>([]);
  const [programs, setPrograms] = useState<IProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editChallenge, setEditChallenge] = useState<IChallenge | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const loadData = async (programList?: IProgram[]) => {
    const source = programList ?? programs;
    if (!source.length) return;
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        source.map((p) =>
          getChallengesByProgram(p.programId, managerId)
            .then((r) => (r.data as IChallenge[]) || [])
            .catch(() => [] as IChallenge[]),
        ),
      );
      setChallenges(results.flat());
    } catch {
      setError("Failed to load challenges.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    if (!managerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAllPrograms();
      const fetchedPrograms: IProgram[] = res.data || [];
      setPrograms(fetchedPrograms);
      await loadData(fetchedPrograms);
    } catch (err) {
      setError(getErrMsg(err) || "Failed to load programs.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [managerId]);

  const handleDelete = async (challenge: IChallenge) => {
    if (!window.confirm(`Delete challenge "${challenge.title}"?`)) return;
    setDeletingId(challenge.challengeId);
    try {
      await deleteChallenge(managerId, challenge.challengeId);
      setChallenges((p) =>
        p.filter((c) => c.challengeId !== challenge.challengeId),
      );
      showToast("Challenge deleted.", "info");
    } catch (err) {
      showToast(getErrMsg(err) || "Failed to delete.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = challenges.filter(
    (c) => !search || c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const statusStyle = (s: string) =>
    s === "COMPLETED"
      ? {
          background: "rgba(68,179,126,0.12)",
          color: "#27ae60",
          border: "1px solid rgba(68,179,126,0.3)",
        }
      : {
          background: "rgba(122,170,206,0.12)",
          color: "var(--primary-navy)",
          border: "1px solid rgba(122,170,206,0.3)",
        };

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ padding: "2.2rem" , margin:"0px auto"}}
    >
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-3">
        <div>
          <h1 className="page-title">
            <i
              className="bi bi-trophy me-3"
              style={{ color: "var(--soft-blue)" }}
            />
            Challenges
          </h1>
          <p className="page-subtitle">
            Manage wellness challenges across all programs.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn-outline-theme"
            style={{ fontSize: "0.82rem" }}
            onClick={fetchAll}
          >
            <i className="bi bi-arrow-clockwise me-1" />
            Refresh
          </button>
          <button className="btn-grad" onClick={() => setShowForm(true)}>
            <i className="bi bi-plus-circle me-1" />
            New Challenge
          </button>
        </div>
      </div>

      <div className="prod-card mb-3">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div style={{ position: "relative" }}>
              <i
                className="bi bi-search"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted-text)",
                }}
              />
              <input
                className="input-field"
                style={{ paddingLeft: 36 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search challenges…"
              />
            </div>
          </div>
          <div className="col-auto ms-md-auto">
            <span style={{ fontSize: "0.82rem", color: "var(--muted-text)" }}>
              {filtered.length} challenge{filtered.length !== 1 ? "s" : ""}{" "}
              across {programs.length} programs
            </span>
          </div>
        </div>
      </div>

      <div className="prod-card">
        {error && (
          <div
            className="alert alert-danger py-2 px-3 mb-3"
            style={{ fontSize: "0.82rem" }}
          >
            <i className="bi bi-exclamation-circle me-1" />
            {error}
          </div>
        )}
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
            <span style={{ color: "var(--muted-text)" }}>
              Loading challenges…
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <i
              className="bi bi-trophy"
              style={{ fontSize: "2.5rem", display: "block", marginBottom: 8 }}
            />
            <div>
              {search
                ? "No matching challenges."
                : "No challenges yet. Create the first one!"}
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="wellness-table w-100">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>End Date</th>
                  <th>Progress Target</th>
                  <th>Status</th>
                  <th>Program</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.challengeId}
                    className="animate__animated animate__fadeIn"
                  >
                    <td
                      className="fw-semibold"
                      style={{ color: "var(--primary-navy)" }}
                    >
                      {c.title}
                    </td>
                    <td style={{ fontSize: "0.82rem" }}>
                      <i
                        className="bi bi-calendar3 me-1"
                        style={{ color: "var(--soft-blue)" }}
                      />
                      {c.endDate
                        ? new Date(c.endDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td>{c.totalProgress}</td>
                    <td>
                      <span
                        style={{
                          ...statusStyle(c.challengeStatus),
                          padding: "2px 10px",
                          borderRadius: 10,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {c.challengeStatus}
                      </span>
                    </td>
                    <td
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--muted-text)",
                      }}
                    >
                      {/* backend returns nested program object; fall back to programId lookup */}
                      {c.program?.programName ??
                        programs.find(
                          (p) =>
                            p.programId ===
                            (c.program?.programId ?? c.programId),
                        )?.programName ??
                        c.program?.programId ??
                        c.programId ??
                        "—"}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="action-btn edit"
                          onClick={() => setEditChallenge(c)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(c)}
                          disabled={deletingId === c.challengeId}
                          title="Delete"
                        >
                          {deletingId === c.challengeId ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            <i className="bi bi-trash" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ChallengeModal
          challenge={{ ...emptyChallenge, challengeId: 0 }}
          programs={programs}
          isEdit={false}
          onClose={() => setShowForm(false)}
          onSaved={() => loadData()}
          managerId={managerId}
          showToast={showToast}
        />
      )}
      {editChallenge && (
        <ChallengeModal
          challenge={editChallenge}
          programs={programs}
          isEdit={true}
          onClose={() => setEditChallenge(null)}
          onSaved={() => loadData()}
          managerId={managerId}
          showToast={showToast}
        />
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
