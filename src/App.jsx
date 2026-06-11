// App.jsx - Complete updated version with correct route order
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContexts";
import { NotificationProvider } from "./context/NotificationContext";
import { AuditProvider } from "./context/AuditContext";
import { AssetProvider } from "./context/AssetContext";
import { AssetCategoryProvider } from "./context/AssetCategoryContexts";
import { ClientProvider } from "./context/ClientContext";
import { TeamProvider } from "./context/TeamContext";
import { DashboardProvider } from "./context/DashboardContext";
import { ReportProvider } from "./context/ReportContext";
import { ChecklistBuilderProvider } from "./context/ChecklistBuilderContext";
import { RequestChecklistProvider } from "./context/RequestChecklistContext";
import { AssignmentProvider } from "./context/AssignmentContext";
import { AssetRequestProvider } from "./context/AssetRequestContext";
import TeamAssignmentProvider from "./context/TeamAssignmentContext";
import { ContactInquiryProvider } from "./context/InquiryContext";
import { RecycleBinProvider } from "./context/RecycleBinContext";

// Import pages
import Login from "./components/Login";
import TeamProfile from "./pages/TeamProfile";
import Dashboard from "./pages/Dashboard";
import ClientManagement from "./pages/ClientManagement";
import ClientDetails from "./pages/ClientDetails";
import DashboardLayout from "./layout/Layout";
import TeamManagement from "./pages/TeamManagement";
import TeamDetails from "./pages/TeamDetails";
import ReportsPage from "./pages/Reports";
import ChecklistPage from "./pages/ChecklistBuilder";
import CustomChecklist from "./pages/CustomChecklist";
import GlobalChecklist from "./pages/GlobalChecklist";
import ImportChecklist from "./pages/ImportChecklist";
import CloneChecklist from "./pages/CloneChecklist";
import AssignedChecklist from "./pages/AssignedChecklist";
import Checklistanalytics from "./pages/Checklistanalytics";
import AssignedChecklistDetails from "./pages/AssignedCheckListDetails";
import SubmissionDetails from "./pages/Submissiondetails";
import AssetManagement from "./pages/AssetManagement";
import AddNewAsset from "./pages/AddNewAsset";
import AssetView from "./pages/AssetView";
import EditAsset from "./pages/EditAsset";
import CloneAssets from "./pages/CloneAssetList";
import MyTasks from "./pages/MyTask";
import TaskDetails from "./pages/TaskDetails";
import InspectionHistory from "./pages/Inspectionhistory";
import InspectionHistoryDetails from "./pages/InspectionHistoryDetails";
import MyRequests from "./pages/Myrequests";
import AssetRequestsApp from "./pages/AssetRequest";
import CreateAssetRequest from "./pages/CreateAssetRequest";
import AssetRequestDetails from "./pages/AssetRequestDetails";
import ContactInquiries from "./pages/ContactInquiries";
import AuditLogs from "./pages/AuditLogs";
import Main from "./pages/landing/Main";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AssetCategoryPage from "./pages/AssetCategory";
import RolesManagement from "./pages/RolesManagement";
import DepartmentsManagement from "./pages/DepartmentsManagement";
import LocationsManagement from "./pages/LocationsManagement";
import RecycleBin from "./pages/Recyclebin";

// ==================== APP PROVIDERS ====================
const AppProviders = ({ children }) => (
  <AuthProvider>
    <NotificationProvider>
      <AuditProvider>
        <ClientProvider>
          <TeamProvider>
            <AssetProvider>
              <AssetCategoryProvider>
                <ReportProvider>
                  <AssignmentProvider>
                    <DashboardProvider>
                      <ChecklistBuilderProvider>
                        <RequestChecklistProvider>
                          <AssetRequestProvider>
                            <TeamAssignmentProvider>
                              <ContactInquiryProvider>
                                <RecycleBinProvider>
                                  {children}
                                </RecycleBinProvider>
                              </ContactInquiryProvider>
                            </TeamAssignmentProvider>
                          </AssetRequestProvider>
                        </RequestChecklistProvider>
                      </ChecklistBuilderProvider>
                    </DashboardProvider>
                  </AssignmentProvider>
                </ReportProvider>
              </AssetCategoryProvider>
            </AssetProvider>
          </TeamProvider>
        </ClientProvider>
      </AuditProvider>
    </NotificationProvider>
  </AuthProvider>
);

