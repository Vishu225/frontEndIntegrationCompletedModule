import { useState, useEffect, useCallback } from "react";
import { surveyService } from "../api/surveyService";
import type { Survey, Question } from "../api/surveyService";
import { useAuth } from "../../shared/AuthContext";
import { useToast } from "../../shared/useToast";

interface ParsedQuestion extends Question {
  options: string[];
}

const SUBMITTED_KEY = "wellness_submitted_surveys";

const getStoredSubmitted = (): Set<number> => {
  try {
    return new Set<number>(
      JSON.parse(sessionStorage.getItem(SUBMITTED_KEY) || "[]"),
    );
  } catch {
    return new Set<number>();
  }
};

const parseQuestion = (q: Question): ParsedQuestion => {
  if (q.questionType === "MULTIPLE_CHOICE" && q.questionText.includes("||")) {
    const [text, opts] = q.questionText.split("||");
    return {
      ...q,
      questionText: text.trim(),
      options: opts
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    };
  }
  return { ...q, options: [] };
};

// ── Answer Input ────────────────────────────────────────────────────────────

interface AnswerInputProps {
  question: ParsedQuestion;
  value: string | undefined;
  onChange: (questionId: number, value: string) => void;
}

const AnswerInput = ({ question, value, onChange }: AnswerInputProps) => {
  const { questionType, questionId, options } = question;
  const val = value ?? "";

  switch (questionType) {
    case "SHORT_TEXT":
      return (
        <input
          className="input-field"
          placeholder="Your answer..."
          value={val}
          onChange={(e) => onChange(questionId, e.target.value)}
        />
      );

    case "RATING": {
      const stars = [1, 2, 3, 4, 5];
      const current = parseInt(val, 10) || 0;
      return (
        <div className="d-flex gap-2 align-items-center mt-1">
          {stars.map((s) => (
            <button
              key={s}
              type="button"
              className={`star-btn ${s <= current ? "active" : ""}`}
              onClick={() => onChange(questionId, String(s))}
            >
              <i
                className={`bi ${s <= current ? "bi-star-fill" : "bi-star"}`}
              ></i>
            </button>
          ))}
          {current > 0 && (
            <span className="small text-muted ms-2">{current} / 5</span>
          )}
        </div>
      );
    }

    case "SLIDER": {
      const num = parseInt(val, 10);
      const display = isNaN(num) ? 5 : num;
      return (
        <div className="slider-wrap mt-2">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>0 — Not at all</span>
            <span className="fw-bold" style={{ color: "var(--primary-navy)" }}>
              {isNaN(num) ? "—" : display}
            </span>
            <span>10 — Extremely</span>
          </div>
          <input
            type="range"
            className="slider-input"
            min="0"
            max="10"
            step="1"
            value={display}
            onChange={(e) => onChange(questionId, e.target.value)}
            onMouseDown={() => {
              if (isNaN(num)) onChange(questionId, "5");
            }}
          />
          <div className="slider-ticks">
            {[0, 2, 4, 6, 8, 10].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        </div>
      );
    }

    case "BOOLEAN":
      return (
        <div className="d-flex gap-3 mt-1">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              className={`bool-btn ${val === opt ? "active" : ""}`}
              onClick={() => onChange(questionId, opt)}
            >
              <i
                className={`bi ${opt === "Yes" ? "bi-hand-thumbs-up" : "bi-hand-thumbs-down"} me-2`}
              ></i>
              {opt}
            </button>
          ))}
        </div>
      );

    case "MULTIPLE_CHOICE":
      return (
        <div className="d-flex flex-column gap-2 mt-1">
          {(options || []).map((opt) => (
            <button
              key={opt}
              type="button"
              className={`mc-option ${val === opt ? "active" : ""}`}
              onClick={() => onChange(questionId, opt)}
            >
              <span className={`mc-dot ${val === opt ? "active" : ""}`}></span>
              {opt}
            </button>
          ))}
        </div>
      );

    default:
      return (
        <textarea
          className="input-field"
          rows={3}
          placeholder="Share your thoughts..."
          value={val}
          onChange={(e) => onChange(questionId, e.target.value)}
        />
      );
  }
};

