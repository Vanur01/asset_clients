// context/AuthContexts.jsx
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// API base URL
const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1";

// Create axios instance with interceptors
const createApiInstance = (token) => {
  console.log("Creating API instance with token:", token ? "Token present" : "No token");
  
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Add request interceptor to include token
  instance.interceptors.request.use(
    (config) => {
      const currentToken = token || localStorage.getItem("accessToken");
      if (currentToken && currentToken !== "undefined" && currentToken !== "null") {
        config.headers.Authorization = `Bearer ${currentToken}`;
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
      } else {
        console.warn("No token available for request:", config.url);
      }
      return config;
    },
    (error) => {
      console.error("Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => {
      console.log(`Response from ${response.config.url}:`, response.status);
      return response;
    },
    (error) => {
      console.error("Response error:", error.response?.status, error.response?.data);
      
      // Don't redirect on 404 for base URL checks
      if (error.response?.status === 401) {
        console.log("Token expired or invalid, clearing auth data");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("userType");
        window.location.href = "/login";
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Helper function to clear auth data
const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  localStorage.removeItem("userType");
  localStorage.removeItem("rememberMe");
  localStorage.removeItem("rememberedEmail");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null);
  const [api, setApi] = useState(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      console.log("Initializing authentication...");
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("accessToken");
      const storedUserType = localStorage.getItem("userType");
      
      const isValidUser = storedUser && storedUser !== "undefined" && storedUser !== "null";
      const isValidToken = storedToken && storedToken !== "undefined" && storedToken !== "null";
      
      if (isValidUser && isValidToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("Found stored user:", parsedUser.email);
          setUser(parsedUser);
          setToken(storedToken);
          setUserType(storedUserType || parsedUser.role);
          const apiInstance = createApiInstance(storedToken);
          setApi(apiInstance);
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          clearAuthData();
        }
      } else {
        console.log("No stored auth found");
        setApi(null);
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    console.log("Attempting login for:", email);
    try {
      const tempApi = axios.create({
        baseURL: API_BASE_URL,
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      
      const response = await tempApi.post("/user/auth/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      if (response.data.success && response.data.user && response.data.accessToken) {
        const userData = response.data.user;
        const accessToken = response.data.accessToken;
        
        // Transform user data based on role
        let transformedUser = {};
        let userRoleType = "";
        let redirectPath = "/admin";

        if (userData.role === "super_admin") {
          transformedUser = {
            id: userData.id,
            _id: userData.id,
            email: userData.email,
            role: "super_admin",
            backendRole: userData.role,
            name: userData.name,
            permissions: userData.permissions || []
          };
          userRoleType = "super_admin";
          redirectPath = "/admin";
        } 
        else if (userData.role === "admin") {
          transformedUser = {
            id: userData.id,
            _id: userData.id,
            email: userData.email,
            role: "admin",
            backendRole: userData.role,
            name: userData.customerName || userData.name,
            customerName: userData.customerName,
            membershipPlan: userData.membershipPlan,
            daysRemaining: userData.daysRemaining,
            usagePercentage: userData.usagePercentage,
            licenseLimit: userData.licenseLimit,
            usersUsed: userData.usersUsed,
            phone: userData.phone,
            website: userData.website,
            address: userData.address,
            settings: userData.settings
          };
          userRoleType = "admin";
          redirectPath = "/admin";
        }
        else if (userData.role === "team") {
          transformedUser = {
            id: userData.id,
            _id: userData.id,
            email: userData.email,
            role: "team",
            backendRole: userData.role,
            name: userData.fullName || `${userData.firstName} ${userData.lastName}`,
            firstName: userData.firstName,
            lastName: userData.lastName,
            fullName: userData.fullName,
            initials: userData.initials,
            department: userData.department,
            location: userData.location,
            adminId: userData.adminId,
            teamRole: userData.teamRole,
            roleDisplay: userData.roleDisplay,
            stats: userData.stats,
            permissions: userData.permissions || []
          };
          userRoleType = "team";
          redirectPath = "/team";
        }

        // Store in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(transformedUser));
        localStorage.setItem("userType", userRoleType);
        
        // Set state
        setToken(accessToken);
        setUser(transformedUser);
        setUserType(userRoleType);
        
        // Create API instance after setting token
        const apiInstance = createApiInstance(accessToken);
        setApi(apiInstance);
        
        console.log("Login successful, redirecting to:", redirectPath);
        
        return {
          success: true,
          role: userRoleType,
          userType: userRoleType,
          user: transformedUser,
          token: accessToken,
          redirectPath,
          message: response.data.message || "Login successful"
        };
      }
      
      return {
        success: false,
        error: response.data.message || "Invalid response from server"
      };
      
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.response) {
        return {
          success: false,
          error: error.response.data?.message || error.response.data?.error || "Invalid credentials"
        };
      } else if (error.request) {
        return {
          success: false,
          error: "Unable to connect to server. Please check if the backend is running."
        };
      } else {
        return {
          success: false,
          error: "An error occurred during login. Please try again."
        };
      }
    }
  };

  // Logout function
  const logout = useCallback(async () => {
    console.log("Logging out...");
    try {
      const currentToken = token || localStorage.getItem("accessToken");
      if (currentToken && currentToken !== "undefined" && currentToken !== "null") {
        const tempApi = axios.create({
          baseURL: API_BASE_URL,
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`
          },
          withCredentials: true,
        });
        await tempApi.post("/user/auth/logout", {});
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      setToken(null);
      setUser(null);
      setUserType(null);
      setApi(null);
      console.log("Logout complete");
    }
  }, [token]);

  // Helper functions
  const getUserRole = () => user?.role || null;
  const getUserType = () => userType;
  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);
  const isSuperAdmin = () => user?.role === "super_admin";
  const isAdmin = () => user?.role === "admin";
  const isTeam = () => user?.role === "team";

  // Make authenticated API requests
  const authRequest = useCallback(async (method, url, data = null, customConfig = {}) => {
    const currentToken = token || localStorage.getItem("accessToken");
    
    if (!currentToken) {
      throw new Error("No authentication token available");
    }

    // Ensure URL doesn't have double slashes and starts correctly
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    const fullUrl = `${API_BASE_URL}${cleanUrl}`;
    
    console.log(`Making ${method} request to: ${fullUrl}`);

    try {
      const config = {
        method,
        url: fullUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        withCredentials: true,
        ...customConfig,
      };
      
      // Handle FormData differently
      if (data instanceof FormData) {
        delete config.headers["Content-Type"];
        config.data = data;
      } else if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
        config.data = data;
      }
      
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`Auth request error (${method} ${url}):`, error);
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  }, [token, logout]);

  // Check if backend is reachable (optional, remove if causing issues)
  const checkBackendHealth = useCallback(async () => {
    try {
      // Try to hit a known endpoint instead of the base URL
      const response = await axios.get(`${API_BASE_URL}/user/auth/health`, { timeout: 5000 });
      return response.data;
    } catch (error) {
      console.warn("Backend health check failed:", error.message);
      return null;
    }
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    token,
    api,
    loading,
    userType,
    isAuthenticated: !!user && !!token && token !== "undefined" && token !== "null",
    getUserRole,
    getUserType,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isAdmin,
    isTeam,
    authRequest,
    checkBackendHealth,
  }), [user, token, api, loading, userType, authRequest, checkBackendHealth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};