import { useEffect, useState } from "react";
import { getAllPrograms } from "../api/programService";

interface Stats {
  planned: number;
  active: number;
  paused: number;
  completed: number;
  total: number;
}
const EMPTY: Stats = {
  planned: 0,
  active: 0,
  paused: 0,
  completed: 0,
  total: 0,
};

export default function ProgramStatsCards({
  refreshTrigger = 0,
}: {
  refreshTrigger?: number;
}) {
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      setLoading(true);
      const programs = await getAllPrograms();
      let planned = 0,
        active = 0,
        paused = 0,
        completed = 0;
      for (const p of programs) {
        if (p.status === "PLANNED") planned++;
        if (p.status === "ACTIVE") active++;
        if (p.status === "PAUSED") paused++;
        if (p.status === "COMPLETED") completed++;
      }
      setStats({ planned, active, paused, completed, total: programs.length });
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const cards = [
    {
      label: "Planned",
      value: stats.planned,
      icon: "bi-calendar-plus",
      color: "#2b5f85",
      bg: "rgba(122,170,206,0.15)",
    },
    {
      label: "Active",
      value: stats.active,
      icon: "bi-play-circle-fill",
      color: "#1a7a35",
      bg: "rgba(40,167,69,0.12)",
    },
    {
      label: "Paused",
      value: stats.paused,
      icon: "bi-pause-circle-fill",
      color: "#856404",
      bg: "rgba(255,193,7,0.15)",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: "bi-check-circle-fill",
      color: "#495057",
      bg: "rgba(108,117,125,0.12)",
    },
  ];

  return (
    <div className="row g-3 mb-4">
      {cards.map(({ label, value, icon, color, bg }) => (
        <div key={label} className="col-6 col-lg-3">
          <div
            className="stat-card"
            style={{ borderTop: `3px solid ${color}` }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: bg,
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                marginBottom: "0.75rem",
              }}
            >
              <i className={`bi ${icon}`} />
            </div>
            <div
              className="stat-value"
              style={{
                color: loading ? "#aaa" : color,
                fontSize: "1.8rem",
                fontWeight: 800,
              }}
            >
              {loading ? "—" : value}
            </div>
            <div className="stat-label">{label} Programs</div>
          </div>
        </div>
      ))}
    </div>
  );
}