// ==================== ROLE HELPER ====================
const effectiveRole = (role) => {
  if (role === "super_admin") return "admin";
  return role;
};

// ==================== PROTECTED ROUTE COMPONENT ====================
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #e2e8f0",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: 16,
            }}
          />
          <p style={{ color: "#64748b" }}>Loading...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  const role = effectiveRole(user.role);
  console.log(
    "User role:",
    user.role,
    "→ effective:",
    role,
    "Allowed roles:",
    allowedRoles,
  );

  if (!allowedRoles.includes(role)) {
    console.log("Role not allowed, redirecting based on role");
    if (role === "admin") return <Navigate to="/dashboard" replace />;
    if (role === "team") return <Navigate to="/team" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ==================== MAIN APP COMPONENT ====================
export default function App() {
  return (
    <AppProviders>
      <Router>
        <Routes>
          {/* ==================== PUBLIC ROUTES ==================== */}
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ==================== ADMIN DASHBOARD ==================== */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== TEAM ROUTES (Specific first, then general) ==================== */}
          {/* Task Details - Specific route with ID parameter */}
          <Route
            path="/team/task/:id"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <TaskDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Inspection Details - Specific route with ID parameter */}
          <Route
            path="/team/inspection/:id"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <InspectionHistoryDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Inspection History - List view */}
          <Route
            path="/team/history"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <InspectionHistory />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Team Profile */}
          <Route
            path="/team/profile"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <TeamProfile />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Team Reports */}
          <Route
            path="/team/reports"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Team My Requests */}
          <Route
            path="/team/my-requests"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <MyRequests />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Team Dashboard - General team route (should be last) */}
          <Route
            path="/team"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <MyTasks />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== REPORTS ROUTES ==================== */}
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== CONTACT INQUIRY ROUTES ==================== */}
          <Route
            path="/admin/contact-inquiries"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <ContactInquiries />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== AUDIT LOGS ROUTES ==================== */}
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={["admin", "team", "super_admin"]}>
                <DashboardLayout>
                  <AuditLogs />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== CHECKLIST ROUTES ==================== */}
          <Route
            path="/admin/checklists"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <ChecklistPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/checklists/clone"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <CloneChecklist />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-checklist/global"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <GlobalChecklist />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/create-checklist/custom"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <CustomChecklist />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/import-checklist/excel"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <ImportChecklist />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assigned-checklists"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <AssignedChecklist />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/checklist-analytics/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <Checklistanalytics />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assignment-details/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AssignedChecklistDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assignment-submit-details/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <SubmissionDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== RECYCLE BIN ROUTE ==================== */}
          <Route
            path="/admin/checklists/recycle-bin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <RecycleBin />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== CLIENT MANAGEMENT ROUTES ==================== */}
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <ClientManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/clients-details/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <ClientDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== TEAM MANAGEMENT ROUTES ==================== */}
          <Route
            path="/admin/team"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <TeamManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/team-details/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <TeamDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== ROLE, DEPARTMENT, LOCATION ROUTES ==================== */}
          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <RolesManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <DepartmentsManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/locations"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <LocationsManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== ASSET CATEGORY ROUTES ==================== */}
          <Route
            path="/admin/asset-categories"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetCategoryPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== ASSET MANAGEMENT ROUTES ==================== */}
          <Route
            path="/admin/assets"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetManagement />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assets/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AddNewAsset />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assets/view/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetView />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assets/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <EditAsset />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assets/clone"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <CloneAssets />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== ASSET REQUEST ROUTES ==================== */}
          <Route
            path="/admin/asset-requests"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetRequestsApp />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/asset-requests/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetRequestDetails />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== CREATE ASSET REQUEST ROUTE ==================== */}
          <Route
            path="/admin/create-request"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <CreateAssetRequest />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* ==================== 404 FALLBACK ==================== */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AppProviders>
  );
}
