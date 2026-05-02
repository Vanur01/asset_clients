// context/ChecklistBuilderContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "./AuthContexts";
import axios from "axios";

const ChecklistBuilderContext = createContext();

export const useChecklistBuilder = () => {
  const context = useContext(ChecklistBuilderContext);
  if (!context) {
    throw new Error(
      "useChecklistBuilder must be used within ChecklistBuilderProvider",
    );
  }
  return context;
};

// Field type mapping for API
const FIELD_TYPE_MAP = {
  text_input: "text_input",
  textarea: "text_area",
  text: "text_input",
  email: "text_input",
  tel: "text_input",
  number: "text_input",
  dropdown: "dropdown",
  checkbox: "checkbox",
  rating: "rating",
  image: "image_upload",
  image_upload: "image_upload",
  signature: "signature",
  date_picker: "date_picker",
};

// Reverse mapping for display
const DISPLAY_FIELD_TYPE_MAP = {
  text_input: "text",
  text_area: "textarea",
  dropdown: "dropdown",
  checkbox: "checkbox",
  rating: "rating",
  image_upload: "image",
  signature: "signature",
  date_picker: "date_picker",
};

export const ChecklistBuilderProvider = ({ children }) => {
  const { authRequest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Create Checklist - Removed validations
  const createChecklist = useCallback(
    async (checklistData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest("POST", "/checklist", checklistData);
        if (response.success) {
          setSuccess("Checklist created successfully!");
          return { success: true, data: response.data };
        }
        return { success: false, error: response.message };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to create checklist";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // Get All Checklists with pagination and search
  const getAllChecklists = useCallback(
    async (filters = {}) => {
      setLoading(true);
      setError(null);
      try {
        let url = "/checklist";
        const queryParams = new URLSearchParams();
        if (filters.type) queryParams.append("type", filters.type);
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.category) queryParams.append("category", filters.category);
        if (filters.search) queryParams.append("search", filters.search);
        if (filters.page) queryParams.append("page", filters.page);
        if (filters.limit) queryParams.append("limit", filters.limit);

        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }

        const response = await authRequest("GET", url);
        return { success: true, data: response };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch checklists";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // Get Checklist by ID
  const getChecklistById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest("GET", `/checklist/${id}`);
        return { success: true, data: response };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch checklist";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // Update Checklist
  const updateChecklist = useCallback(
    async (id, updateData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest(
          "PUT",
          `/checklist/${id}`,
          updateData,
        );
        if (response.success) {
          setSuccess("Checklist updated successfully!");
          return { success: true, data: response.data };
        }
        return { success: false, error: response.message };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to update checklist";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // Delete Checklist
  const deleteChecklist = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest("DELETE", `/checklist/${id}`);
        if (response.success) {
          setSuccess("Checklist deleted successfully!");
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete checklist";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // Clone Checklist
  const cloneChecklist = useCallback(
    async (id, newName) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest("POST", `/checklist/clone/${id}`, {
          newName: newName,
        });
        if (response.success) {
          setSuccess("Checklist cloned successfully!");
          return { success: true, data: response };
        }
        return { success: false, error: response.message };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to clone checklist";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // Import Checklist from Excel
  const importFromExcel = useCallback(
    async (file, checklistName = null) => {
      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("excelFile", file);
        if (checklistName) {
          formData.append("name", checklistName);
        }

        const token = localStorage.getItem("accessToken");
        if (!token || token === "undefined" || token === "null") {
          throw new Error("No authentication token found. Please login again.");
        }

        const response = await axios.post(
          "https://assset-management-backend-4.onrender.com/api/v1/checklist/import-excel",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          },
        );

        if (response.data.success) {
          setSuccess("Checklist imported successfully!");
          return {
            success: true,
            data: response.data._doc || response.data,
          };
        }
        return { success: false, error: response.data.message };
      } catch (err) {
        let errorMsg = "Failed to import checklist";
        if (err.response?.status === 401) {
          errorMsg = "Authentication failed. Please login again.";
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          localStorage.removeItem("userType");
          window.location.href = "/login";
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.message) {
          errorMsg = err.message;
        }

        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Get Global Checklists (Approved ones)
  const getGlobalChecklists = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRequest("GET", "/checklist/global");
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch global checklists";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [authRequest]);

  // Submit for Global Approval
  const submitForGlobalApproval = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest(
          "POST",
          `/checklist/${id}/submit-for-approval`,
        );
        if (response.success) {
          setSuccess("Checklist submitted for approval!");
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to submit for approval";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // Approve Global Checklist (Super Admin only)
  const approveGlobalChecklist = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest("POST", `/checklist/${id}/approve`);
        if (response.success) {
          setSuccess("Checklist approved successfully!");
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to approve checklist";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // Reject Global Checklist (Super Admin only)
  const rejectGlobalChecklist = useCallback(
    async (id, reason) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authRequest("POST", `/checklist/${id}/reject`, {
          reason,
        });
        if (response.success) {
          setSuccess("Checklist rejected!");
          return { success: true };
        }
        return { success: false, error: response.message };
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Failed to reject checklist";
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setLoading(false);
      }
    },
    [authRequest],
  );

  // Convert UI Field to API Field
  const convertUIToAPIField = useCallback((uiField) => {
    const apiField = {
      label: uiField.label,
      fieldType: FIELD_TYPE_MAP[uiField.type] || "text_input",
      isRequired: uiField.required || false,
      placeholder: uiField.placeholder || "",
      options: uiField.options || [],
      ratingMax: uiField.ratingMax || 5,
      checkboxItems: uiField.checkboxItems || [],
      order: uiField.order || 0,
      validationRules: {
        minLength: uiField.minLength || null,
        maxLength: uiField.maxLength || null,
        pattern: uiField.pattern || null,
      },
    };
    return apiField;
  }, []);

  // Convert API Field to UI Field
  const convertAPIToUIField = useCallback((apiField) => {
    const uiField = {
      id: apiField._id || `field_${Date.now()}`,
      label: apiField.label,
      type: DISPLAY_FIELD_TYPE_MAP[apiField.fieldType] || "text",
      required: apiField.isRequired,
      placeholder: apiField.placeholder,
      options: apiField.options || [],
      ratingMax: apiField.ratingMax,
      checkboxItems: apiField.checkboxItems,
      order: apiField.order,
      minLength: apiField.validationRules?.minLength,
      maxLength: apiField.validationRules?.maxLength,
      pattern: apiField.validationRules?.pattern,
    };
    return uiField;
  }, []);

  // Convert UI Section to API Section
  const convertUIToAPISection = useCallback(
    (section, order) => ({
      sectionTitle: section.sectionTitle,
      sectionDescription: section.sectionDescription || "",
      fields: section.fields.map((field, idx) =>
        convertUIToAPIField({ ...field, order: idx }),
      ),
      order: order,
    }),
    [convertUIToAPIField],
  );

  // Convert API Section to UI Section
  const convertAPIToUISection = useCallback(
    (apiSection) => ({
      id: apiSection._id,
      sectionTitle: apiSection.sectionTitle,
      sectionDescription: apiSection.sectionDescription || "",
      fields: apiSection.fields.map((field, idx) =>
        convertAPIToUIField({ ...field, order: idx }),
      ),
    }),
    [convertAPIToUIField],
  );

  // Prepare complete checklist data from UI state
  const prepareChecklistData = useCallback(
    (name, description, type, category, sections, status = "draft") => {
      return {
        name,
        description,
        type,
        category,
        status,
        sections: sections.map((section, idx) =>
          convertUIToAPISection(section, idx),
        ),
      };
    },
    [convertUIToAPISection],
  );

  // Clear messages
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const value = {
    // State
    loading,
    error,
    success,

    // Actions
    createChecklist,
    getAllChecklists,
    getChecklistById,
    updateChecklist,
    deleteChecklist,
    cloneChecklist,
    importFromExcel,
    getGlobalChecklists,
    submitForGlobalApproval,
    approveGlobalChecklist,
    rejectGlobalChecklist,

    // Converters
    convertUIToAPIField,
    convertAPIToUIField,
    convertUIToAPISection,
    convertAPIToUISection,
    prepareChecklistData,
    clearMessages,
    FIELD_TYPE_MAP,
    DISPLAY_FIELD_TYPE_MAP,
  };

  return (
    <ChecklistBuilderContext.Provider value={value}>
      {children}
    </ChecklistBuilderContext.Provider>
  );
};