import * as React from "react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSelector } from "../store";
import { useDispatch } from "../store/useDispatch";
import {
  fetchProjects,
  createProject,
  updateProjectInState,
} from "../store/projectSlice";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from "@mui/material";
import { getSocket } from "../socket";
import { useSnackbar } from "notistack";
import VirtualizedList from "../components/VirtualizedList";
import type { Project } from "../store/projectSlice";

const ProjectsPage: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { items: projects, loading } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    dispatch(fetchProjects());
    const socket = getSocket();
    socket.on("project:created", () => {
      dispatch(fetchProjects());
    });
    socket.on("project:deleted", () => {
      dispatch(fetchProjects());
    });
    socket.on("project:updated", (project) => {
      dispatch(updateProjectInState(project));
    });
    return () => {
      socket.off("project:created");
      socket.off("project:deleted");
      socket.off("project:updated");
    };
  }, [dispatch]);

  const handleCreate = useCallback(async () => {
    try {
      await dispatch(createProject({ name, description })).unwrap();
      setOpen(false);
      setName("");
      setDescription("");
      enqueueSnackbar("Project created successfully!", { variant: "success" });
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : undefined;
      enqueueSnackbar(message || "Failed to create project", {
        variant: "error",
      });
    }
  }, [dispatch, name, description, enqueueSnackbar]);

  const handleProjectClick = useCallback(
    (projectId: string) => {
      navigate(`/project/${projectId}`);
    },
    [navigate]
  );

  const projectList = useMemo(() => projects, [projects]);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : projects.length === 0 ? (
        <Box>
          <Typography>No projects found.</Typography>
          {user?.role === "admin" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
            >
              Create Project
            </Button>
          )}
        </Box>
      ) : (
        <Box>
          {user?.role === "admin" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
              sx={{ mb: 2 }}
            >
              New Project
            </Button>
          )}
          <VirtualizedList
            items={projectList}
            itemHeight={72}
            height={400}
            width="100%"
            renderItem={(item) => {
              const project = item as Project;
              return (
                <Box
                  key={project._id}
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    cursor: "pointer",
                    "&:hover": { background: "#f5f5f5" },
                  }}
                  onClick={() => handleProjectClick(project._id)}
                >
                  <Typography variant="h6">{project.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.description}
                  </Typography>
                </Box>
              );
            }}
          />
        </Box>
      )}
      {user?.role === "admin" && (
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Create Project</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Project Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!name} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
});

export default ProjectsPage;
