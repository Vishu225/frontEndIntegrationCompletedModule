import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProgramStatusBadge from "../components/ProgramStatusBadge";
import CategoryBadge from "../components/CategoryBadge";
import CreateProgramModal from "../components/CreateProgramModal";
import UpdateProgramModal from "../components/UpdateProgramModal";
import UpdateDatesModal from "../components/UpdateDatesModal";
import ProgramStatsCards from "../components/ProgramStatsCards";
import {
  getAllPrograms,
  getProgramById,
  searchPrograms,
  pauseProgram,
  resumeProgram,
  toggleProgramVisibility,
  deleteProgram,
} from "../api/programService";
import type {
  ProgramResponseDTO,
  ProgramStatus,
  ProgramCategory,
} from "../api/program.types";
import ConfirmModal from "../../user/components/ConfirmModal";

const STATUS_OPTIONS: (ProgramStatus | "")[] = [
  "",
  "PLANNED",
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
];
const CATEGORY_OPTIONS: (ProgramCategory | "")[] = [
  "",
  "FITNESS",
  "MENTAL_WELLNESS",
  "NUTRITION",
  "YOGA",
  "MINDFULNESS",
  "WELLNESS",
];
const CATEGORY_LABELS: Record<string, string> = {
  "": "All Categories",
  FITNESS: "Fitness",
  MENTAL_WELLNESS: "Mental Wellness",
  NUTRITION: "Nutrition",
  YOGA: "Yoga",
  MINDFULNESS: "Mindfulness",
  WELLNESS: "Wellness",
};

