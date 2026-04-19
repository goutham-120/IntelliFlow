import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/home/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AnalyticsDashboard from "../pages/analytics/AnalyticsDashboard";
import AuditLogs from "../pages/audit/AuditLogs";
import Dashboard from "../pages/dashboard/Dashboard";
import Inbox from "../pages/inbox/Inbox";
import UserManagement from "../pages/org/UserManagement";
import GroupManagement from "../pages/org/GroupManagement";
import SLADashboard from "../pages/sla/SLADashboard";
import TeamManagement from "../pages/org/TeamManagement";
import WorkflowList from "../pages/workflows/WorkflowList";
import WorkflowCreate from "../pages/workflows/WorkflowCreate";
import WorkflowDetails from "../pages/workflows/WorkflowDetails";
import TaskList from "../pages/tasks/TaskList";
import TaskCreate from "../pages/tasks/TaskCreate";
import TaskDetails from "../pages/tasks/TaskDetails";

import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleGuard from "../components/common/RoleGuard";
import MainLayout from "../layouts/MainLayout";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/inbox"
            element={
              <RoleGuard allowedRoles={["admin", "user"]}>
                <Inbox />
              </RoleGuard>
            }
          />

          <Route
            path="/workflows"
            element={
              <RoleGuard allowedRoles={["admin", "user"]}>
                <WorkflowList />
              </RoleGuard>
            }
          />
          <Route
            path="/workflows/create"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <WorkflowCreate />
              </RoleGuard>
            }
          />
          <Route
            path="/workflows/:workflowId"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <WorkflowDetails />
              </RoleGuard>
            }
          />
          <Route
            path="/tasks"
            element={
              <RoleGuard allowedRoles={["admin", "user"]}>
                <TaskList />
              </RoleGuard>
            }
          />
          <Route
            path="/tasks/create"
            element={
              <RoleGuard allowedRoles={["admin", "user"]}>
                <TaskCreate />
              </RoleGuard>
            }
          />
          <Route
            path="/tasks/:taskId"
            element={
              <RoleGuard allowedRoles={["admin", "user"]}>
                <TaskDetails />
              </RoleGuard>
            }
          />
          <Route
            path="/sla"
            element={
              <RoleGuard allowedRoles={["admin", "user"]}>
                <SLADashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/analytics"
            element={
              <RoleGuard allowedRoles={["admin", "user"]}>
                <AnalyticsDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/users"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <UserManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/groups"
            element={
              <RoleGuard allowedRoles={["admin", "user"]}>
                <GroupManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/teams"
            element={
              <RoleGuard allowedRoles={["admin", "user"]}>
                <TeamManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/audit"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <AuditLogs />
              </RoleGuard>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
