import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./shared/AuthContext";
import ProtectedRoute from "./shared/ProtectedRoute";
import Navbar from "./shared/Navbar";

// User module
import LoginPage from "./user/pages/LoginPage";
import RegisterPage from "./user/pages/RegisterPage";
import AdminDashboard from "./user/pages/AdminDashboard";
import AdminUsers from "./user/pages/AdminUsers";
import ManagerDashboard from "./user/pages/ManagerDashboard";
import EmployeeDashboard from "./user/pages/EmployeeDashboard";
import EmployeeProfile from "./user/pages/EmployeeProfile";

// Program module
import ManagePrograms from "./program/pages/ManagePrograms";

// Activity module
import ActivityEmployeeDashboard from "./activity/pages/ActivityEmployeeDashboard";
import ActivityManagerDashboard from "./activity/pages/ActivityManagerDashboard";
import ActivityNotificationsPage from "./activity/pages/ActivityNotificationsPage";
import ActivitySettingsPage from "./activity/pages/ActivitySettingsPage";
import ActivityHelpPage from "./activity/pages/ActivityHelpPage";
// import ActivityGoalsPage from "./activity/pages/ActivityGoalsPage";

// Challenges module
import ChallengePage from "./challenges/pages/ChallengePage";
import GoalPage from "./challenges/pages/GoalPage";

// Analytics module
import AnalyticsDashboard from "./analytics/pages/AnalyticsDashboard";

// Survey module
import SurveyAdminDashboard from "./survey/pages/SurveyAdminDashboard";
import SurveyEmployeeDashboard from "./survey/pages/SurveyEmployeeDashboard";

// ── Layout wrapper that shows Navbar + main content ─────────────────────────
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Navbar />
      <main className="main-content flex-grow-1 p-4">{children}</main>
    </div>
  );
}

// ── Root redirect based on role ─────────────────────────────────────────────
function RootRedirect() {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  if (role === "MANAGER") return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/employee/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* ── ADMIN routes ─────────────────────────────────────────────── */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AppLayout>
              <AdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AppLayout>
              <AdminUsers />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AppLayout>
              <EmployeeProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/programs/manage"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AppLayout>
              <ManagePrograms />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/challenges"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AppLayout>
              <ChallengePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AppLayout>
              <AnalyticsDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── MANAGER routes ───────────────────────────────────────────── */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <AppLayout>
              <ManagerDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/profile"
        element={
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <AppLayout>
              <EmployeeProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/activity"
        element={
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <AppLayout>
              <ActivityManagerDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/activities"
        element={
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <AppLayout>
              <ActivityManagerDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/manager/challenges"
        element={
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <AppLayout>
              <ChallengePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/goals"
        element={
          <ProtectedRoute allowedRoles={["MANAGER"]}>
            <AppLayout>
              <GoalPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── EMPLOYEE routes ──────────────────────────────────────────── */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <AppLayout>
              <EmployeeDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <AppLayout>
              <EmployeeProfile />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/activity"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <AppLayout>
              <ActivityEmployeeDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/goals"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <AppLayout>
              {/* <ActivityGoalsPage /> */}
              <GoalPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/programs"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <AppLayout>
              <ActivityEmployeeDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      {/* ── Shared routes (multiple roles) ───────────────────────────── */}
      <Route
        path="/survey"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <AppLayout>
              <SurveyAdminDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/survey/employee"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE"]}>
            <AppLayout>
              <SurveyEmployeeDashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ActivityNotificationsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "MANAGER"]}>
            <AppLayout>
              <ActivitySettingsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute allowedRoles={["EMPLOYEE", "MANAGER"]}>
            <AppLayout>
              <ActivityHelpPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
