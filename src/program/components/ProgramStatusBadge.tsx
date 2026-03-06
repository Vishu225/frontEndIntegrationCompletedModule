import type { ProgramStatus } from "../api/program.types";

const STATUS_CONFIG: Record<
  ProgramStatus,
  { label: string; className: string; icon: string }
> = {
  ACTIVE: {
    label: "Active",
    className: "badge-active",
    icon: "bi-play-circle-fill",
  },
  PAUSED: {
    label: "Paused",
    className: "badge-paused",
    icon: "bi-pause-circle-fill",
  },
  PLANNED: {
    label: "Planned",
    className: "badge-planned",
    icon: "bi-calendar-check",
  },
  COMPLETED: {
    label: "Completed",
    className: "badge-completed",
    icon: "bi-check-circle-fill",
  },
};

export default function ProgramStatusBadge({
  status,
}: {
  status: ProgramStatus;
}) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: "badge-completed",
    icon: "bi-circle",
  };
  return (
    <span className={`badge-status ${cfg.className}`}>
      <i className={`bi ${cfg.icon}`} /> {cfg.label}
    </span>
  );
}
