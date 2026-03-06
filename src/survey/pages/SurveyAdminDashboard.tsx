import { useState, useEffect, useCallback } from "react";
import { surveyService } from "../api/surveyService";
import type { Survey, Program } from "../api/surveyService";
import SurveyResultsModal from "../components/SurveyResultsModal";
import QuestionBuilder from "../components/QuestionBuilder";
import { useAuth } from "../../shared/AuthContext";
import { useToast } from "../../shared/useToast";

type SurveyStep = "draft" | "questions" | "activate";
type RepoTab = "active" | "closed" | "draft";

const SURVEY_STEPS: SurveyStep[] = ["draft", "questions", "activate"];

interface FormData {
  title: string;
  programId: string;
  description: string;
  anonymous: boolean;
}

const SurveyAdminDashboard = () => {
  const { userId } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [closedSurveys, setClosedSurveys] = useState<Survey[]>([]);
  const [draftSurveys, setDraftSurveys] = useState<Survey[]>([]);
  const [repoTab, setRepoTab] = useState<RepoTab>("active");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    programId: "",
    description: "",
    anonymous: false,
  });
  const [step, setStep] = useState<SurveyStep>("draft");
  const [draftedSurvey, setDraftedSurvey] = useState<Survey | null>(null);
  const [viewingSurvey, setViewingSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [pRes, sRes, cRes, dRes] = await Promise.all([
        surveyService.getActivePrograms(),
        surveyService.getActiveSurveys(),
        surveyService.getClosedSurveys(),
        surveyService.getDraftSurveys().catch(() => ({ data: [] as Survey[] })),
      ]);
      setPrograms(
        Array.isArray(pRes.data) ? pRes.data : (pRes.data?.content ?? []),
      );
      setSurveys(sRes.data || []);
      setClosedSurveys(cRes.data || []);
      setDraftSurveys(dRes.data || []);
    } catch {
      showToast("Failed to load data from backend.", "error");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    if (!formData.title.trim() || !formData.programId) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await surveyService.createSurvey({
        title: formData.title,
        programId: Number(formData.programId),
        createdById: Number(userId) || 1,
        anonymous: formData.anonymous,
      });
      setDraftedSurvey(res.data);
      setStep("questions");
      showToast(`Survey "${formData.title}" drafted successfully!`);
    } catch {
      showToast("Failed to create survey. Is the backend running?", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!draftedSurvey) return;
    setLoading(true);
    try {
      await surveyService.activateSurvey(draftedSurvey.surveyId);
      showToast("Survey activated and is now live!");
      setStep("draft");
      setDraftedSurvey(null);
      setFormData({
        title: "",
        programId: "",
        description: "",
        anonymous: false,
      });
      fetchData();
    } catch {
      showToast("Failed to activate survey.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (id: number) => {
    try {
      await surveyService.closeSurvey(id);
      showToast("Survey closed — moved to Closed tab.");
      await fetchData();
      setRepoTab("closed");
    } catch {
      showToast("Failed to close survey.", "error");
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await surveyService.deleteSurvey(id);
      showToast("Survey and all data permanently deleted.", "error");
      fetchData();
    } catch {
      showToast("Failed to delete survey.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleReActivate = async (id: number) => {
    try {
      await surveyService.activateSurvey(id);
      showToast("Survey re-activated and is now live!");
      await fetchData();
      setRepoTab("active");
    } catch {
      showToast("Failed to re-activate survey.", "error");
    }
  };

  const stepIndex = SURVEY_STEPS.indexOf(step);

  return (
    <div className="animate__animated animate__fadeIn">
      <ToastContainer />

      <header className="mb-5">
        <div className="d-flex align-items-center gap-3 mb-1">
          <div className="header-icon">
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <div>
            <h1 className="fw-bold mb-0">Management Console</h1>
            <p className="text-muted mb-0">
              Orchestrate wellness programs and survey lifecycle.
            </p>
          </div>
        </div>
      </header>

      <div className="row g-4 mb-4">
        {/* Survey Builder Wizard */}
        <div className="col-12 col-xl-6">
          <div className="prod-card h-100" style={{ padding: "15px" }}>
            {/* Step Indicator */}
            <div className="step-indicator mb-4">
              {(["Draft", "Questions", "Activate"] as const).map((label, i) => (
                <div
                  key={label}
                  className={`step-dot ${i <= stepIndex ? "active" : ""}`}
                >
                  <span className="step-num">{i + 1}</span>
                  <span className="step-label">{label}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Draft */}
            {step === "draft" && (
              <>
                <h4 className="fw-bold mb-4">
                  <i className="bi bi-pencil-square me-2 text-soft-blue"></i>
                  Draft New Survey
                </h4>
                <div className="form-group mb-3">
                  <label>Survey Title *</label>
                  <input
                    className="input-field"
                    placeholder="e.g. Q1 Mental Health Check"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Description</label>
                  <textarea
                    className="input-field"
                    rows={2}
                    placeholder="Brief purpose of this survey..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div className="form-group mb-3">
                  <label>Program Linkage *</label>
                  <select
                    className="input-field"
                    value={formData.programId}
                    onChange={(e) =>
                      setFormData({ ...formData, programId: e.target.value })
                    }
                  >
                    <option value="">Choose Program...</option>
                    {programs.map((p) => (
                      <option key={p.programId} value={p.programId}>
                        {p.programName ?? `Program #${p.programId}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-check mb-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="anonCheck"
                    checked={formData.anonymous}
                    onChange={(e) =>
                      setFormData({ ...formData, anonymous: e.target.checked })
                    }
                  />
                  <label
                    className="form-check-label small fw-semibold"
                    htmlFor="anonCheck"
                  >
                    Anonymous Responses
                  </label>
                </div>
                <button
                  className="btn-grad w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <i className="bi bi-arrow-right-circle"></i>
                  )}
                  Create Draft &amp; Add Questions
                </button>
              </>
            )}

            {/* Step 2: Add Questions */}
            {step === "questions" && draftedSurvey && (
              <QuestionBuilder
                survey={draftedSurvey}
                onDone={() => setStep("activate")}
                showToast={showToast}
              />
            )}

            {/* Step 3: Activate */}
            {step === "activate" && draftedSurvey && (
              <>
                <h4 className="fw-bold mb-3">
                  <i className="bi bi-rocket-takeoff me-2 text-soft-blue"></i>
                  Ready to Launch
                </h4>
                <div className="alert-card success mb-4">
                  <p className="mb-1 fw-semibold">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Questions saved for &ldquo;{draftedSurvey.title}&rdquo;
                  </p>
                  <p className="small mb-0 text-muted">
                    Activating will make this survey visible to all enrolled
                    employees.
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-link text-muted text-decoration-none"
                    onClick={() => setStep("questions")}
                  >
                    ← Back
                  </button>
                  <button
                    className="btn-grad flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    onClick={handleActivate}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <i className="bi bi-broadcast"></i>
                    )}
                    Activate Survey
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Quick Stats + Workflow Guide */}
        <div className="col-12 col-xl-6">
          <div className="d-flex flex-column gap-4 h-100">
            <div className="row g-3">
              <div className="col-6">
                <div className="prod-card stat-card text-center py-4">
                  <div className="stat-icon mb-2">
                    <i className="bi bi-broadcast"></i>
                  </div>
                  <div className="stat-value">{surveys.length}</div>
                  <div className="stat-label">Active Surveys</div>
                </div>
              </div>
              <div className="col-6">
                <div className="prod-card stat-card text-center py-4">
                  <div className="stat-icon closed mb-2">
                    <i className="bi bi-archive"></i>
                  </div>
                  <div className="stat-value">{closedSurveys.length}</div>
                  <div className="stat-label">Closed Surveys</div>
                </div>
              </div>
              <div className="col-6">
                <div className="prod-card stat-card text-center py-4">
                  <div className="stat-icon draft mb-2">
                    <i className="bi bi-pencil-square"></i>
                  </div>
                  <div className="stat-value">{draftSurveys.length}</div>
                  <div className="stat-label">Drafts</div>
                </div>
              </div>
              <div className="col-6">
                <div className="prod-card stat-card text-center py-4">
                  <div className="stat-icon programs mb-2">
                    <i className="bi bi-diagram-3"></i>
                  </div>
                  <div className="stat-value">{programs.length}</div>
                  <div className="stat-label">Programs</div>
                </div>
              </div>
            </div>

            <div className="prod-card flex-grow-1" style={{ padding: "15px" }}>
              <h6
                className="fw-bold mb-3 text-muted text-uppercase"
                style={{ fontSize: "0.72rem", letterSpacing: "0.07em" }}
              >
                <i className="bi bi-info-circle me-2"></i>Workflow Guide
              </h6>
              <div className="d-flex flex-column gap-3">
                {[
                  {
                    icon: "bi-pencil-square",
                    color: "var(--soft-blue)",
                    title: "1. Draft",
                    desc: "Create a survey and link it to a wellness program.",
                  },
                  {
                    icon: "bi-list-check",
                    color: "var(--primary-navy)",
                    title: "2. Add Questions",
                    desc: "Choose from 6 question types — text, rating, slider and more.",
                  },
                  {
                    icon: "bi-broadcast",
                    color: "#27ae60",
                    title: "3. Activate",
                    desc: "Go live — enrolled employees will see it instantly.",
                  },
                  {
                    icon: "bi-lock",
                    color: "#e67e22",
                    title: "4. Close / Archive",
                    desc: "Close the survey when collection is done. Re-activate anytime.",
                  },
                ].map((s) => (
                  <div key={s.title} className="d-flex align-items-start gap-3">
                    <div
                      className="workflow-icon flex-shrink-0"
                      style={{ "--wf-color": s.color } as React.CSSProperties}
                    >
                      <i className={`bi ${s.icon}`}></i>
                    </div>
                    <div>
                      <div className="fw-semibold small">{s.title}</div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {s.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Repository */}
      <div className="prod-card" style={{ padding: "15px" }}>
        <div className="d-flex align-items-center gap-3 mb-4">
          <h4 className="fw-bold mb-0">
            <i className="bi bi-table me-2 text-soft-blue"></i>
            Survey Repository
          </h4>
          <div className="repo-tabs ms-auto">
            <button
              className={`repo-tab ${repoTab === "active" ? "active" : ""}`}
              onClick={() => setRepoTab("active")}
            >
              <i className="bi bi-broadcast me-2"></i>Active
              <span className="repo-tab-count">{surveys.length}</span>
            </button>
            <button
              className={`repo-tab ${repoTab === "draft" ? "active" : ""}`}
              onClick={() => setRepoTab("draft")}
            >
              <i className="bi bi-pencil-square me-2"></i>Drafts
              <span
                className={`repo-tab-count ${draftSurveys.length > 0 ? "has-items" : ""}`}
                style={
                  draftSurveys.length > 0
                    ? { background: "rgba(108,117,125,0.12)", color: "#6c757d" }
                    : {}
                }
              >
                {draftSurveys.length}
              </span>
            </button>
            <button
              className={`repo-tab ${repoTab === "closed" ? "active" : ""}`}
              onClick={() => setRepoTab("closed")}
            >
              <i className="bi bi-archive me-2"></i>Closed
              <span
                className={`repo-tab-count ${closedSurveys.length > 0 ? "has-items" : ""}`}
              >
                {closedSurveys.length}
              </span>
            </button>
          </div>
        </div>

        {/* Active surveys table */}
        {repoTab === "active" &&
          (surveys.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
              <p className="fw-semibold mb-1">No active surveys yet</p>
              <p className="small text-muted">
                Draft and activate your first survey above.
              </p>
            </div>
          ) : (
            <SurveyTable
              surveys={surveys}
              statusPill={
                <span className="status-pill active">
                  <i className="bi bi-circle-fill me-1"></i> Active
                </span>
              }
              deleting={deleting}
              onView={(s) => setViewingSurvey(s)}
              onClose={(id) => handleClose(id)}
              onDelete={(id) => handleDelete(id)}
            />
          ))}

        {/* Draft surveys table */}
        {repoTab === "draft" &&
          (draftSurveys.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-pencil-square fs-1 mb-3 d-block"></i>
              <p className="fw-semibold mb-1">No draft surveys</p>
              <p className="small text-muted">
                Surveys you create but haven't activated yet will appear here.
              </p>
            </div>
          ) : (
            <SurveyTableDraftClosed
              surveys={draftSurveys}
              statusPill={
                <span className="status-pill draft">
                  <i className="bi bi-pencil-fill me-1"></i> Draft
                </span>
              }
              deleting={deleting}
              onView={null}
              onReActivate={(id) => handleReActivate(id)}
              onDelete={(id) => handleDelete(id)}
            />
          ))}

        {/* Closed surveys table */}
        {repoTab === "closed" &&
          (closedSurveys.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-archive fs-1 mb-3 d-block"></i>
              <p className="fw-semibold mb-1">No closed surveys</p>
              <p className="small text-muted">
                When you close an active survey it will appear here — you can
                re-activate it at any time.
              </p>
            </div>
          ) : (
            <SurveyTableDraftClosed
              surveys={closedSurveys}
              statusPill={
                <span className="status-pill closed">
                  <i className="bi bi-lock-fill me-1"></i> Closed
                </span>
              }
              deleting={deleting}
              onView={(s) => setViewingSurvey(s)}
              onReActivate={(id) => handleReActivate(id)}
              onDelete={(id) => handleDelete(id)}
            />
          ))}
      </div>

      {viewingSurvey && (
        <SurveyResultsModal
          survey={viewingSurvey}
          onClose={() => setViewingSurvey(null)}
        />
      )}
    </div>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

interface SurveyTableProps {
  surveys: Survey[];
  statusPill: React.ReactNode;
  deleting: number | null;
  onView: (s: Survey) => void;
  onClose: (id: number) => void;
  onDelete: (id: number) => void;
}

const SurveyTable = ({
  surveys,
  statusPill,
  deleting,
  onView,
  onClose,
  onDelete,
}: SurveyTableProps) => (
  <div className="table-responsive">
    <table className="table table-borderless align-middle">
      <thead>
        <tr className="text-muted small">
          <th>SURVEY</th>
          <th>PROGRAM</th>
          <th>STATUS</th>
          <th className="text-end">ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {surveys.map((s) => (
          <tr key={s.surveyId} className="survey-row">
            <td>
              <div className="fw-semibold">{s.title}</div>
              <div className="small text-muted">ID #{s.surveyId}</div>
            </td>
            <td>
              <span className="program-badge">
                {s.program?.programName ??
                  `#${s.program?.programId ?? s.programId ?? "?"}`}
              </span>
            </td>
            <td>{statusPill}</td>
            <td className="text-end">
              <div className="d-flex gap-2 justify-content-end">
                <button
                  className="action-btn view"
                  title="View Responses"
                  onClick={() => onView(s)}
                >
                  <i className="bi bi-bar-chart-line-fill"></i>
                </button>
                <button
                  className="action-btn close-btn"
                  title="Close Survey"
                  onClick={() => onClose(s.surveyId)}
                >
                  <i className="bi bi-lock-fill"></i>
                </button>
                <button
                  className="action-btn delete"
                  title="Force Delete"
                  onClick={() => onDelete(s.surveyId)}
                  disabled={deleting === s.surveyId}
                >
                  {deleting === s.surveyId ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <i className="bi bi-trash3-fill"></i>
                  )}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface SurveyTableDraftClosedProps {
  surveys: Survey[];
  statusPill: React.ReactNode;
  deleting: number | null;
  onView: ((s: Survey) => void) | null;
  onReActivate: (id: number) => void;
  onDelete: (id: number) => void;
}

const SurveyTableDraftClosed = ({
  surveys,
  statusPill,
  deleting,
  onView,
  onReActivate,
  onDelete,
}: SurveyTableDraftClosedProps) => (
  <div className="table-responsive">
    <table className="table table-borderless align-middle">
      <thead>
        <tr className="text-muted small">
          <th>SURVEY</th>
          <th>PROGRAM</th>
          <th>STATUS</th>
          <th className="text-end">ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {surveys.map((s) => (
          <tr key={s.surveyId} className="survey-row">
            <td>
              <div className="fw-semibold">{s.title}</div>
              <div className="small text-muted">ID #{s.surveyId}</div>
            </td>
            <td>
              <span className="program-badge">
                {s.program?.programName ??
                  `#${s.program?.programId ?? s.programId ?? "?"}`}
              </span>
            </td>
            <td>{statusPill}</td>
            <td className="text-end">
              <div className="d-flex gap-2 justify-content-end">
                {onView && (
                  <button
                    className="action-btn view"
                    title="View Responses"
                    onClick={() => onView(s)}
                  >
                    <i className="bi bi-bar-chart-line-fill"></i>
                  </button>
                )}
                <button
                  className="action-btn reactivate"
                  title="Activate Survey"
                  onClick={() => onReActivate(s.surveyId)}
                >
                  <i className="bi bi-broadcast"></i>
                </button>
                <button
                  className="action-btn delete"
                  title="Force Delete"
                  onClick={() => onDelete(s.surveyId)}
                  disabled={deleting === s.surveyId}
                >
                  {deleting === s.surveyId ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <i className="bi bi-trash3-fill"></i>
                  )}
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SurveyAdminDashboard;