export default function ManagePrograms() {
  const [programs, setPrograms] = useState<ProgramResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [searchId, setSearchId] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProgramStatus | "">("");
  const [filterCategory, setFilterCategory] = useState<ProgramCategory | "">(
    "",
  );
  const [isFiltered, setIsFiltered] = useState(false);
  const [wasIdSearch, setWasIdSearch] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [updateTarget, setUpdateTarget] = useState<ProgramResponseDTO | null>(
    null,
  );
  const [datesTarget, setDatesTarget] = useState<ProgramResponseDTO | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<ProgramResponseDTO | null>(
    null,
  );

  async function fetchPrograms() {
    try {
      setLoading(true);
      setIsFiltered(false);
      setWasIdSearch(false);
      const data = await getAllPrograms();
      setPrograms(data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(
        `❌ ${e?.response?.data?.message ?? "Failed to load programs."}`,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function handleSearchById() {
    const id = parseInt(searchId.trim(), 10);
    if (isNaN(id) || id <= 0) {
      toast.warning("⚠️ Please enter a valid numeric Program ID.");
      return;
    }
    try {
      setLoading(true);
      const program = await getProgramById(id);
      setPrograms([program]);
      setIsFiltered(true);
      setWasIdSearch(true);
      setHighlightedId(program.programId);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e?.response?.status === 404)
        toast.warning(`⚠️ No program found with ID ${id}.`);
      else toast.error("❌ Failed to fetch program by ID.");
    } finally {
      setLoading(false);
    }
  }

  async function handleFilter() {
    if (!filterStatus && !filterCategory) {
      fetchPrograms();
      return;
    }
    try {
      setLoading(true);
      const results = await searchPrograms({
        status: filterStatus,
        category: filterCategory,
      });
      setPrograms(results);
      setIsFiltered(true);
      setWasIdSearch(false);
      setHighlightedId(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(`❌ ${e?.response?.data?.message ?? "Search failed."}`);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSearchId("");
    setFilterStatus("");
    setFilterCategory("");
    setHighlightedId(null);
    setWasIdSearch(false);
    fetchPrograms();
  }

  function refreshAfterUpdate() {
    if (isFiltered && !wasIdSearch) handleFilter();
    else fetchPrograms();
    setRefreshTrigger((t) => t + 1);
  }

  async function handlePause(id: number) {
    try {
      await pauseProgram(id);
      toast.success("⏸ Program paused.");
      refreshAfterUpdate();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(`❌ ${e?.response?.data?.message ?? "Failed to pause."}`);
    }
  }

  async function handleResume(id: number) {
    try {
      await resumeProgram(id);
      toast.success("▶ Program resumed.");
      refreshAfterUpdate();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(`❌ ${e?.response?.data?.message ?? "Failed to resume."}`);
    }
  }

  async function handleToggleVisibility(id: number) {
    try {
      await toggleProgramVisibility(id);
      toast.info("👁 Visibility toggled.");
      refreshAfterUpdate();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(`❌ ${e?.response?.data?.message ?? "Failed."}`);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteProgram(deleteTarget.programId);
      toast.success("🗑 Program deleted.");
      setDeleteTarget(null);
      refreshAfterUpdate();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(`❌ ${e?.response?.data?.message ?? "Failed to delete."}`);
    }
  }

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ padding: "2.2rem", margin: "0px auto" }}
    >
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="header-icon">
            <i className="bi bi-grid-fill" />
          </div>
          <div>
            <h2
              className="fw-bold mb-0"
              style={{ color: "var(--primary-navy)", fontSize: "1.45rem" }}
            >
              Wellness Programs
            </h2>
            <p
              className="mb-0"
              style={{ color: "var(--muted-text)", fontSize: "0.83rem" }}
            >
              Manage all wellness programs
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-grad"
          style={{ gap: 8, padding: "10px 20px" }}
        >
          <i className="bi bi-plus-circle-fill" /> Create Program
        </button>
      </div>

      <ProgramStatsCards refreshTrigger={refreshTrigger} />

      {/* Search & Filter */}
      <div
        className="rounded-3 mb-4 p-3"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(122,170,206,0.15)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="d-flex flex-wrap gap-3 align-items-end">
          <div>
            <label
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--muted-text)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 5,
              }}
            >
              <i className="bi bi-hash me-1" />
              Search by ID
            </label>
            <div className="d-flex gap-2">
              <input
                className="input-field"
                style={{ width: 130 }}
                type="number"
                placeholder="Program ID…"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchById()}
                min={1}
              />
              <button
                className="btn-grad"
                style={{ padding: "10px 14px" }}
                onClick={handleSearchById}
              >
                <i className="bi bi-search" />
              </button>
            </div>
          </div>
          <div>
            <label
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--muted-text)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 5,
              }}
            >
              Status
            </label>
            <select
              className="input-field"
              style={{ width: 160 }}
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as ProgramStatus | "")
              }
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "" ? "All Statuses" : s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--muted-text)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                marginBottom: 5,
              }}
            >
              Category
            </label>
            <select
              className="input-field"
              style={{ width: 180 }}
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(e.target.value as ProgramCategory | "")
              }
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="d-flex gap-2">
            <button className="btn-grad" onClick={handleFilter}>
              <i className="bi bi-funnel-fill me-1" />
              Filter
            </button>
            <button className="btn-outline-theme" onClick={handleReset}>
              <i className="bi bi-arrow-counterclockwise me-1" />
              Reset
            </button>
          </div>
          {isFiltered && (
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--soft-blue)",
                background: "rgba(122,170,206,0.15)",
                borderRadius: 20,
                padding: "4px 12px",
              }}
            >
              <i className="bi bi-funnel-fill me-1" />
              Filtered View
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-3 overflow-hidden"
        style={{
          background: "var(--white)",
          border: "1px solid rgba(122,170,206,0.18)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {loading ? (
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: 200 }}
          >
            <div className="text-center">
              <i
                className="bi bi-arrow-repeat d-block mb-2"
                style={{
                  fontSize: "2rem",
                  color: "var(--soft-blue)",
                  animation: "spin 1s linear infinite",
                }}
              />
              <span style={{ color: "var(--muted-text)", fontSize: "0.85rem" }}>
                Loading programs…
              </span>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="wellness-table">
              <thead>
                <tr>
                  {[
                    "#ID",
                    "Program Name",
                    "Category",
                    "Status",
                    "Start Date",
                    "End Date",
                    "Enroll Start",
                    "Enroll End",
                    "Admin ID",
                    "Visibility",
                    "Actions",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      style={{ padding: "3rem", textAlign: "center" }}
                    >
                      <i
                        className="bi bi-inbox d-block mb-2"
                        style={{
                          fontSize: "2.5rem",
                          color: "var(--muted-text)",
                        }}
                      />
                      <span
                        style={{
                          color: "var(--muted-text)",
                          fontSize: "0.88rem",
                        }}
                      >
                        No programs found
                      </span>
                    </td>
                  </tr>
                ) : (
                  programs.map((p) => (
                    <tr
                      key={p.programId}
                      style={{
                        background:
                          highlightedId === p.programId
                            ? "rgba(156,213,255,0.15)"
                            : undefined,
                      }}
                    >
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: "var(--soft-blue)",
                            fontFamily: "monospace",
                            fontSize: 13,
                          }}
                        >
                          #{p.programId}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--primary-navy)",
                            fontSize: "0.87rem",
                          }}
                        >
                          {p.programName}
                        </div>
                        {p.programDescription && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--muted-text)",
                              maxWidth: 220,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={p.programDescription}
                          >
                            {p.programDescription}
                          </div>
                        )}
                      </td>
                      <td>
                        <CategoryBadge category={p.category} />
                      </td>
                      <td>
                        <ProgramStatusBadge status={p.status} />
                      </td>
                      <td style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>
                        {p.startDate}
                      </td>
                      <td style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>
                        {p.endDate}
                      </td>
                      <td style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>
                        {p.enrollmentStartDate}
                      </td>
                      <td style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>
                        {p.enrollmentEndDate}
                      </td>
                      <td
                        style={{
                          fontFamily: "monospace",
                          fontSize: 12.5,
                          textAlign: "center",
                        }}
                      >
                        {p.createdByAdminId}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 10,
                            background:
                              p.visibility === "PRIVATE"
                                ? "rgba(231,76,60,0.1)"
                                : "rgba(40,167,69,0.1)",
                            color:
                              p.visibility === "PRIVATE"
                                ? "#e74c3c"
                                : "#27ae60",
                          }}
                        >
                          {p.visibility ?? "PUBLIC"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex flex-nowrap gap-1">
                          <button
                            className="action-btn edit"
                            title="Edit"
                            onClick={() => setUpdateTarget(p)}
                            style={{ width: 30, height: 30, borderRadius: 8 }}
                          >
                            <i
                              className="bi bi-pencil"
                              style={{ fontSize: "0.78rem" }}
                            />
                          </button>
                          <button
                            className="action-btn view"
                            title="Update dates"
                            onClick={() => setDatesTarget(p)}
                            style={{ width: 30, height: 30, borderRadius: 8 }}
                          >
                            <i
                              className="bi bi-calendar2-range"
                              style={{ fontSize: "0.78rem" }}
                            />
                          </button>
                          {p.status === "ACTIVE" && (
                            <button
                              className="action-btn"
                              title="Pause"
                              onClick={() => handlePause(p.programId)}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                background: "rgba(255,193,7,0.1)",
                                border: "1px solid rgba(255,193,7,0.3)",
                                color: "#856404",
                                cursor: "pointer",
                              }}
                            >
                              <i
                                className="bi bi-pause-fill"
                                style={{ fontSize: "0.78rem" }}
                              />
                            </button>
                          )}
                          {p.status === "PAUSED" && (
                            <button
                              className="action-btn"
                              title="Resume"
                              onClick={() => handleResume(p.programId)}
                              style={{
                                width: 30,
                                height: 30,
                                borderRadius: 8,
                                background: "rgba(40,167,69,0.1)",
                                border: "1px solid rgba(40,167,69,0.3)",
                                color: "#1a7a35",
                                cursor: "pointer",
                              }}
                            >
                              <i
                                className="bi bi-play-fill"
                                style={{ fontSize: "0.78rem" }}
                              />
                            </button>
                          )}
                          <button
                            className="action-btn"
                            title={
                              p.visibility === "PRIVATE"
                                ? "Make Public"
                                : "Make Private"
                            }
                            onClick={() => handleToggleVisibility(p.programId)}
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 8,
                              background: "rgba(122,170,206,0.1)",
                              border: "1px solid rgba(122,170,206,0.3)",
                              color: "var(--soft-blue)",
                              cursor: "pointer",
                            }}
                          >
                            <i
                              className={`bi ${p.visibility === "PRIVATE" ? "bi-eye-slash" : "bi-eye"}`}
                              style={{ fontSize: "0.78rem" }}
                            />
                          </button>
                          <button
                            className="action-btn delete"
                            title="Delete"
                            onClick={() => setDeleteTarget(p)}
                            style={{ width: 30, height: 30, borderRadius: 8 }}
                          >
                            <i
                              className="bi bi-trash3-fill"
                              style={{ fontSize: "0.78rem" }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && programs.length > 0 && (
          <div
            className="d-flex justify-content-between align-items-center px-4 py-3"
            style={{
              borderTop: "1px solid rgba(122,170,206,0.15)",
              fontSize: "0.82rem",
              color: "var(--muted-text)",
            }}
          >
            <span>
              <i className="bi bi-info-circle me-1" />
              {isFiltered ? (
                <>
                  <strong style={{ color: "var(--primary-navy)" }}>
                    {programs.length}
                  </strong>{" "}
                  result(s) filtered
                </>
              ) : (
                <>
                  Total:{" "}
                  <strong style={{ color: "var(--primary-navy)" }}>
                    {programs.length}
                  </strong>{" "}
                  program(s)
                </>
              )}
            </span>
            {isFiltered && (
              <button
                onClick={handleReset}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--primary-navy)",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.82rem",
                  textDecoration: "underline",
                }}
              >
                <i className="bi bi-x-circle me-1" />
                Clear filter
              </button>
            )}
          </div>
        )}
      </div>

      <CreateProgramModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSuccess={() => {
          refreshAfterUpdate();
        }}
      />
      <UpdateProgramModal
        isOpen={!!updateTarget}
        program={updateTarget}
        onClose={() => setUpdateTarget(null)}
        onSuccess={refreshAfterUpdate}
      />
      <UpdateDatesModal
        isOpen={!!datesTarget}
        program={datesTarget}
        onClose={() => setDatesTarget(null)}
        onSuccess={refreshAfterUpdate}
      />
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Program"
        message={`Are you sure you want to permanently delete "${deleteTarget?.programName}"? This action cannot be undone.`}
        confirmLabel="Delete Program"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
