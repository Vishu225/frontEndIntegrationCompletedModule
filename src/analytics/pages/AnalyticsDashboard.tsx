import React, { useState, useEffect } from "react";
import * as API from "../api/analyticsService";
import type {
  IReport,
  ChartDataPoint,
  ChartType,
  SelectedChart,
} from "../api/analyticsService";
import { useToast } from "../../shared/useToast";
import ChartCard from "../components/ChartCard";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#355872",
  "#7aaace",
  "#9cd5ff",
  "#27ae60",
  "#e67e22",
  "#6f42c1",
  "#e74c3c",
  "#f4a923",
];

const toChartData = (
  dto: API.GraphResponseDTO<string, number>,
): ChartDataPoint[] => dto.data.map((d) => ({ name: d.x, value: d.y }));

function EnlargedChart({ chart }: { chart: SelectedChart }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      {chart.type === "pie" ? (
        <PieChart>
          <Pie
            data={chart.data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {chart.data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      ) : chart.type === "line" ? (
        <LineChart data={chart.data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8a9bb0" }} />
          <YAxis tick={{ fontSize: 12, fill: "#8a9bb0" }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#355872"
            strokeWidth={2.5}
            dot={{ fill: "#7aaace", r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      ) : (
        <BarChart data={chart.data} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#8a9bb0" }} />
          <YAxis tick={{ fontSize: 12, fill: "#8a9bb0" }} />
          <Tooltip />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chart.data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}

function ReportFormModal({
  showModal,
  editMode,
  currentReport,
  onChangeReport,
  onSubmit,
  onClose,
}: {
  showModal: boolean;
  editMode: boolean;
  currentReport: IReport;
  onChangeReport: (r: IReport) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  if (!showModal) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="results-modal animate__animated animate__fadeInDown animate__faster"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="results-modal-header">
          <h4 className="mb-0 fw-bold">
            {editMode ? "Edit Report" : "Generate New Report"}
          </h4>
          <button className="action-btn close-btn" onClick={onClose}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className="results-modal-body">
          <form onSubmit={onSubmit}>
            <div className="form-group mb-3">
              <label>Scope</label>
              <input
                className="input-field"
                value={currentReport.scope}
                onChange={(e) =>
                  onChangeReport({ ...currentReport, scope: e.target.value })
                }
                placeholder="e.g. Q1 2025, Department-wide…"
                required
              />
            </div>
            <div className="form-group mb-4">
              <label>Metrics</label>
              <textarea
                className="input-field"
                rows={4}
                value={currentReport.metrics}
                onChange={(e) =>
                  onChangeReport({ ...currentReport, metrics: e.target.value })
                }
                placeholder="Describe the metrics to capture…"
                required
                style={{ resize: "vertical" }}
              />
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button
                type="button"
                className="btn-outline-theme"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn-grad">
                <i
                  className={`bi ${editMode ? "bi-pencil-fill" : "bi-plus-lg"} me-1`}
                />
                {editMode ? "Update Report" : "Create Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const AnalyticsDashboard: React.FC = () => {
  const { showToast, ToastContainer } = useToast();
  const [view, setView] = useState<"dashboard" | "reports">("dashboard");
  const [reports, setReports] = useState<IReport[]>([]);
  const [selectedChart, setSelectedChart] = useState<SelectedChart | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentReport, setCurrentReport] = useState<IReport>({
    scope: "",
    metrics: "",
  });
  const [partData, setPartData] = useState<ChartDataPoint[]>([]);
  const [deptData, setDeptData] = useState<ChartDataPoint[]>([]);
  const [trendData, setTrendData] = useState<ChartDataPoint[]>([]);
  const [catData, setCatData] = useState<ChartDataPoint[]>([]);
  const [programStatusData, setProgramStatusData] = useState<ChartDataPoint[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchReports();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [p, d, t, c, ps] = await Promise.all([
        API.getParticipationStatus(),
        API.getDeptParticipation(),
        API.getMonthlyTrend(),
        API.getCategoryParticipation(),
        API.getProgramStatus(),
      ]);
      setPartData(toChartData(p.data));
      setDeptData(toChartData(d.data));
      setTrendData(toChartData(t.data));
      setCatData(toChartData(c.data));
      setProgramStatusData(toChartData(ps.data));
    } catch {
      showToast("Failed to load analytics data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = () =>
    API.getAllReports()
      .then((res) => setReports(res.data))
      .catch(() => showToast("Failed to load reports.", "error"));

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode && currentReport.reportId) {
        await API.updateReport(currentReport.reportId, currentReport);
        showToast("Report updated!", "success");
      } else {
        await API.createReport(currentReport);
        showToast("Report created!", "success");
      }
      setShowModal(false);
      fetchReports();
    } catch {
      showToast("Failed to save report.", "error");
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await API.deleteReport(id);
      showToast("Report deleted.", "info");
      fetchReports();
    } catch {
      showToast("Failed to delete report.", "error");
    }
  };

  const openChart = (
    type: ChartType,
    data: ChartDataPoint[],
    label: string,
  ) => {
    if (data.length) setSelectedChart({ type, data, label });
  };

  const charts = [
    {
      title: "Participation Status",
      badgeIcon: "bi-pie-chart-fill",
      badgeLabel: "Pie",
      type: "pie" as ChartType,
      data: partData,
    },
    {
      title: "Departmental Reach",
      badgeIcon: "bi-bar-chart-fill",
      badgeLabel: "Bar",
      type: "bar" as ChartType,
      data: deptData,
    },
    {
      title: "Monthly Trend",
      badgeIcon: "bi-graph-up",
      badgeLabel: "Line",
      type: "line" as ChartType,
      data: trendData,
    },
    {
      title: "Category Participation",
      badgeIcon: "bi-bar-chart-steps",
      badgeLabel: "Bar",
      type: "bar" as ChartType,
      data: catData,
    },
  ];

  return (
    <div
      className="main-content animate__animated animate__fadeIn"
      style={{ padding: "2.2rem", margin: "0px auto" }}
    >
      <ToastContainer />
      <div className="d-flex flex-wrap gap-2 mb-4 align-items-center">
        {[
          { key: "dashboard", icon: "bi-graph-up-arrow", label: "Dashboard" },
          {
            key: "reports",
            icon: "bi-file-earmark-bar-graph",
            label: "Reports",
          },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setView(t.key as "dashboard" | "reports")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor:
                view === t.key
                  ? "var(--primary-navy)"
                  : "rgba(122,170,206,0.3)",
              background:
                view === t.key ? "var(--primary-navy)" : "transparent",
              color: view === t.key ? "white" : "var(--muted-text)",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <i className={`bi ${t.icon}`} />
            {t.label}
          </button>
        ))}
        <button
          className="btn-outline-theme ms-auto"
          style={{ fontSize: "0.82rem" }}
          onClick={fetchAnalytics}
        >
          <i className="bi bi-arrow-clockwise me-1" />
          Refresh
        </button>
      </div>

      {view === "dashboard" && (
        <>
          <div className="page-header mb-4">
            <h1 className="page-title">
              <i
                className="bi bi-graph-up-arrow me-3"
                style={{ color: "var(--soft-blue)" }}
              />
              Analytics Dashboard
            </h1>
            <p className="page-subtitle">
              Wellness program insights &amp; participation overview.
            </p>
          </div>
          <div className="row g-3 mb-4">
            {[
              {
                icon: "bi-people-fill",
                value: loading
                  ? "…"
                  : partData.reduce((s, d) => s + d.value, 0),
                label: "Total Participation",
                bg: "#eef4fa",
              },
              {
                icon: "bi-grid-fill",
                value: loading
                  ? "…"
                  : (programStatusData.find((d) => d.name === "ACTIVE")
                      ?.value ?? 0),
                label: "Active Programs",
                bg: "rgba(122,170,206,0.1)",
              },
              {
                icon: "bi-building",
                value: loading ? "…" : deptData.length,
                label: "Departments",
                bg: "var(--bg-cream)",
              },
              {
                icon: "bi-file-text-fill",
                value: reports.length,
                label: "Saved Reports",
                bg: "rgba(68,179,126,0.08)",
              },
            ].map(({ icon, value, label, bg }) => (
              <div key={label} className="col-6 col-lg-3">
                <div
                  className="prod-card text-center"
                  style={{ margin: 0, background: bg, padding: "15px" }}
                >
                  <div className="header-icon mx-auto mb-2">
                    <i className={`bi ${icon}`} />
                  </div>
                  <div className="stat-value" style={{ fontSize: "1.6rem" }}>
                    {value}
                  </div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>
          <h5 className="fw-bold mb-3" style={{ color: "var(--primary-navy)" }}>
            <i
              className="bi bi-bar-chart-line me-2"
              style={{ color: "var(--soft-blue)" }}
            />
            Visual Insights{" "}
            <span
              style={{ fontSize: "0.78rem", color: "#8a9bb0", fontWeight: 400 }}
            >
              — click any chart to enlarge
            </span>
          </h5>
          <div className="row g-4">
            {charts.map((c) => (
              <div key={c.title} className="col-lg-6">
                <ChartCard {...c} loading={loading} onOpenChart={openChart} />
              </div>
            ))}
          </div>
        </>
      )}

      {view === "reports" && (
        <>
          <div className="page-header mb-4">
            <h1 className="page-title">
              <i
                className="bi bi-file-earmark-bar-graph me-3"
                style={{ color: "var(--soft-blue)" }}
              />
              Management Reports
            </h1>
            <p className="page-subtitle">
              Create, view and manage analytics reports.
            </p>
          </div>
          <div className="prod-card" style={{padding:"15px"}}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span
                style={{
                  background: "rgba(53,88,114,0.08)",
                  padding: "2px 10px",
                  borderRadius: 10,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--primary-navy)",
                }}
              >
                {reports.length} report{reports.length !== 1 ? "s" : ""}
              </span>
              <button
                className="btn-grad"
                onClick={() => {
                  setEditMode(false);
                  setCurrentReport({ scope: "", metrics: "" });
                  setShowModal(true);
                }}
              >
                <i className="bi bi-plus-lg me-1" />
                New Report
              </button>
            </div>
            {reports.length === 0 ? (
              <div className="empty-state">
                <i
                  className="bi bi-file-earmark-x"
                  style={{
                    fontSize: "2.5rem",
                    display: "block",
                    marginBottom: 8,
                  }}
                />
                No reports yet. Create your first report!
              </div>
            ) : (
              <div className="table-responsive">
                <table className="wellness-table w-100">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Metric</th>
                      <th>Scope</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr
                        key={r.reportId}
                        className="animate__animated animate__fadeIn"
                      >
                        <td>
                          <span
                            style={{
                              background: "rgba(53,88,114,0.08)",
                              padding: "2px 8px",
                              borderRadius: 8,
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            #{r.reportId}
                          </span>
                        </td>
                        <td
                          className="fw-semibold"
                          style={{
                            fontSize: "0.9rem",
                            maxWidth: 220,
                            color: "var(--primary-navy)",
                          }}
                        >
                          {r.metrics}
                        </td>
                        <td>
                          <span
                            className="badge-category"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {r.scope}
                          </span>
                        </td>
                        <td style={{ color: "#8a9bb0", fontSize: "0.85rem" }}>
                          {r.generatedDate ?? "—"}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              className="action-btn edit"
                              onClick={() => {
                                setEditMode(true);
                                setCurrentReport(r);
                                setShowModal(true);
                              }}
                            >
                              <i className="bi bi-pencil-fill" />
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteReport(r.reportId!)}
                            >
                              <i className="bi bi-trash-fill" />
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
        </>
      )}

      {selectedChart && (
        <div className="modal-backdrop" onClick={() => setSelectedChart(null)}>
          <div
            className="results-modal animate__animated animate__zoomIn animate__faster"
            style={{ maxWidth: 800 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="results-modal-header">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="header-icon"
                  style={{
                    width: 40,
                    height: 40,
                    fontSize: "1rem",
                    borderRadius: 10,
                  }}
                >
                  <i
                    className={`bi ${selectedChart.type === "pie" ? "bi-pie-chart-fill" : selectedChart.type === "line" ? "bi-graph-up" : "bi-bar-chart-fill"}`}
                  />
                </div>
                <h4 className="mb-0 fw-bold">{selectedChart.label}</h4>
              </div>
              <button
                className="action-btn close-btn"
                onClick={() => setSelectedChart(null)}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="results-modal-body" style={{ height: 480 }}>
              <EnlargedChart chart={selectedChart} />
            </div>
          </div>
        </div>
      )}

      <ReportFormModal
        showModal={showModal}
        editMode={editMode}
        currentReport={currentReport}
        onChangeReport={setCurrentReport}
        onSubmit={handleReportSubmit}
        onClose={() => setShowModal(false)}
      />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AnalyticsDashboard;
