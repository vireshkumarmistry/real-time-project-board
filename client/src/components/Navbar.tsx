import * as React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
} from "@mui/material";
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
    <AppBar position="sticky">
      <Toolbar className="bg-gray-700 flex justify-between">
        <Typography
          className=""
          variant="h6"
          component={Link}
          to={user ? "/projects" : "/"}
          sx={{ color: "inherit", textDecoration: "none" }}
        >
          Project Manager
        </Typography>
        {user ? (
          <Box display="flex" alignItems="center" gap={2}>
            <Button color="inherit" component={Link} to="/projects">
              Projects
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
            <Typography
              className="flex items-center gap-2 cursor-pointer"
              variant="body1"
            >
              <Avatar>A</Avatar>
              {user.name} ({user.role})
            </Typography>
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
