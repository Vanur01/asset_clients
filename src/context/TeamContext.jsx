// context/TeamContext.js
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
  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider");
  }
  return context;
};

// API Configuration
const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

// Helper to get API client with token
const getApiClient = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
};

export const TeamProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMemberDetails, setSelectedMemberDetails] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
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

  // Cache refs
  const cacheRef = useRef({ members: null, stats: null });
  const isMounted = useRef(false);
  const abortControllerRef = useRef(null);

  // Helper function to get initials
  const getInitials = useCallback((firstName, lastName, email) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return "?";
  }, []);

  // Transform member data for UI
  const transformMember = useCallback(
    (member) => ({
      id: member.id || member._id,
      _id: member._id || member.id,
      initials: getInitials(member.firstName, member.lastName, member.email),
      name:
        `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
        member.email?.split("@")[0] ||
        "Unknown",
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      role: member.teamRole || member.role,
      roleDisplay: member.roleDisplay,
      department: member.department,
      location: member.location,
      phone: member.phone,
      assignedCount: member.assignedCount || 0,
      completedCount: member.completedCount || 0,
      performanceScore:
        member.performanceScore || member.stats?.performanceScore || 0,
      performancePercentage: member.performancePercentage || "0%",
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
      bio: member.bio,
      lastLoginDate: member.lastLoginDate,
      lastActiveAt: member.lastActiveAt,
    }),
    [getInitials],
  );

  // ==================== PROFILE FUNCTIONS ====================

  const fetchTeamProfile = useCallback(async () => {
    if (!isAuthenticated || !token) return null;

    setLoading(true);
    try {
      const api = getApiClient(token);
      const response = await api.get("/user/team/me/profile");

      if (response.data.success) {
        setProfile(response.data.profile);
        return response.data.profile;
      }
      return null;
    } catch (err) {
      console.error("Fetch team profile error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const updateTeamProfile = useCallback(
    async (profileData) => {
      if (!isAuthenticated || !token) {
        return { success: false, error: "Not authenticated" };
      }

      setActionLoading(true);
      try {
        const api = getApiClient(token);
        const response = await api.patch("/user/team/me/profile", {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          location: profileData.location,
          bio: profileData.bio,
          department: profileData.department,
        });

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
        return {
          success: false,
          error: err.response?.data?.message || "Failed to update profile",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [isAuthenticated, token],
  );

  const changePassword = useCallback(
    async (currentPassword, newPassword, confirmPassword) => {
      if (!isAuthenticated || !token) {
        return { success: false, error: "Not authenticated" };
      }

      if (newPassword !== confirmPassword) {
        return { success: false, error: "New passwords do not match" };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          error: "Password must be at least 6 characters",
        };
      }

      setActionLoading(true);
      try {
        const api = getApiClient(token);
        const response = await api.post("/user/team/me/change-password", {
          currentPassword,
          newPassword,
        });

        if (response.data.success) {
          return {
            success: true,
            message: response.data.message || "Password changed successfully",
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to change password",
        };
      } catch (err) {
        return {
          success: false,
          error: err.response?.data?.message || "Failed to change password",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [isAuthenticated, token],
  );

  // Format join date (new method)
  const formatJoinDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }, []);

  // Get profile initials (new method)
  const getProfileInitials = useCallback(() => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    }
    return profile?.email?.charAt(0).toUpperCase() || "?";
  }, [profile]);

  // Get full name (new method)
  const getFullName = useCallback(() => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return profile?.email?.split("@")[0] || "Team Member";
  }, [profile]);

  // Format date (new method)
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

  // ==================== ADMIN FUNCTIONS ====================

  // Fetch all team members with filters
  const fetchTeamMembers = useCallback(
    async (overrides = {}, forceRefresh = false) => {
      if (!isAuthenticated || !token) return;

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const activeFilters = { ...filters, ...overrides };
      const cacheKey = JSON.stringify(activeFilters);

      // Check cache if not forcing refresh
      if (!forceRefresh && cacheRef.current.members?.[cacheKey]) {
        const cached = cacheRef.current.members[cacheKey];
        setTeamMembers(cached.members);
        setPagination(cached.pagination);
        if (cached.stats) setTeamStats(cached.stats);
        setInitialLoading(false);
        return;
      }

      setLoading(true);
      if (initialLoading) setInitialLoading(true);

      try {
        const params = new URLSearchParams({
          page: (overrides.page || activeFilters.page || 1).toString(),
          limit: (activeFilters.limit || 10).toString(),
        });

        if (activeFilters.search) params.append("search", activeFilters.search);
        if (activeFilters.status && activeFilters.status !== "all")
          params.append("status", activeFilters.status);
        if (activeFilters.role && activeFilters.role !== "all")
          params.append("role", activeFilters.role);

        const api = getApiClient(token);
        const response = await api.get(`/user/team?${params.toString()}`, {
          signal: abortControllerRef.current.signal,
        });

        if (response.data.success) {
          const transformedMembers = (response.data.members || []).map(
            transformMember,
          );

          // Update cache
          cacheRef.current.members = {
            ...cacheRef.current.members,
            [cacheKey]: {
              members: transformedMembers,
              pagination: response.data.pagination,
              stats: response.data.stats,
            },
          };

          setTeamMembers(transformedMembers);
          setPagination({
            page: response.data.pagination?.page || 1,
            limit: response.data.pagination?.limit || 10,
            total: response.data.pagination?.total || 0,
            pages: response.data.pagination?.pages || 1,
          });

          if (response.data.stats) {
            setTeamStats(response.data.stats);
            cacheRef.current.stats = response.data.stats;
          }

          setFilters((prev) => ({
            ...prev,
            ...overrides,
            page: response.data.pagination?.page || 1,
          }));
          setError(null);
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("Fetch team members error:", err);
          setError(
            err.response?.data?.message || "Failed to fetch team members",
          );
        }
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [isAuthenticated, token, filters, transformMember, initialLoading],
  );

  // Fetch team stats
  const fetchTeamStats = useCallback(
    async (forceRefresh = false) => {
      if (!isAuthenticated || !token) return;

      if (!forceRefresh && cacheRef.current.stats) {
        setTeamStats(cacheRef.current.stats);
        return;
      }

      try {
        const api = getApiClient(token);
        const response = await api.get("/user/team/stats");

        if (response.data.success) {
          setTeamStats(response.data.stats);
          cacheRef.current.stats = response.data.stats;
        }
      } catch (err) {
        console.error("Fetch team stats error:", err);
      }
    },
    [isAuthenticated, token],
  );

  // Fetch team member by ID
  const fetchTeamMemberById = useCallback(
    async (memberId) => {
      if (!isAuthenticated || !token) return null;

      setLoading(true);
      try {
        const api = getApiClient(token);
        const response = await api.get(`/user/team/${memberId}`);

        if (response.data.success) {
          const transformedMember = transformMember(response.data.member);
          setSelectedMember(transformedMember);
          return transformedMember;
        }
        return null;
      } catch (err) {
        console.error("Fetch member by ID error:", err);
        setError(
          err.response?.data?.message || "Failed to fetch member details",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token, transformMember],
  );

  // Fetch team member details (detailed view)
  const fetchTeamMemberDetails = useCallback(
    async (memberId) => {
      if (!isAuthenticated || !token) return null;

      setLoading(true);
      try {
        const api = getApiClient(token);
        const response = await api.get(`/user/team/${memberId}/details`);

        if (response.data.success) {
          setSelectedMemberDetails(response.data.member);
          return response.data.member;
        }
        return null;
      } catch (err) {
        console.error("Fetch member details error:", err);
        setError(
          err.response?.data?.message || "Failed to fetch member details",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, token],
  );

  // Search team members
  const searchTeamMembers = useCallback(
    async (searchTerm) => {
      if (!isAuthenticated || !token) return;

      await fetchTeamMembers({ search: searchTerm, page: 1 }, true);
    },
    [isAuthenticated, token, fetchTeamMembers],
  );

  // Add team member
  const addTeamMember = useCallback(
    async (memberData) => {
      if (!isAuthenticated || !token) {
        return { success: false, error: "Not authenticated" };
      }

      setActionLoading(true);
      try {
        const api = getApiClient(token);
        const response = await api.post("/user/team", {
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          email: memberData.email,
          password: memberData.password,
          phone: memberData.phone,
          teamRole: memberData.role || "inspector",
          department: memberData.department,
          location: memberData.location,
          bio: memberData.bio || "",
        });

        if (response.data.success) {
          cacheRef.current.members = null;
          await fetchTeamMembers({ page: 1 }, true);
          await fetchTeamStats(true);
          return {
            success: true,
            message: response.data.message || "Team member added successfully",
          };
        }
        return {
          success: false,
          error: response.data.message || "Failed to add team member",
        };
      } catch (err) {
        return {
          success: false,
          error: err.response?.data?.message || "Failed to add team member",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [isAuthenticated, token, fetchTeamMembers, fetchTeamStats],
  );

  // Update team member
  const updateTeamMember = useCallback(
    async (memberId, updateData) => {
      if (!isAuthenticated || !token) {
        return { success: false, error: "Not authenticated" };
      }

      setActionLoading(true);
      try {
        const api = getApiClient(token);
        const response = await api.put(`/user/team/${memberId}`, updateData);

        if (response.data.success) {
          cacheRef.current.members = null;
          await fetchTeamMembers({ page: filters.page }, true);
          await fetchTeamStats(true);

          if (
            selectedMemberDetails?._id === memberId ||
            selectedMemberDetails?.id === memberId
          ) {
            setSelectedMemberDetails((prev) => ({ ...prev, ...updateData }));
          }
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
        return {
          success: false,
          error: err.response?.data?.message || "Failed to update team member",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [
      isAuthenticated,
      token,
      fetchTeamMembers,
      fetchTeamStats,
      filters.page,
      selectedMemberDetails,
    ],
  );

  // Update member status
  const updateMemberStatus = useCallback(
    async (memberId, status) => {
      return await updateTeamMember(memberId, { status });
    },
    [updateTeamMember],
  );

  // Delete team member
  const deleteTeamMember = useCallback(
    async (memberId, permanent = true) => {
      if (!isAuthenticated || !token) {
        return { success: false, error: "Not authenticated" };
      }

      setActionLoading(true);
      try {
        const api = getApiClient(token);
        const response = await api.delete(
          `/user/team/${memberId}?permanent=${permanent}`,
        );

        if (response.data.success) {
          cacheRef.current.members = null;
          await fetchTeamMembers({ page: 1 }, true);
          await fetchTeamStats(true);

          if (
            selectedMemberDetails?._id === memberId ||
            selectedMemberDetails?.id === memberId
          ) {
            setSelectedMemberDetails(null);
          }
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
        return {
          success: false,
          error: err.response?.data?.message || "Failed to delete team member",
        };
      } finally {
        setActionLoading(false);
      }
    },
    [
      isAuthenticated,
      token,
      fetchTeamMembers,
      fetchTeamStats,
      selectedMemberDetails,
    ],
  );

  // Update filters
  const updateFilters = useCallback(
    async (newFilters) => {
      const updatedFilters = { ...filters, ...newFilters, page: 1 };
      setFilters(updatedFilters);
      await fetchTeamMembers(updatedFilters, true);
    },
    [filters, fetchTeamMembers],
  );

  // Change page
  const changePage = useCallback(
    async (newPage) => {
      await fetchTeamMembers({ page: newPage }, true);
    },
    [fetchTeamMembers],
  );

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current = { members: null, stats: null };
  }, []);

  // Initial load
  useEffect(() => {
    const canAccessTeam = isAuthenticated && token;

    if (canAccessTeam && !isMounted.current) {
      isMounted.current = true;
      fetchTeamMembers({ page: 1 }, true);
      fetchTeamStats(true);
      fetchTeamProfile(); // Also fetch profile on initial load
    }
  }, [isAuthenticated, token, fetchTeamMembers, fetchTeamStats, fetchTeamProfile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const value = {
    // State
    teamMembers,
    teamStats,
    selectedMember,
    selectedMemberDetails,
    profile,
    loading,
    initialLoading,
    actionLoading,
    error,
    filters,
    pagination,
    // Profile functions
    fetchTeamProfile,
    updateTeamProfile,
    changePassword,
    // Profile utility methods
    formatDate,
    formatJoinDate,
    getFullName,
    getInitials: getProfileInitials,
    // Team management functions
    fetchTeamMembers,
    fetchTeamStats,
    fetchTeamMemberById,
    fetchTeamMemberDetails,
    searchTeamMembers,
    addTeamMember,
    updateTeamMember,
    updateMemberStatus,
    deleteTeamMember,
    updateFilters,
    changePage,
    // Utility functions
    formatDateTime,
    setSelectedMember,
    clearError,
    clearCache,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};