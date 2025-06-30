import React, { useState, useEffect } from "react";
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

const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [orgOptions, setOrgOptions] = useState<OrganizationOption[]>([]);

  useEffect(() => {
    if (role === "user") {
      fetchOrganizations().then(setOrgOptions);
    }
  }, [role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(register({ name, email, password, organization, role }));
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
            label="Organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            fullWidth
            margin="normal"
            required
            SelectProps={{ native: true }}
            helperText="Select your organization."
          >
            <option value="">Select organization</option>
            {orgOptions.map((org) => (
              <option key={org._id} value={org._id}>
                {org.name}
              </option>
            ))}
          </TextField>
        )}
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
