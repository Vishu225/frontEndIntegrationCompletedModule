import { JSX } from "react";
interface StatusBadgeProps {
  status: string;
}
export default function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
  const cls: Record<string, string> = {
    ACTIVE: "active",
    INACTIVE: "inactive",
    CLOSED: "closed",
    DRAFT: "draft",
  };
  return <span className={`status-pill ${cls[status] ?? ""}`}>{status}</span>;
}
