import React, { useState } from "react";
import { toast } from "react-toastify";
import { createProgram } from "../api/programService";
import type {
  ProgramCreateRequestDTO,
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
const EMPTY_FORM: ProgramCreateRequestDTO = {
  programName: "",
  programDescription: "",
  startDate: "",
  endDate: "",
  enrollmentStartDate: "",
  enrollmentEndDate: "",
  category: "FITNESS",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProgramModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<ProgramCreateRequestDTO>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!form.startDate) err.startDate = "Start date is required.";
    if (!form.endDate) err.endDate = "End date is required.";
    if (!form.enrollmentStartDate)
      err.enrollmentStartDate = "Enrollment start is required.";
    if (!form.enrollmentEndDate)
      err.enrollmentEndDate = "Enrollment end is required.";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      err.endDate = "End date must be after start date.";
    if (
      form.enrollmentStartDate &&
      form.enrollmentEndDate &&
      form.enrollmentEndDate < form.enrollmentStartDate
    )
      err.enrollmentEndDate = "Must be after enrollment start.";
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitting(true);
      await createProgram(form);
      toast.success("✅ Program created successfully!");
      setForm(EMPTY_FORM);
      setErrors({});
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(
        `❌ ${e?.response?.data?.message ?? "Failed to create program."}`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => {
        onClose();
        setErrors({});
      }}
    >
      <div
        className="results-modal animate__animated animate__zoomIn animate__faster"
        style={{ maxWidth: 580 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="results-modal-header">
          <h2
            className="fw-bold mb-0"
            style={{ color: "var(--primary-navy)", fontSize: "1.1rem" }}
          >
            <i className="bi bi-plus-circle-fill me-2" />
            Create New Program
          </h2>
          <button onClick={onClose} className="action-btn close-btn">
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="results-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <label>Program Name *</label>
              <input
                className="input-field"
                name="programName"
                value={form.programName}
                onChange={handleChange}
                placeholder="e.g. Morning Yoga Challenge"
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
                placeholder="Describe the program goals…"
                rows={3}
                style={{ resize: "vertical" }}
              />
              {errors.programDescription && (
                <small className="text-danger">
                  {errors.programDescription}
                </small>
              )}
            </div>
            <div className="form-group mb-3">
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
            <div className="mb-3">
              <label
                className="form-label fw-semibold mb-2"
                style={{
                  fontSize: "0.82rem",
                  color: "var(--muted-text)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Program Period *
              </label>
              <div className="row g-3">
                <div className="col-6">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="input-field"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                    />
                    {errors.startDate && (
                      <small className="text-danger">{errors.startDate}</small>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="input-field"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      min={form.startDate}
                    />
                    {errors.endDate && (
                      <small className="text-danger">{errors.endDate}</small>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label
                className="form-label fw-semibold mb-2"
                style={{
                  fontSize: "0.82rem",
                  color: "var(--muted-text)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Enrollment Period *
              </label>
              <div className="row g-3">
                <div className="col-6">
                  <div className="form-group">
                    <label>Enrollment Start</label>
                    <input
                      type="date"
                      className="input-field"
                      name="enrollmentStartDate"
                      value={form.enrollmentStartDate}
                      onChange={handleChange}
                    />
                    {errors.enrollmentStartDate && (
                      <small className="text-danger">
                        {errors.enrollmentStartDate}
                      </small>
                    )}
                  </div>
                </div>
                <div className="col-6">
                  <div className="form-group">
                    <label>Enrollment End</label>
                    <input
                      type="date"
                      className="input-field"
                      name="enrollmentEndDate"
                      value={form.enrollmentEndDate}
                      onChange={handleChange}
                      min={form.enrollmentStartDate}
                    />
                    {errors.enrollmentEndDate && (
                      <small className="text-danger">
                        {errors.enrollmentEndDate}
                      </small>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="d-flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-grad"
                style={{ flex: 1, opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? (
                  <>
                    <i
                      className="bi bi-arrow-clockwise"
                      style={{
                        animation: "spin 0.8s linear infinite",
                        display: "inline-block",
                      }}
                    />{" "}
                    Creating…
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle-fill" /> Create Program
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
