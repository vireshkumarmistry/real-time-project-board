import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "../store";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const Navbar: React.FC = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to={user ? "/projects" : "/"}
          sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
        >
          Project Manager
        </Typography>
        {user ? (
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1">
              {user.name} ({user.role})
            </Typography>
            <Button color="inherit" component={Link} to="/projects">
              Projects
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
