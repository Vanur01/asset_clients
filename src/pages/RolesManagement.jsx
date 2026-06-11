// src/pages/RolesManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContexts";

const RolesManagement = () => {
  const { authRequest, isSuperAdmin } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await authRequest("GET", "/roles");
      if (response?.success) {
        setRoles(response.roles || []);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenDialog = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || "",
        permissions: role.permissions || [],
      });
    } else {
      setEditingRole(null);
      setFormData({ name: "", description: "", permissions: [] });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRole(null);
    setFormData({ name: "", description: "", permissions: [] });
  };

  const handleSave = async () => {
    try {
      let response;
      if (editingRole) {
        response = await authRequest(
          "PUT",
          `/roles/${editingRole.id}`,
          formData,
        );
      } else {
        response = await authRequest("POST", "/roles", formData);
      }
      if (response?.success) {
        setSnack({
          open: true,
          message: `Role ${editingRole ? "updated" : "created"} successfully`,
          severity: "success",
        });
        fetchRoles();
        handleCloseDialog();
      }
    } catch (error) {
      setSnack({
        open: true,
        message: error.response?.data?.message || "Failed to save role",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        const response = await authRequest("DELETE", `/roles/${id}`);
        if (response?.success) {
          setSnack({
            open: true,
            message: "Role deleted successfully",
            severity: "success",
          });
          fetchRoles();
        }
      } catch (error) {
        setSnack({
          open: true,
          message: error.response?.data?.message || "Failed to delete role",
          severity: "error",
        });
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            <SecurityIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Roles Management
          </Typography>
          {isSuperAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Role
            </Button>
          )}
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Role Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Permissions</TableCell>
                {isSuperAdmin && <TableCell align="center">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id || role._id}>
                  <TableCell>
                    <Chip label={role.name} color="primary" size="small" />
                  </TableCell>
                  <TableCell>{role.description || "—"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {role.permissions?.slice(0, 3).map((perm, idx) => (
                        <Chip
                          key={idx}
                          label={perm}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {role.permissions?.length > 3 && (
                        <Chip
                          label={`+${role.permissions.length - 3}`}
                          size="small"
                        />
                      )}
                    </Stack>
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(role)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(role.id || role._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Role Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RolesManagement;
