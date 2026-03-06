import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateProgram } from "../api/programService";
import type {
  ProgramResponseDTO,
  ProgramUpdateRequestDTO,
  ProgramCategory,
} from "../api/program.types";

const CATEGORIES: ProgramCategory[] = [
  "FITNESS",
  "MENTAL_WELLNESS",
  "NUTRITION",
  "YOGA",
  "MINDFULNESS",
  "WELLNESS",
];
const CATEGORY_LABELS: Record<ProgramCategory, string> = {
  FITNESS: "Fitness",
  MENTAL_WELLNESS: "Mental Wellness",
  NUTRITION: "Nutrition",
  YOGA: "Yoga",
  MINDFULNESS: "Mindfulness",
  WELLNESS: "Wellness",
};

interface Props {
  isOpen: boolean;
  program: ProgramResponseDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpdateProgramModal({
  isOpen,
  program,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<ProgramUpdateRequestDTO>({
    programName: "",
    programDescription: "",
    category: "FITNESS",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (program) {
      setForm({
        programName: program.programName,
        programDescription: program.programDescription,
        category: program.category,
      });
      setErrors({});
    }
  }, [program]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value as ProgramCategory });
    setErrors({ ...errors, [name]: "" });
  }

  function validate(): boolean {
    const err: Record<string, string> = {};
    if (!form.programName.trim()) err.programName = "Program name is required.";
    if (!form.programDescription.trim())
      err.programDescription = "Description is required.";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!program || !validate()) return;
    try {
      setSubmitting(true);
      await updateProgram(program.programId, form);
      toast.success("✅ Program updated successfully!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(
        `❌ ${e?.response?.data?.message ?? "Failed to update program."}`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen || !program) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="results-modal animate__animated animate__zoomIn animate__faster"
        style={{ maxWidth: 500 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="results-modal-header">
          <h2
            className="fw-bold mb-0"
            style={{ color: "var(--primary-navy)", fontSize: "1.1rem" }}
          >
            <i className="bi bi-pencil-square me-2" />
            Update Program
          </h2>
          <button onClick={onClose} className="action-btn close-btn">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="results-modal-body">
          <div
            className="mb-3 p-2 rounded"
            style={{
              background: "rgba(122,170,206,0.1)",
              fontSize: 12.5,
              color: "var(--muted-text)",
            }}
          >
            <i className="bi bi-hash me-1" />
            ID:{" "}
            <strong style={{ color: "var(--primary-navy)" }}>
              {program.programId}
            </strong>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Program Name *</label>
              <input
                className="input-field"
                name="programName"
                value={form.programName}
                onChange={handleChange}
                maxLength={120}
              />
              {errors.programName && (
                <small className="text-danger">{errors.programName}</small>
              )}
            </div>
            <div className="form-group mb-3">
              <label>Description *</label>
              <textarea
                className="input-field"
                name="programDescription"
                value={form.programDescription}
                onChange={handleChange}
                rows={3}
                style={{ resize: "vertical" }}
              />
              {errors.programDescription && (
                <small className="text-danger">
                  {errors.programDescription}
                </small>
              )}
            </div>
            <div className="form-group mb-4">
              <label>Category *</label>
              <select
                className="input-field"
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>
            <div className="d-flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-grad"
                style={{ flex: 1, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? (
                  "Saving…"
                ) : (
                  <>
                    <i className="bi bi-check-lg me-1" />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="action-btn close-btn"
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                }}
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
