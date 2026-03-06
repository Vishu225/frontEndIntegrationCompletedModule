import { JSX } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children: JSX.Element;
}

export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps): JSX.Element {
  const { token, role } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
