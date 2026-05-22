// App.jsx - Fixed Version
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContexts";
import { AssetProvider } from "./context/AssetContext";
import { ClientProvider } from "./context/ClientContext";
import { TeamProvider } from "./context/TeamContext";
import { DashboardProvider } from "./context/DashboardContext";
import { ReportProvider } from "./context/ReportContext";
import { ChecklistBuilderProvider } from "./context/ChecklistBuilderContext";
import { RequestChecklistProvider } from "./context/RequestChecklistContext";
import { AssignmentProvider } from "./context/AssignmentContext";
import { AssetRequestProvider } from "./context/AssetRequestContext";
import TeamAssignmentProvider from "./context/TeamAssignmentcontext";
import { ContactInquiryProvider } from "./context/InquiryContext";

// Auth Pages
import Login from "./components/Login";

// Team Pages
import TeamProfile from "./pages/TeamProfile";
import Dashboard from "./pages/Dashboard";
import ClientManagement from "./pages/ClientManagement";
import ClientDetails from "./pages/ClientDetails";
import DashboardLayout from "./layout/Layout";
import TeamManagement from "./pages/TeamManagement";
import TeamDetails from "./pages/TeamDetails";
import ReportsPage from "./pages/Reports";

// Checklist Pages
import ChecklistPage from "./pages/ChecklistBuilder";
import CustomChecklist from "./pages/CustomChecklist";
import GlobalChecklist from "./pages/GlobalChecklist";
import ImportChecklist from "./pages/ImportChecklist";
import CloneChecklist from "./pages/CloneChecklist";
import AssignedChecklist from "./pages/AssignedChecklist";
import Checklistanalytics from "./pages/Checklistanalytics";
import AssignedChecklistDetails from "./pages/AssignedCheckListDetails";
import SubmissionDetails from "./pages/Submissiondetails";

// Asset Pages
import AssetManagement from "./pages/AssetManagement";
import AddNewAsset from "./pages/AddAssetForm";
import AssetView from "./pages/AssetView";
import EditAsset from "./pages/EditAsset";
import CloneAssets from "./pages/CloneAssetList";
import MyTasks from "./pages/MyTask";
import InspectionHistory from "./pages/Inspectionhistory";
import MyRequests from "./pages/Myrequests";
import AssetRequests from "./pages/AssetRequest";
import CreateAssetRequest from "./pages/CreateAssetRequest";
import AssetRequestDetails from "./pages/AssetRequestDetails";
import TaskDetail from "./pages/TaskDetail";

// Contact Inquiry Page
import ContactInquiries from "./pages/ContactInquiries";

// Landing Pages
import Main from "./pages/landing/Main";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

// ==================== PROVIDER WRAPPERS ====================

// Base Combined Provider (most nested providers)
const BaseProviderWrapper = ({ children }) => (
  <ClientProvider>
    <TeamProvider>
      <AssetProvider>
        <ReportProvider>
          <AssignmentProvider>{children}</AssignmentProvider>
        </ReportProvider>
      </AssetProvider>
    </TeamProvider>
  </ClientProvider>
);

// Combined Provider for Admin routes
const CombinedProviderWrapper = ({ children }) => (
  <BaseProviderWrapper>{children}</BaseProviderWrapper>
);

// Asset Provider with TeamProvider
const AssetWithTeamProviderWrapper = ({ children }) => (
  <TeamProvider>
    <AssetProvider>{children}</AssetProvider>
  </TeamProvider>
);

// Asset Request Provider Wrapper with TeamProvider
const AssetRequestWithTeamWrapper = ({ children }) => (
  <TeamProvider>
    <AssetProvider>
      <AssetRequestProvider>{children}</AssetRequestProvider>
    </AssetProvider>
  </TeamProvider>
);

// Asset Request Details Wrapper
const AssetRequestDetailsWrapper = ({ children }) => (
  <TeamProvider>
    <AssetProvider>
      <AssetRequestProvider>{children}</AssetRequestProvider>
    </AssetProvider>
  </TeamProvider>
);

// Asset Provider without TeamProvider
const AssetProviderWrapper = ({ children }) => (
  <AssetProvider>{children}</AssetProvider>
);

// Report Provider Wrapper
const ReportProviderWrapper = ({ children }) => (
  <ReportProvider>
    <AssetProvider>
      <AssignmentProvider>{children}</AssignmentProvider>
    </AssetProvider>
  </ReportProvider>
);

// Contact Inquiry Provider Wrapper
const ContactInquiryProviderWrapper = ({ children }) => (
  <ContactInquiryProvider>
    <BaseProviderWrapper>{children}</BaseProviderWrapper>
  </ContactInquiryProvider>
);

// Team Provider Wrapper
const TeamProviderWrapper = ({ children }) => (
  <TeamProvider>{children}</TeamProvider>
);

// Team Assignment Provider Wrapper
const TeamAssignmentProviderWrapper = ({ children }) => (
  <TeamAssignmentProvider>{children}</TeamAssignmentProvider>
);

// Dashboard wrapper
const DashboardProviderWrapper = ({ children }) => (
  <BaseProviderWrapper>
    <DashboardProvider>{children}</DashboardProvider>
  </BaseProviderWrapper>
);

// Checklist Builder Provider Wrapper for creation pages
const ChecklistBuilderWrapper = ({ children }) => (
  <ChecklistBuilderProvider>
    <BaseProviderWrapper>{children}</BaseProviderWrapper>
  </ChecklistBuilderProvider>
);

// Checklist Page Provider Wrapper (includes both builders)
const ChecklistPageWrapper = ({ children }) => (
  <ChecklistBuilderProvider>
    <RequestChecklistProvider>
      <BaseProviderWrapper>{children}</BaseProviderWrapper>
    </RequestChecklistProvider>
  </ChecklistBuilderProvider>
);

