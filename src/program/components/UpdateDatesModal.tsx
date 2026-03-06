import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { updateProgramDates } from "../api/programService";
import type {
  ProgramResponseDTO,
  ProgramDateUpdateRequestDTO,
} from "../api/program.types";

interface Props {
  isOpen: boolean;
  program: ProgramResponseDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}
const EMPTY: ProgramDateUpdateRequestDTO = {
  startDate: "",
  endDate: "",
  enrollmentStartDate: "",
  enrollmentEndDate: "",
};

export default function UpdateDatesModal({
  isOpen,
  program,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<ProgramDateUpdateRequestDTO>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (program) {
      setForm({
        startDate: program.startDate?.slice(0, 10) ?? "",
        endDate: program.endDate?.slice(0, 10) ?? "",
        enrollmentStartDate: program.enrollmentStartDate?.slice(0, 10) ?? "",
        enrollmentEndDate: program.enrollmentEndDate?.slice(0, 10) ?? "",
      });
      setErrors({});
    }
  }, [program]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  }

  function validate(): boolean {
    const err: Record<string, string> = {};
    if (!form.startDate) err.startDate = "Required.";
    if (!form.endDate) err.endDate = "Required.";
    if (!form.enrollmentStartDate) err.enrollmentStartDate = "Required.";
    if (!form.enrollmentEndDate) err.enrollmentEndDate = "Required.";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      err.endDate = "Must be after start date.";
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
    if (!program || !validate()) return;
    try {
      setSubmitting(true);
      await updateProgramDates(program.programId, form);
      toast.success("📅 Program dates updated!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(
        `❌ ${e?.response?.data?.message ?? "Failed to update dates."}`,
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
            <i className="bi bi-calendar2-range me-2" />
            Update Program Dates
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
            </strong>{" "}
            ·{" "}
            <strong style={{ color: "var(--primary-navy)" }}>
              {program.programName}
            </strong>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label
                className="fw-semibold mb-2 d-block"
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
                className="fw-semibold mb-2 d-block"
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
                  "Saving…"
                ) : (
                  <>
                    <i className="bi bi-calendar-check me-1" />
                    Update Dates
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
