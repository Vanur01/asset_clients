// context/TeamContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContexts";
import axios from "axios";

const TeamContext = createContext();

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) throw new Error("useTeam must be used within a TeamProvider");
  return context;
};

const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

// Helper to get fresh token each time
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};

export const TeamProvider = ({ children }) => {
  const { token, isAuthenticated, user, logout } = useAuth();

  // Team state
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState(null);
  const [profile, setProfile] = useState(null);

  // Role state
  const [roles, setRoles] = useState([]);
  const [rolesPagination, setRolesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Department state
  const [departments, setDepartments] = useState([]);
  const [departmentsPagination, setDepartmentsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Location state
  const [locations, setLocations] = useState([]);
  const [locationsPagination, setLocationsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Loading states
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);

  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    searchName: "",
    searchEmail: "",
    status: "all",
    role: "all",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Refs
  const cacheRef = useRef({
    members: {},
    roles: null,
    departments: null,
    locations: null,
  });
  const initializedRef = useRef(false);
  const abortControllerRef = useRef(null);
  const authRef = useRef({ token, isAuthenticated, user });
  const filtersRef = useRef(filters);

  useEffect(() => {
    authRef.current = { token, isAuthenticated, user };
  }, [token, isAuthenticated, user]);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Helper to handle 401/403 errors
  const handleAuthError = useCallback((err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      console.error("Authentication error:", err.response?.data);
      setError("Session expired. Please login again.");
      // Clear invalid token
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("accessToken");
      // Optionally redirect to login
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return true;
    }
    return false;
  }, []);

  // ─── Utilities ────────────────────────────────────────────────────────────

  const getInitials = useCallback((firstName, lastName, email) => {
    if (firstName && lastName)
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    if (firstName) return firstName.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();
    return "?";
  }, []);

  const transformMember = useCallback(
    (member) => {
      const firstName = member.firstName || "";
      const lastName = member.lastName || "";
      const email = member.email || "";

      const fullName =
        firstName && lastName
          ? `${firstName} ${lastName}`.trim()
          : firstName || lastName || email?.split("@")[0] || "Unknown";

      return {
        id: member.id || member._id,
        _id: member._id || member.id,
        initials: getInitials(firstName, lastName, email),
        name: fullName,
        firstName: firstName,
        lastName: lastName,
        email: email,
        role:
          member.teamRoleDisplay || member.teamRole || member.role || "team",
        roleDisplay: member.roleDisplay || member.teamRoleDisplay,
        roleId: member.roleId || member.teamRoleId?._id,
        department: member.department || "",
        departmentId: member.departmentId?._id || member.departmentId,
        location: member.location || "",
        locationId: member.locationId?._id || member.locationId,
        phone: member.phone || "",
        assignedCount: member.assignedCount || member.assigned || 0,
        completedCount: member.completedCount || member.completed || 0,
        performanceScore:
          member.performanceScore || member.stats?.performanceScore || 0,
        performancePercentage:
          member.performance || member.performancePercentage || "0%",
        status: member.status || "inactive",
        joinDate: member.joinDate,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
        certifications: member.certifications || [],
        monthlyPerformance: member.monthlyPerformance || [],
        stats: member.stats,
        organization: member.organization,
        adminId: member.adminId,
        address: member.address,
        bio: member.bio || "",
        lastLoginDate: member.lastLoginDate,
        lastActiveAt: member.lastActiveAt,
        teamRole: member.teamRole,
        customRole: member.customRole,
      };
    },
    [getInitials],
  );

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatJoinDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const diffDays = Math.ceil(
      Math.abs(new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) {
      const m = Math.floor(diffDays / 30);
      return `${m} month${m > 1 ? "s" : ""} ago`;
    }
    const y = Math.floor(diffDays / 365);
    return `${y} year${y > 1 ? "s" : ""} ago`;
  }, []);

  const getProfileInitials = useCallback(() => {
    if (profile?.firstName && profile?.lastName)
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    return profile?.email?.charAt(0).toUpperCase() || "?";
  }, [profile]);

  const getFullName = useCallback(() => {
    if (profile?.firstName && profile?.lastName)
      return `${profile.firstName} ${profile.lastName}`;
    return profile?.email?.split("@")[0] || "Team Member";
  }, [profile]);

  // ─── Profile ──────────────────────────────────────────────────────────────

  const fetchTeamProfile = useCallback(async () => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    if (!token) return null;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/team/me/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setProfile(response.data.profile);
        return response.data.profile;
      }
      return null;
    } catch (err) {
      console.error("Fetch team profile error:", err);
      handleAuthError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  const updateTeamProfile = useCallback(
    async (profileData) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.patch(
          `${API_BASE_URL}/team/me/profile`,
          {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phone: profileData.phone,
            location: profileData.location,
            bio: profileData.bio,
            department: profileData.department,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          setProfile(response.data.profile);
          return {
            success: true,
            message: response.data.message || "Profile updated successfully",
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to update profile",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to update profile",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [handleAuthError],
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword, confirmPassword) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      if (newPassword !== confirmPassword)
        return { success: false, error: "New passwords do not match" };
      if (newPassword.length < 6)
        return {
          success: false,
          error: "Password must be at least 6 characters",
        };

      setActionLoading(true);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/team/me/change-password`,
          { currentPassword, newPassword },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.data.success)
          return {
            success: true,
            message: response.data.message || "Password changed successfully",
          };
        return {
          success: false,
          error: response.data.message || "Failed to change password",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to change password",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [handleAuthError],
  );

  // ─── Roles ────────────────────────────────────────────────────────────────

  const fetchRoles = useCallback(
    async (params = {}, forceRefresh = false) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return;

      if (!forceRefresh && cacheRef.current.roles) {
        setRoles(cacheRef.current.roles.data);
        setRolesPagination(cacheRef.current.roles.pagination);
        return;
      }

      setRolesLoading(true);
      try {
        const query = new URLSearchParams({
          page: params.page || 1,
          limit: params.limit || 100,
          ...(params.search && { search: params.search }),
        });
        const response = await axios.get(`${API_BASE_URL}/role?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const pagination = response.data.pagination || {
            page: 1,
            limit: 100,
            total: response.data.roles.length,
            pages: 1,
          };
          setRoles(response.data.roles);
          setRolesPagination(pagination);
          cacheRef.current.roles = { data: response.data.roles, pagination };
        }
      } catch (err) {
        console.error("Fetch roles error:", err);
        handleAuthError(err);
      } finally {
        setRolesLoading(false);
      }
    },
    [handleAuthError],
  );

  const createRole = useCallback(
    async (roleData) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/role`,
          {
            name: roleData.name,
            description: roleData.description,
            isActive: roleData.isActive !== false,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          cacheRef.current.roles = null;
          await fetchRoles({}, true);
          return {
            success: true,
            message: response.data.message || "Role created successfully",
            role: response.data.role,
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to create role",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to create role",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchRoles, handleAuthError],
  );

  const updateRole = useCallback(
    async (roleId, roleData) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.put(
          `${API_BASE_URL}/role/${roleId}`,
          roleData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          cacheRef.current.roles = null;
          await fetchRoles({}, true);
          return {
            success: true,
            message: response.data.message || "Role updated successfully",
            role: response.data.role,
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to update role",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to update role",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchRoles, handleAuthError],
  );

  const deleteRole = useCallback(
    async (roleId) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.delete(`${API_BASE_URL}/role/${roleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          cacheRef.current.roles = null;
          await fetchRoles({}, true);
          return {
            success: true,
            message: response.data.message || "Role deleted successfully",
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to delete role",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to delete role",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchRoles, handleAuthError],
  );

  // ─── Departments ──────────────────────────────────────────────────────────

  const fetchDepartments = useCallback(
    async (params = {}, forceRefresh = false) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return;

      if (!forceRefresh && cacheRef.current.departments) {
        setDepartments(cacheRef.current.departments.data);
        setDepartmentsPagination(cacheRef.current.departments.pagination);
        return;
      }

      setDepartmentsLoading(true);
      try {
        const query = new URLSearchParams({
          page: params.page || 1,
          limit: params.limit || 100,
          ...(params.search && { search: params.search }),
        });
        const response = await axios.get(
          `${API_BASE_URL}/department?${query}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          const pagination = response.data.pagination || {
            page: 1,
            limit: 100,
            total: response.data.departments.length,
            pages: 1,
          };
          setDepartments(response.data.departments);
          setDepartmentsPagination(pagination);
          cacheRef.current.departments = {
            data: response.data.departments,
            pagination,
          };
        }
      } catch (err) {
        console.error("Fetch departments error:", err);
        handleAuthError(err);
      } finally {
        setDepartmentsLoading(false);
      }
    },
    [handleAuthError],
  );

  const createDepartment = useCallback(
    async (deptData) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/department`,
          {
            name: deptData.name,
            description: deptData.description,
            isActive: deptData.isActive !== false,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          cacheRef.current.departments = null;
          await fetchDepartments({}, true);
          return {
            success: true,
            message: response.data.message || "Department created successfully",
            department: response.data.department,
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to create department",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to create department",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchDepartments, handleAuthError],
  );

  const updateDepartment = useCallback(
    async (deptId, deptData) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.put(
          `${API_BASE_URL}/department/${deptId}`,
          deptData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          cacheRef.current.departments = null;
          await fetchDepartments({}, true);
          return {
            success: true,
            message: response.data.message || "Department updated successfully",
            department: response.data.department,
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to update department",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to update department",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchDepartments, handleAuthError],
  );

  const deleteDepartment = useCallback(
    async (deptId) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/department/${deptId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          cacheRef.current.departments = null;
          await fetchDepartments({}, true);
          return {
            success: true,
            message: response.data.message || "Department deleted successfully",
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to delete department",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to delete department",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchDepartments, handleAuthError],
  );

  // ─── Locations ────────────────────────────────────────────────────────────

  const fetchLocations = useCallback(
    async (params = {}, forceRefresh = false) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return;

      if (!forceRefresh && cacheRef.current.locations) {
        setLocations(cacheRef.current.locations.data);
        setLocationsPagination(cacheRef.current.locations.pagination);
        return;
      }

      setLocationsLoading(true);
      try {
        const query = new URLSearchParams({
          page: params.page || 1,
          limit: params.limit || 100,
          ...(params.search && { search: params.search }),
        });
        const response = await axios.get(`${API_BASE_URL}/location?${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const pagination = response.data.pagination || {
            page: 1,
            limit: 100,
            total: response.data.locations.length,
            pages: 1,
          };
          setLocations(response.data.locations);
          setLocationsPagination(pagination);
          cacheRef.current.locations = {
            data: response.data.locations,
            pagination,
          };
        }
      } catch (err) {
        console.error("Fetch locations error:", err);
        handleAuthError(err);
      } finally {
        setLocationsLoading(false);
      }
    },
    [handleAuthError],
  );

  const createLocation = useCallback(
    async (locData) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.post(
          `${API_BASE_URL}/location`,
          {
            name: locData.name,
            description: locData.description,
            isActive: locData.isActive !== false,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          cacheRef.current.locations = null;
          await fetchLocations({}, true);
          return {
            success: true,
            message: response.data.message || "Location created successfully",
            location: response.data.location,
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to create location",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to create location",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchLocations, handleAuthError],
  );

  const updateLocation = useCallback(
    async (locId, locData) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.put(
          `${API_BASE_URL}/location/${locId}`,
          locData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          cacheRef.current.locations = null;
          await fetchLocations({}, true);
          return {
            success: true,
            message: response.data.message || "Location updated successfully",
            location: response.data.location,
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to update location",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to update location",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchLocations, handleAuthError],
  );

  const deleteLocation = useCallback(
    async (locId) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/location/${locId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          cacheRef.current.locations = null;
          await fetchLocations({}, true);
          return {
            success: true,
            message: response.data.message || "Location deleted successfully",
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to delete location",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to delete location",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchLocations, handleAuthError],
  );

  // ─── Team Members (CRITICAL FIX) ─────────────────────────────────────────

  const fetchTeamMembers = useCallback(
    async (overrides = {}, forceRefresh = false) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");

      // Check authentication
      if (!token) {
        console.warn("No token found, cannot fetch team members");
        setError("Please login to continue");
        setInitialLoading(false);
        return;
      }

      // Cancel any in-flight request
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = new AbortController();

      // Merge overrides with current filters
      const activeFilters = { ...filtersRef.current, ...overrides };
      const cacheKey = JSON.stringify(activeFilters);

      if (!forceRefresh && cacheRef.current.members[cacheKey]) {
        const cached = cacheRef.current.members[cacheKey];
        setTeamMembers(cached.members);
        setPagination(cached.pagination);
        setInitialLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(activeFilters.page || 1),
          limit: String(activeFilters.limit || 10),
        });

        if (activeFilters.search) params.append("search", activeFilters.search);
        if (activeFilters.searchName)
          params.append("name", activeFilters.searchName);
        if (activeFilters.searchEmail)
          params.append("email", activeFilters.searchEmail);
        if (activeFilters.status && activeFilters.status !== "all")
          params.append("status", activeFilters.status);
        if (activeFilters.role && activeFilters.role !== "all")
          params.append("role", activeFilters.role);

        console.log("Fetching team members with params:", params.toString());

        const response = await axios.get(`${API_BASE_URL}/team?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortControllerRef.current.signal,
        });

        if (response.data.success) {
          const transformedMembers = (
            response.data.members ||
            response.data.teamMembers ||
            []
          ).map(transformMember);
          const pag = {
            page: response.data.pagination?.page || 1,
            limit: response.data.pagination?.limit || 10,
            total: response.data.pagination?.total || 0,
            pages: response.data.pagination?.pages || 1,
          };

          cacheRef.current.members[cacheKey] = {
            members: transformedMembers,
            pagination: pag,
          };
          setTeamMembers(transformedMembers);
          setPagination(pag);
          setFilters((prev) => ({ ...prev, ...activeFilters, page: pag.page }));
        } else {
          throw new Error(
            response.data.message || "Failed to fetch team members",
          );
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("Fetch team members error:", err);

          const isAuthError = handleAuthError(err);
          if (!isAuthError) {
            setError(
              err.response?.data?.message || "Failed to fetch team members",
            );
          }
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [transformMember, handleAuthError],
  );

  const fetchTeamMemberById = useCallback(
    async (memberId) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return null;

      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/team/${memberId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const m = transformMember(response.data.member);
          setSelectedMember(m);
          return m;
        }
        return null;
      } catch (err) {
        console.error("Fetch member by ID error:", err);
        handleAuthError(err);
        setError(
          err.response?.data?.message || "Failed to fetch member details",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [transformMember, handleAuthError],
  );

  const fetchTeamMemberDetails = useCallback(
    async (memberId) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return null;

      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/team/${memberId}/details`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          setSelectedMemberDetails(response.data.member);
          return response.data.member;
        }
        return null;
      } catch (err) {
        console.error("Fetch member details error:", err);
        handleAuthError(err);
        setError(
          err.response?.data?.message || "Failed to fetch member details",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError],
  );

  const searchTeamMembers = useCallback(
    async (searchTerm) => {
      await fetchTeamMembers({ search: searchTerm, page: 1 }, true);
    },
    [fetchTeamMembers],
  );

  const addTeamMember = useCallback(
    async (memberData) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      setError(null);

      try {
        console.log("Adding team member with data:", memberData);

        const response = await axios.post(
          `${API_BASE_URL}/team`,
          {
            firstName: memberData.firstName,
            lastName: memberData.lastName,
            email: memberData.email,
            password: memberData.password,
            phone: memberData.phone || "",
            roleId: memberData.roleId,
            departmentId: memberData.departmentId,
            locationId: memberData.locationId,
            teamRole: memberData.teamRole || "inspector",
            bio: memberData.bio || "",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        console.log("API Response:", response.data);

        if (response.data.success) {
          cacheRef.current.members = {};
          await fetchTeamMembers({ page: 1 }, true);

          return {
            success: true,
            message: response.data.message || "Team member added successfully",
            member: response.data.member,
          };
        }

        return {
          success: false,
          error: response.data.message || "Failed to add team member",
        };
      } catch (err) {
        console.error("Add team member error:", err);
        handleAuthError(err);
        return {
          success: false,
          error:
            err.response?.data?.message ||
            err.message ||
            "Failed to add team member",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchTeamMembers, handleAuthError],
  );

  const updateTeamMember = useCallback(
    async (memberId, updateData) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.put(
          `${API_BASE_URL}/team/${memberId}`,
          updateData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          cacheRef.current.members = {};
          await fetchTeamMembers({}, true);
          setSelectedMemberDetails((prev) => {
            if (prev && (prev._id === memberId || prev.id === memberId))
              return { ...prev, ...updateData };
            return prev;
          });
          return {
            success: true,
            message:
              response.data.message || "Team member updated successfully",
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to update team member",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to update team member",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchTeamMembers, handleAuthError],
  );

  const updateMemberStatus = useCallback(
    async (memberId, status) => {
      return await updateTeamMember(memberId, { status });
    },
    [updateTeamMember],
  );

  const deleteTeamMember = useCallback(
    async (memberId, permanent = true) => {
      const token =
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken");
      if (!token) return { success: false, error: "Not authenticated" };

      setActionLoading(true);
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/team/${memberId}?permanent=${permanent}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.data.success) {
          cacheRef.current.members = {};
          await fetchTeamMembers({ page: 1 }, true);
          setSelectedMemberDetails((prev) => {
            if (prev && (prev._id === memberId || prev.id === memberId))
              return null;
            return prev;
          });
          return {
            success: true,
            message:
              response.data.message || "Team member deleted successfully",
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to delete team member",
        };
      } catch (err) {
        handleAuthError(err);
        return {
          success: false,
          error: err.response?.data?.message || "Failed to delete team member",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [fetchTeamMembers, handleAuthError],
  );

  const updateFilters = useCallback(
    async (newFilters) => {
      const updatedFilters = { ...filtersRef.current, ...newFilters, page: 1 };
      filtersRef.current = updatedFilters;
      setFilters(updatedFilters);
      await fetchTeamMembers(updatedFilters, true);
    },
    [fetchTeamMembers],
  );

  const changePage = useCallback(
    async (newPage) => {
      await fetchTeamMembers({ page: newPage }, true);
    },
    [fetchTeamMembers],
  );

  const clearError = useCallback(() => setError(null), []);

  const clearCache = useCallback(() => {
    cacheRef.current = {
      members: {},
      roles: null,
      departments: null,
      locations: null,
    };
  }, []);

  // ─── Initial data fetch ────────────────────────────────────────────────────
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");

    if (!token || !isAuthenticated) {
      initializedRef.current = false;
      return;
    }

    if (initializedRef.current) return;
    initializedRef.current = true;

    const isTeamMember = user?.role === "team";

    // Fire all fetches immediately
    fetchTeamMembers({ page: 1 }, true);
    fetchRoles({}, true);
    fetchDepartments({}, true);
    fetchLocations({}, true);
    if (isTeamMember) fetchTeamProfile();
  }, [
    isAuthenticated,
    user?.role,
    fetchTeamMembers,
    fetchRoles,
    fetchDepartments,
    fetchLocations,
    fetchTeamProfile,
  ]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const value = {
    // State
    teamMembers,
    selectedMember,
    selectedMemberDetails,
    profile,
    loading,
    initialLoading,
    actionLoading,
    error,
    filters,
    pagination,
    // Role state
    roles,
    rolesPagination,
    rolesLoading,
    // Department state
    departments,
    departmentsPagination,
    departmentsLoading,
    // Location state
    locations,
    locationsPagination,
    locationsLoading,
    // Profile functions
    fetchTeamProfile,
    updateTeamProfile,
    changePassword,
    // Profile utilities
    formatDate,
    formatJoinDate,
    formatDateTime,
    getFullName,
    getInitials: getProfileInitials,
    // Role functions
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    // Department functions
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    // Location functions
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    // Team functions
    fetchTeamMembers,
    fetchTeamMemberById,
    fetchTeamMemberDetails,
    searchTeamMembers,
    addTeamMember,
    updateTeamMember,
    updateMemberStatus,
    deleteTeamMember,
    updateFilters,
    changePage,
    setSelectedMember,
    clearError,
    clearCache,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};
