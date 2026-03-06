import { useState, useEffect } from "react";
import { surveyService } from "../api/surveyService";
import type { Survey } from "../api/surveyService";

interface SurveyResultsModalProps {
  survey: Survey;
  onClose: () => void;
}

interface AnswerItem {
  answerId?: number;
  answerValue: string;
  question?: {
    questionId?: number;
    questionText?: string;
    questionOrder?: number;
    required?: boolean;
  };
}

interface UserInfo {
  userId?: number;
  name?: string;
  department?: string;
}

interface SurveyResponse {
  responseId?: number;
  submittedAt?: string;
  user?: UserInfo;
  answers?: AnswerItem[];
}

const SurveyResultsModal = ({ survey, onClose }: SurveyResultsModalProps) => {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await surveyService.getSurveyResponses(survey.surveyId);
        setResponses((res.data as SurveyResponse[]) || []);
      } catch {
        setError("Failed to load responses from backend.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [survey.surveyId]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="results-modal animate__animated animate__fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="results-modal-header">
          <div style={{ minWidth: 0 }}>
            <h4
              className="fw-bold mb-0"
              style={{ wordBreak: "break-word", overflowWrap: "anywhere" }}
            >
              {survey.title}
            </h4>
            <p className="text-muted small mb-0">
              Survey Results — ID #{survey.surveyId}
              {survey.anonymous && (
                <span
                  className="ms-2 badge rounded-pill"
                  style={{
                    background: "var(--muted-text)",
                    color: "#fff",
                    fontSize: "0.72rem",
                  }}
                >
                  <i className="bi bi-incognito me-1" />
                  Anonymous
                </span>
              )}
            </p>
          </div>
          <button
            className="btn-icon flex-shrink-0"
            onClick={onClose}
            title="Close"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="results-modal-body">
          {loading && (
            <div className="text-center py-5">
              <div
                className="spinner-border"
                style={{ color: "var(--primary-navy)" }}
              ></div>
              <p className="text-muted mt-3">Loading responses...</p>
            </div>
          )}

          {error && (
            <div className="alert-card error text-center py-4">
              <i className="bi bi-exclamation-triangle-fill fs-3 mb-2 d-block"></i>
              <p className="mb-0">{error}</p>
            </div>
          )}

          {!loading && !error && responses.length === 0 && (
            <div className="empty-state text-center py-5">
              <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
              <p className="fw-semibold">No responses yet</p>
              <p className="small text-muted">
                Responses will appear here once employees submit their feedback.
              </p>
            </div>
          )}

          {!loading && !error && responses.length > 0 && (
            <div>
              <div className="d-flex align-items-center gap-2 mb-4">
                <span
                  className="badge rounded-pill"
                  style={{
                    background: "var(--primary-navy)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    padding: "0.35em 0.75em",
                  }}
                >
                  {responses.length} response(s)
                </span>
              </div>
              {responses.map((resp, rIdx) => (
                <div
                  key={resp.responseId ?? rIdx}
                  className="prod-card mb-4"
                  style={{ padding: "1rem 1.25rem" }}
                >
                  <div
                    className="d-flex align-items-center gap-2 mb-3 pb-2"
                    style={{ borderBottom: "1px solid var(--border-light)" }}
                  >
                    <i
                      className={`bi ${survey.anonymous || !resp.user ? "bi-incognito" : "bi-person-circle"}`}
                      style={{
                        color:
                          survey.anonymous || !resp.user
                            ? "var(--muted-text)"
                            : "var(--primary-navy)",
                      }}
                    ></i>
                    {survey.anonymous || !resp.user ? (
                      <span className="fw-semibold text-muted fst-italic">
                        Anonymous
                      </span>
                    ) : (
                      <>
                        <span className="fw-semibold">
                          {resp.user?.name ??
                            `User #${resp.user?.userId ?? "Unknown"}`}
                        </span>
                        {resp.user?.department && (
                          <span className="ms-2 small text-muted">
                            · {resp.user.department}
                          </span>
                        )}
                      </>
                    )}
                    <span className="ms-auto small text-muted">
                      {resp.submittedAt
                        ? new Date(resp.submittedAt).toLocaleString()
                        : `Response #${resp.responseId ?? rIdx + 1}`}
                    </span>
                  </div>
                  <div>
                    {(resp.answers ?? []).map((a, aIdx) => (
                      <div
                        key={a.answerId ?? aIdx}
                        className="mb-3"
                        style={{
                          paddingLeft: "0.5rem",
                          borderLeft: "3px solid var(--soft-blue)",
                        }}
                      >
                        <div className="small fw-bold text-muted mb-1">
                          <span
                            className="me-2 text-muted"
                            style={{ fontSize: "0.75rem" }}
                          >
                            Q{a.question?.questionOrder ?? aIdx + 1}
                          </span>
                          {a.question?.questionText ??
                            `Question #${a.question?.questionId ?? aIdx + 1}`}
                          {a.question?.required && (
                            <span className="ms-1 text-danger" title="Required">
                              *
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            color: "var(--text-dark)",
                            fontSize: "0.95rem",
                          }}
                        >
                          {a.answerValue !== "" && a.answerValue != null ? (
                            a.answerValue
                          ) : (
                            <span className="text-muted fst-italic">
                              No answer provided
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyResultsModal;
