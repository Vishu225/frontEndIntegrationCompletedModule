import { useState } from "react";
import { surveyService } from "../api/surveyService";
import type { Survey } from "../api/surveyService";

const QUESTION_TYPES = [
  {
    value: "TEXT",
    label: "Long Text",
    icon: "bi-textarea-t",
    description: "Open-ended paragraph answer",
  },
  {
    value: "SHORT_TEXT",
    label: "Short Text",
    icon: "bi-input-cursor-text",
    description: "Single line answer",
  },
  {
    value: "RATING",
    label: "Rating (1–5)",
    icon: "bi-star-half",
    description: "Star rating out of 5",
  },
  {
    value: "SLIDER",
    label: "Slider (0–10)",
    icon: "bi-sliders",
    description: "Numeric slider 0 to 10",
  },
  {
    value: "BOOLEAN",
    label: "Yes / No",
    icon: "bi-toggle-on",
    description: "Simple yes or no choice",
  },
  {
    value: "MULTIPLE_CHOICE",
    label: "Multiple Choice",
    icon: "bi-ui-radios",
    description: "Pick one option from a list",
  },
];

interface QuestionBuilderProps {
  survey: Survey;
  onDone: () => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

interface QuestionDraft {
  questionText: string;
  questionType: string;
  questionOrder: number;
  required: boolean;
  options: string;
}

const DEFAULT_QUESTION = (): QuestionDraft => ({
  questionText: "",
  questionType: "TEXT",
  questionOrder: 1,
  required: true,
  options: "",
});

const QuestionBuilder = ({
  survey,
  onDone,
  showToast,
}: QuestionBuilderProps) => {
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    DEFAULT_QUESTION(),
  ]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { ...DEFAULT_QUESTION(), questionOrder: prev.length + 1 },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(
      questions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, questionOrder: i + 1 })),
    );
  };

  const updateField = <K extends keyof QuestionDraft>(
    index: number,
    field: K,
    value: QuestionDraft[K],
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q)),
    );
  };

  const handleSave = async () => {
    if (questions.some((q) => !q.questionText.trim())) {
      showToast("All questions must have text.", "error");
      return;
    }
    if (
      questions.some(
        (q) => q.questionType === "MULTIPLE_CHOICE" && !q.options.trim(),
      )
    ) {
      showToast("Multiple Choice questions need at least one option.", "error");
      return;
    }

    setSaving(true);
    try {
      for (const q of questions) {
        const textPayload =
          q.questionType === "MULTIPLE_CHOICE" && q.options.trim()
            ? `${q.questionText}||${q.options.trim()}`
            : q.questionText;

        await surveyService.addQuestion(survey.surveyId, {
          questionText: textPayload,
          questionType: q.questionType,
          questionOrder: q.questionOrder,
          required: q.required,
        });
      }
      showToast(`${questions.length} question(s) saved!`);
      onDone();
    } catch {
      showToast("Failed to save questions. Check backend.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h4 className="fw-bold mb-1">
        <i className="bi bi-list-check me-2 text-soft-blue"></i>
        Add Questions
      </h4>
      <p className="text-muted small mb-4">
        Survey: <strong>{survey.title}</strong>
      </p>

      <div className="question-list mb-3">
        {questions.map((q, i) => {
          const typeInfo = QUESTION_TYPES.find(
            (t) => t.value === q.questionType,
          );
          return (
            <div key={i} className="question-item mb-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="q-num">{i + 1}</span>
                <span className="small fw-bold text-muted text-uppercase">
                  Question
                </span>
                <div className="form-check form-switch ms-auto d-flex align-items-center gap-2 mb-0">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id={`req-${i}`}
                    checked={q.required}
                    onChange={(e) =>
                      updateField(i, "required", e.target.checked)
                    }
                  />
                  <label
                    className="form-check-label small text-muted mb-0"
                    htmlFor={`req-${i}`}
                  >
                    Required
                  </label>
                </div>
                <button
                  className="btn-icon"
                  onClick={() => removeQuestion(i)}
                  disabled={questions.length === 1}
                  title="Remove"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <input
                className="input-field mb-2"
                placeholder="e.g. How would you rate your stress level?"
                value={q.questionText}
                onChange={(e) => updateField(i, "questionText", e.target.value)}
              />

              <div className="qtype-grid mb-2">
                {QUESTION_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`qtype-btn ${q.questionType === t.value ? "active" : ""}`}
                    onClick={() => updateField(i, "questionType", t.value)}
                    title={t.description}
                  >
                    <i className={`bi ${t.icon}`}></i>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>

              {q.questionType === "MULTIPLE_CHOICE" && (
                <input
                  className="input-field"
                  placeholder="Options (comma-separated): Strongly Agree, Agree, Neutral..."
                  value={q.options}
                  onChange={(e) => updateField(i, "options", e.target.value)}
                />
              )}

              <div className="mt-2">
                <span className="qtype-preview-pill">
                  <i className={`bi ${typeInfo?.icon} me-1`}></i>
                  {typeInfo?.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="btn btn-outline-secondary w-100 mb-4"
        style={{ borderStyle: "dashed" }}
        onClick={addQuestion}
      >
        <i className="bi bi-plus-lg me-2"></i>Add Another Question
      </button>

      <button
        className="btn-grad w-100 d-flex align-items-center justify-content-center gap-2"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <span className="spinner-border spinner-border-sm"></span>
        ) : (
          <i className="bi bi-floppy-fill"></i>
        )}
        Save &amp; Continue
      </button>
    </>
  );
};

export default QuestionBuilder;
