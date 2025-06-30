import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "../store";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../store/projectSlice";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../store";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getSocket } from "../socket";

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector(
    (state: import("../store").RootState) => state.auth.user
  );
  const projects = useSelector(
    (state: import("../store").RootState) => state.projects.items
  );
  const loading = useSelector(
    (state: import("../store").RootState) => state.projects.loading
  );
  const error = useSelector(
    (state: import("../store").RootState) => state.projects.error
  );

  // State for create project dialog
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // State for edit project dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editProject, setEditProject] = useState<{
    _id: string;
    name: string;
    description?: string;
  } | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (user) {
      dispatch(fetchProjects());
      const socket = getSocket();
      socket.on("project:created", (project) => {
        dispatch(
          createProject.fulfilled(project, "", {
            name: project.name,
            description: project.description,
          })
        );
      });
      socket.on("project:updated", (project) => {
        dispatch(
          updateProject.fulfilled(project, "", {
            id: project._id,
            updates: project,
          })
        );
      });
      socket.on("project:deleted", (id) => {
        dispatch(deleteProject.fulfilled(id, "", id));
      });
      return () => {
        socket.off("project:created");
        socket.off("project:updated");
        socket.off("project:deleted");
      };
    }
  }, [dispatch, user]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setName("");
    setDescription("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createProject({ name, description })).unwrap();
      handleClose();
    } catch (err) {
      console.error("Failed to create project: ", err);
    }
  };

  const handleEditOpen = (project: {
    _id: string;
    name: string;
    description?: string;
  }) => {
    setEditProject(project);
    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditProject(null);
    setEditName("");
    setEditDescription("");
  };
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editProject) {
      try {
        await dispatch(
          updateProject({
            id: editProject._id,
            updates: { name: editName, description: editDescription },
          })
        ).unwrap();
        handleEditClose();
      } catch (err) {
        console.error("Failed to update project: ", err);
      }
    }
  };
  const handleDelete = (id: string) => {
    dispatch(deleteProject(id));
  };

  return (
    <Box maxWidth={600} mx="auto" mt={6}>
      <Typography variant="h4" mb={3}>
        Welcome, {user?.name}!
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Your Projects</Typography>
        <Button variant="contained" onClick={handleOpen}>
          New Project
        </Button>
      </Box>
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      <List>
        {projects.map((project) => (
          <ListItem key={project._id} divider>
            <ListItemText
              primary={project.name}
              secondary={project.description}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate(`/project/${project._id}`)}
            >
              View
            </Button>
            <Button
              size="small"
              onClick={() => handleEditOpen(project)}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
            <Button
              size="small"
              onClick={() => handleDelete(project._id)}
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create Project</DialogTitle>
        <form onSubmit={handleCreate}>
          <DialogContent>
            <TextField
              label="Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Project</DialogTitle>
        <form onSubmit={handleEditSave}>
          <DialogContent>
            <TextField
              label="Project Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