// Request Checklist Provider Wrapper
const RequestChecklistWrapper = ({ children }) => (
  <RequestChecklistProvider>
    <BaseProviderWrapper>{children}</BaseProviderWrapper>
  </RequestChecklistProvider>
);

// ==================== PROTECTED ROUTE ====================

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "super_admin" || user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "team") {
      return <Navigate to="/team" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ==================== MAIN APP ====================

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Admin Dashboard Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <DashboardProviderWrapper>
                    <Dashboard />
                  </DashboardProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Reports Route */}
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin", "team"]}>
                <DashboardLayout>
                  <ReportProviderWrapper>
                    <ReportsPage />
                  </ReportProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Contact Inquiry Management Route */}
          <Route
            path="/admin/contact-inquiries"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <ContactInquiryProviderWrapper>
                    <ContactInquiries />
                  </ContactInquiryProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* ==================== CHECKLIST ROUTES ==================== */}
          {/* Main Checklist Page (Merged View) */}
          <Route
            path="/admin/checklists"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <ChecklistPageWrapper>
                    <ChecklistPage />
                  </ChecklistPageWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Checklist Creation Routes */}
          <Route
            path="/admin/checklists/clone"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <ChecklistBuilderWrapper>
                    <CloneChecklist />
                  </ChecklistBuilderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-checklist/global"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <ChecklistBuilderWrapper>
                    <GlobalChecklist />
                  </ChecklistBuilderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-checklist/custom"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <ChecklistBuilderWrapper>
                    <CustomChecklist />
                  </ChecklistBuilderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/import-checklist/excel"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <ChecklistBuilderWrapper>
                    <ImportChecklist />
                  </ChecklistBuilderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Assigned Checklists Routes */}
          <Route
            path="/admin/assigned-checklists"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <CombinedProviderWrapper>
                    <AssignedChecklist />
                  </CombinedProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/checklist-analytics/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <CombinedProviderWrapper>
                    <Checklistanalytics />
                  </CombinedProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignment-details/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <CombinedProviderWrapper>
                    <AssignedChecklistDetails />
                  </CombinedProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignment-submit-details/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <CombinedProviderWrapper>
                    <SubmissionDetails />
                  </CombinedProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* ==================== CLIENT MANAGEMENT ROUTES ==================== */}
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <DashboardLayout>
                  <ClientProvider>
                    <ClientManagement />
                  </ClientProvider>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients-details/:id"
            element={
              <ProtectedRoute allowedRoles={["super_admin"]}>
                <DashboardLayout>
                  <ClientProvider>
                    <ClientDetails />
                  </ClientProvider>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* ==================== TEAM MANAGEMENT ROUTES ==================== */}
          <Route
            path="/admin/team"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <TeamProvider>
                    <TeamManagement />
                  </TeamProvider>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/team-details/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                <DashboardLayout>
                  <TeamProvider>
                    <TeamDetails />
                  </TeamProvider>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* ==================== ASSET MANAGEMENT ROUTES ==================== */}
          <Route
            path="/admin/assets"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin", "team"]}>
                <DashboardLayout>
                  <AssetWithTeamProviderWrapper>
                    <AssetManagement />
                  </AssetWithTeamProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assets/add"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetWithTeamProviderWrapper>
                    <AddNewAsset />
                  </AssetWithTeamProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assets/view/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin", "team"]}>
                <DashboardLayout>
                  <AssetWithTeamProviderWrapper>
                    <AssetView />
                  </AssetWithTeamProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assets/clone"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin", "team"]}>
                <DashboardLayout>
                  <AssetWithTeamProviderWrapper>
                    <CloneAssets />
                  </AssetWithTeamProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assets/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin", "team"]}>
                <DashboardLayout>
                  <AssetWithTeamProviderWrapper>
                    <EditAsset />
                  </AssetWithTeamProviderWrapper>
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
                  <AssetRequestWithTeamWrapper>
                    <AssetRequests />
                  </AssetRequestWithTeamWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/asset-requests/create"
            element={
              <ProtectedRoute allowedRoles={["admin", "team"]}>
                <DashboardLayout>
                  <AssetRequestWithTeamWrapper>
                    <CreateAssetRequest />
                  </AssetRequestWithTeamWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/my-requests"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin", "team"]}>
                <DashboardLayout>
                  <AssetRequestWithTeamWrapper>
                    <MyRequests />
                  </AssetRequestWithTeamWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/asset-requests/:id"
            element={
              <ProtectedRoute allowedRoles={["admin", "super_admin", "team"]}>
                <DashboardLayout>
                  <AssetRequestProvider>
                    <AssetRequestDetails />
                  </AssetRequestProvider>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* ==================== TEAM ROUTES ==================== */}
          <Route
            path="/team"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <TeamAssignmentProviderWrapper>
                    <MyTasks />
                  </TeamAssignmentProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/task-details/:id"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <TeamAssignmentProviderWrapper>
                    <TaskDetail />
                  </TeamAssignmentProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/asset-requests/create"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <AssetRequestWithTeamWrapper>
                    <CreateAssetRequest />
                  </AssetRequestWithTeamWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/profile"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <TeamProviderWrapper>
                    <TeamProfile />
                  </TeamProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/history"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <TeamProviderWrapper>
                    <InspectionHistory />
                  </TeamProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/reports"
            element={
              <ProtectedRoute allowedRoles={["team"]}>
                <DashboardLayout>
                  <ReportProviderWrapper>
                    <ReportsPage />
                  </ReportProviderWrapper>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}