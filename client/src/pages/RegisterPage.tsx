import * as React from "react";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { register } from "../store/authSlice";
import type { AppDispatch } from "../store";
import { useSelector } from "../store";
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import type { OrganizationOption } from "../api/organizations";
import { fetchOrganizations } from "../api/organizations";
import { useNavigate } from "react-router-dom";

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [orgOptions, setOrgOptions] = useState<OrganizationOption[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "user") {
      fetchOrganizations().then(setOrgOptions);
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resultAction = await dispatch(
        register({ name, email, password, organization, role })
      );
      if (register.fulfilled.match(resultAction)) {
        navigate("/projects");
      }
    } catch (err) {
      console.log("Registration error:", err);
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8} p={3} boxShadow={3} borderRadius={2}>
      <Typography variant="h5" mb={2}>
        Register
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as "admin" | "user")}
          fullWidth
          margin="normal"
          SelectProps={{ native: true }}
          required
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </TextField>
        {role === "admin" ? (
          <TextField
            label="Organization (new)"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            fullWidth
            margin="normal"
            required
            helperText="Admins must create a new unique organization."
          />
        ) : (
          <TextField
            select
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            fullWidth
            margin="normal"
            required
            SelectProps={{ native: true }}
          >
            <option value="">Select organization</option>
            {orgOptions.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </TextField>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Register"}
        </Button>
      </form>
    </Box>
  );
};

export default RegisterPage;
