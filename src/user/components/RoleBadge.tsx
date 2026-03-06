import { JSX } from "react";
interface RoleBadgeProps {
  role: string;
}
export default function RoleBadge({ role }: RoleBadgeProps): JSX.Element {
  const roleClass: Record<string, string> = {
    ADMIN: "role-admin",
    MANAGER: "role-manager",
    EMPLOYEE: "role-employee",
  };
  const icon: Record<string, string> = {
    ADMIN: "bi-shield-check",
    MANAGER: "bi-briefcase",
    EMPLOYEE: "bi-person",
  };
  return (
    <span
      className={`role-badge ${roleClass[role] ?? ""}`}
      style={{ fontSize: "0.72rem" }}
    >
      <i className={`bi ${icon[role] ?? "bi-person"} me-1`} />
      {role}
    </span>
  );
}