// ── Employee Dashboard ──────────────────────────────────────────────────────

const SurveyEmployeeDashboard = () => {
  const { userId } = useAuth();
  const { showToast, ToastContainer } = useToast();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [active, setActive] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedIds, setSubmittedIds] =
    useState<Set<number>>(getStoredSubmitted);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const fetchSurveys = useCallback(async () => {
    try {
      const res = await surveyService.getActiveSurveys();
      setSurveys(res.data || []);
    } catch {
      showToast("Failed to load surveys. Is the backend running?", "error");
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const openSurvey = async (s: Survey) => {
    if (submittedIds.has(s.surveyId)) {
      showToast("You've already submitted this survey.", "info");
      return;
    }
    setLoadingQuestions(true);
    try {
      const res = await surveyService.getQuestionsBySurvey(s.surveyId);
      const sorted = (res.data || [])
        .sort(
          (a: Question, b: Question) =>
            (a.questionOrder ?? 0) - (b.questionOrder ?? 0),
        )
        .map(parseQuestion);
      setQuestions(sorted);
      setActive(s);
      setAnswers({});
      setSubmitted(false);
    } catch {
      showToast("Failed to load questions.", "error");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter(
      (q) =>
        q.required &&
        q.questionType !== "SLIDER" &&
        !answers[q.questionId]?.trim(),
    );
    if (unanswered.length > 0) {
      showToast(
        `Please answer all ${unanswered.length} required question(s).`,
        "error",
      );
      return;
    }

    setSubmitting(true);
    try {
      const answerPayload = questions.map((q) => ({
        questionId: q.questionId,
        answerValue: answers[q.questionId] || "",
      }));

      await surveyService.submitSurvey(
        active!.surveyId,
        userId || 0,
        answerPayload,
      );

      setSubmitted(true);
      setSubmittedIds((prev) => {
        const next = new Set(prev);
        next.add(active!.surveyId);
        sessionStorage.setItem(SUBMITTED_KEY, JSON.stringify([...next]));
        return next;
      });
      showToast("Response submitted successfully!");
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const msg =
        axiosErr.response?.data?.message ||
        "Submission failed. Verify you are enrolled in this program.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setActive(null);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="animate__animated animate__fadeIn d-flex flex-column align-items-center justify-content-center py-5">
        <ToastContainer />
        <div className="text-center">
          <div
            className="mb-4 d-flex align-items-center justify-content-center mx-auto"
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--primary-navy), var(--soft-blue))",
              color: "#fff",
              fontSize: "2.5rem",
            }}
          >
            <i className="bi bi-patch-check-fill"></i>
          </div>
          <h2 className="fw-bold mb-2">Response Submitted!</h2>
          <p className="text-muted mb-4">
            Your feedback for <strong>{active?.title}</strong> has been
            recorded.
          </p>
          <button className="btn-grad px-5" onClick={handleCancel}>
            <i className="bi bi-arrow-left me-2"></i>Back to Surveys
          </button>
        </div>
      </div>
    );
  }

  // ── Active survey form ──────────────────────────────────────────────────
  if (active) {
    const totalRequired = questions.filter((q) => q.required).length;
    const answeredRequired = questions.filter(
      (q) => q.required && answers[q.questionId]?.trim(),
    ).length;
    const progress =
      totalRequired > 0 ? (answeredRequired / totalRequired) * 100 : 0;

    return (
      <div className="animate__animated animate__fadeIn">
        <ToastContainer />
        <header className="mb-4 d-flex align-items-center gap-3">
          <button
            className="btn btn-link text-muted text-decoration-none p-0"
            onClick={handleCancel}
          >
            <i className="bi bi-arrow-left fs-5"></i>
          </button>
          <div>
            <h2 className="fw-bold mb-0">{active.title}</h2>
            <p className="text-muted small mb-0">
              {questions.length} question{questions.length !== 1 ? "s" : ""}
            </p>
          </div>
        </header>

        <div className="mb-4">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Progress</span>
            <span>
              {answeredRequired} / {totalRequired} required
            </span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: "var(--border-light)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, var(--primary-navy), var(--soft-blue))",
                transition: "width 0.3s ease",
                borderRadius: 3,
              }}
            ></div>
          </div>
        </div>

        <div className="prod-card mx-auto" style={{ maxWidth: "860px" }}>
          {questions.map((q, idx) => (
            <div className="mb-4" key={q.questionId}>
              <label className="fw-bold mb-2 d-flex align-items-start gap-2">
                <span
                  className="flex-shrink-0 mt-1 d-inline-flex align-items-center justify-content-center rounded-circle text-white"
                  style={{
                    width: 24,
                    height: 24,
                    fontSize: "0.75rem",
                    background: "var(--primary-navy)",
                  }}
                >
                  {idx + 1}
                </span>
                <span>
                  {q.questionText}
                  {q.required && <span className="text-danger ms-1">*</span>}
                </span>
              </label>
              <AnswerInput
                question={q}
                value={answers[q.questionId]}
                onChange={handleAnswerChange}
              />
            </div>
          ))}

          <div className="d-flex gap-3 mt-5 pt-3 border-top">
            <button
              className="btn btn-link text-decoration-none text-muted"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="btn-grad flex-grow-1 d-flex align-items-center justify-content-center gap-2"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                <i className="bi bi-send-fill"></i>
              )}
              Submit Response
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Survey list ─────────────────────────────────────────────────────────
  return (
    <div className="animate__animated animate__fadeIn">
      <ToastContainer />

      <header className="mb-5">
        <div className="d-flex align-items-center gap-3 mb-1">
          <div className="header-icon employee">
            <i className="bi bi-person-badge-fill"></i>
          </div>
          <div>
            <h1 className="fw-bold mb-0">My Programs</h1>
            <p className="text-muted mb-0">
              Active feedback sessions for your enrollments.
            </p>
          </div>
        </div>
      </header>

      {loadingQuestions && (
        <div className="text-center py-5">
          <div
            className="spinner-border"
            style={{ color: "var(--primary-navy)" }}
          ></div>
        </div>
      )}

      {!loadingQuestions && surveys.length === 0 && (
        <div className="empty-state mx-auto" style={{ maxWidth: "400px" }}>
          <i className="bi bi-clipboard2-x fs-1 mb-3 d-block"></i>
          <p className="fw-semibold mb-1">No active surveys available</p>
          <p className="small text-muted">
            Your administrator hasn't activated any surveys yet.
          </p>
        </div>
      )}

      {!loadingQuestions && (
        <div className="row g-4">
          {surveys.map((s) => (
            <div className="col-md-6 col-xl-4" key={s.surveyId}>
              <div
                className="prod-card d-flex flex-column justify-content-between gap-4"
                style={submittedIds.has(s.surveyId) ? { opacity: 0.75 } : {}}
              >
                <div>
                  <div
                    className="small text-uppercase fw-bold mb-1"
                    style={{
                      color: submittedIds.has(s.surveyId)
                        ? "var(--muted-text)"
                        : "var(--soft-blue)",
                    }}
                  >
                    <i
                      className={`bi ${submittedIds.has(s.surveyId) ? "bi-check2-circle" : "bi-clipboard2-pulse-fill"} me-1`}
                    ></i>
                    {submittedIds.has(s.surveyId)
                      ? "Response Recorded"
                      : "Feedback Required"}
                  </div>
                  <h4 className="fw-bold m-0 mb-2">{s.title}</h4>
                  <span className="program-badge">
                    {s.program?.programName ??
                      `Program #${s.program?.programId ?? s.programId ?? "?"}`}
                  </span>
                </div>
                <button
                  className={
                    submittedIds.has(s.surveyId)
                      ? "btn btn-outline-secondary"
                      : "btn-grad"
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                  onClick={() => openSurvey(s)}
                >
                  {submittedIds.has(s.surveyId) ? (
                    <>
                      <i className="bi bi-lock-fill"></i> Already Submitted
                    </>
                  ) : (
                    <>
                      <i className="bi bi-play-fill"></i> Start Survey
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SurveyEmployeeDashboard;
