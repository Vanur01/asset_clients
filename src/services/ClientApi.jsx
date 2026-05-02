// services/ClientApi.js
import axios from "axios";

const API_BASE_URL = "https://assset-management-backend-4.onrender.com/api/v1/user";

// Helper to get auth headers
const getAuthHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// Get all clients with filters
export const getAllClients = async (token, params = {}) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = "",
      status = "all",
      membershipPlan = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = params;

    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(status && status !== "all" && { status }),
      ...(membershipPlan && membershipPlan !== "all" && { membershipPlan }),
      sortBy,
      sortOrder,
    });

    const response = await axios.get(`${API_BASE_URL}/clients?${queryParams}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Get all clients error:", error);
    throw error.response?.data || error;
  }
};

// Get client by ID
export const getClientById = async (token, clientId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/clients/${clientId}`, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Get client by ID error:", error);
    throw error.response?.data || error;
  }
};

// Create new client
export const createClient = async (token, clientData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/clients`, clientData, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Create client error:", error);
    throw error.response?.data || error;
  }
};

// Update client
export const updateClient = async (token, clientId, updateData) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/clients/${clientId}`,
      updateData,
      {
        headers: getAuthHeaders(token),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Update client error:", error);
    throw error.response?.data || error;
  }
};

// Update client status (activate/deactivate)
export const updateClientStatus = async (token, clientId, status) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/clients/${clientId}/status`,
      { status },
      {
        headers: getAuthHeaders(token),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Update client status error:", error);
    throw error.response?.data || error;
  }
};

// Delete client (soft or permanent)
export const deleteClient = async (token, clientId, permanent = false) => {
  try {
    const url = permanent
      ? `${API_BASE_URL}/clients/${clientId}?permanent=true`
      : `${API_BASE_URL}/clients/${clientId}`;
    const response = await axios.delete(url, {
      headers: getAuthHeaders(token),
    });
    return response.data;
  } catch (error) {
    console.error("Delete client error:", error);
    throw error.response?.data || error;
  }
};

// Renew client membership
export const renewClientMembership = async (token, clientId, extendDays) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/clients/${clientId}`,
      { extendDays },
      {
        headers: getAuthHeaders(token),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Renew membership error:", error);
    throw error.response?.data || error;
  }
};

// Update auto-renewal setting
export const updateAutoRenewal = async (token, clientId, enabled) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/clients/${clientId}/auto-renewal`,
      { enabled },
      {
        headers: getAuthHeaders(token),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Update auto-renewal error:", error);
    throw error.response?.data || error;
  }
};

// Get subscription report
export const getSubscriptionReport = async (token, params = {}) => {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await axios.get(
      `${API_BASE_URL}/clients/subscription-report?${queryParams}`,
      {
        headers: getAuthHeaders(token),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Get subscription report error:", error);
    throw error.response?.data || error;
  }
};
