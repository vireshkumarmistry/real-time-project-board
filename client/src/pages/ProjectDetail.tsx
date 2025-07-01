import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "../store";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../store/taskSlice";
import {
  updateProject,
  deleteProject,
  fetchProjects,
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
  IconButton,
  Avatar,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useSnackbar } from "notistack";
type AlertColor = "success" | "info" | "warning" | "error";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { AppDispatch } from "../store";
import { getSocket } from "../socket";
import { addTask, updateTaskInState, removeTask } from "../store/taskSlice";
import { updateProjectInState } from "../store/projectSlice";
import { fetchOrgUsers } from "../api/orgUsers";

interface ProjectMember {
  _id: string;
  name: string;
  email: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const project = useSelector((state) =>
    state.projects.items.find((p) => p._id === id)
  );
  const projectsLoading = useSelector((state) => state.projects.loading);
  const tasks = useSelector((state) => state.tasks.items);
  const loading = useSelector((state) => state.tasks.loading);
  const { user, token } = useSelector((state) => state.auth);
  const { enqueueSnackbar } = useSnackbar();

  // State for create task dialog
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [orgUsers, setOrgUsers] = useState<ProjectMember[]>([]);

  // State for edit task dialog
  const [editOpen, setEditOpen] = useState(false);
  type TaskType = (typeof tasks)[number] | null;
  const [editTask, setEditTask] = useState<TaskType>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");

  // State for edit project dialog
  const [projectEditOpen, setProjectEditOpen] = useState(false);
  const [editName, setEditName] = useState(project?.name || "");
  const [editProjectDescription, setEditProjectDescription] = useState(
    project?.description || ""
  );

  // State for snackbar notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  const [projectsLoaded, setProjectsLoaded] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchTasks(id));
      const socket = getSocket();
      socket.on("task:created", (task) => {
        if (task.project === id) dispatch(addTask(task));
      });
      socket.on("task:updated", (task) => {
        if (task.project === id) dispatch(updateTaskInState(task));
      });
      socket.on("task:deleted", (taskId) => {
        dispatch(removeTask(taskId));
      });
      socket.on("project:updated", (project) => {
        if (project._id === id) {
          // Update project in Redux state for this detail page
          dispatch(updateProjectInState(project));
        }
      });
      return () => {
        socket.off("task:created");
        socket.off("task:updated");
        socket.off("task:deleted");
        socket.off("project:updated");
      };
    }
  }, [dispatch, id]);

  // Fetch projects only once on mount if not loaded
  useEffect(() => {
    if (!projectsLoaded && !projectsLoading) {
      dispatch(fetchProjects()).then(() => setProjectsLoaded(true));
    } else if (!projectsLoading) {
      setProjectsLoaded(true);
    }
  }, [dispatch, projectsLoaded, projectsLoading]);

  // Only redirect if projectsLoaded is true and project is missing
  useEffect(() => {
    if (projectsLoaded && !project) {
      navigate("/");
    }
  }, [project, projectsLoaded, navigate]);

  useEffect(() => {
    if (user?.role === "admin" && project && token) {
      import("../api/projectMembers").then(({ fetchProjectMembers }) => {
        fetchProjectMembers(project._id, token).then(setMembers);
      });
    }
  }, [user, project, token]);

  useEffect(() => {
    // Fetch all org users for assignee dropdown
    if (token) {
      fetchOrgUsers(token).then(setOrgUsers);
    }
  }, [project, token]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setTitle("");
    setDescription("");
    setAssignee("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const taskData: {
      title: string;
      description: string;
      project: string;
      assignedTo?: string;
    } = { title, description, project: id };
    if (user?.role === "admin" && assignee) taskData.assignedTo = assignee;
    // CREATE TASK
    try {
      await dispatch(createTask(taskData)).unwrap();
      enqueueSnackbar("Task created successfully!", { variant: "success" });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : undefined;
      enqueueSnackbar(message || "An error occurred", { variant: "error" });
    }
    handleClose();
    setAssignee("");
  };

  const handleEditOpen = (task: TaskType) => {
    setEditTask(task);
    setEditTitle(task?.title || "");
    setEditTaskDescription(task?.description || "");
    setEditOpen(true);
  };
  const handleEditClose = () => {
    setEditOpen(false);
    setEditTask(null);
    setEditTitle("");
    setEditTaskDescription("");
  };
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTask) {
      // UPDATE TASK
      try {
        await dispatch(
          updateTask({
            id: editTask._id,
            updates: {
              title: editTitle,
              description: editTaskDescription,
              ...(user?.role === "admin" && assignee
                ? { assignedTo: assignee }
                : {}),
            },
          })
        ).unwrap();
        setEditOpen(false);
        setEditTask(null);
        setEditTitle("");
        setEditTaskDescription("");
        enqueueSnackbar("Task updated successfully!", { variant: "success" });
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message?: string }).message
            : undefined;
        enqueueSnackbar(message || "An error occurred", { variant: "error" });
      }
    }
  };
  const handleProjectEditOpen = () => {
    setEditName(project?.name || "");
    setEditProjectDescription(project?.description || "");
    setProjectEditOpen(true);
  };
  const handleProjectEditClose = () => {
    setProjectEditOpen(false);
  };
  const handleProjectEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (project) {
      // UPDATE PROJECT
      try {
        await dispatch(
          updateProject({
            id: project._id,
            updates: { name: editName, description: editProjectDescription },
          })
        ).unwrap();
        setProjectEditOpen(false);
        enqueueSnackbar("Project updated successfully!", {
          variant: "success",
        });
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message?: string }).message
            : undefined;
        enqueueSnackbar(message || "An error occurred", { variant: "error" });
      }
    }
  };
  const handleDelete = async () => {
    if (project) {
      try {
        await dispatch(deleteProject(project._id)).unwrap();
        enqueueSnackbar("Project deleted successfully!", {
          variant: "success",
        });
        navigate("/");
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "message" in err
            ? (err as { message?: string }).message
            : undefined;
        enqueueSnackbar(message || "Failed to delete project", {
          variant: "error",
        });
      }
    }
  };
  const handleDeleteTask = async (taskId: string) => {
    // DELETE TASK
    try {
      await dispatch(deleteTask(taskId)).unwrap();
      enqueueSnackbar("Task deleted successfully!", { variant: "success" });
      // No redirect, just remove from list (handled by socket and redux)
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? (err as { message?: string }).message
          : undefined;
      enqueueSnackbar(message || "Failed to delete task", {
        variant: "error",
      });
    }
  };

  if (!project) {
    if (projectsLoading) return <Typography>Loading project...</Typography>;
    return <Typography>Project not found.</Typography>;
  }

  return (
    <Box className="container mx-auto py-4">
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Box className="flex items-center gap-2">
          <Typography className="text-gray-700 capitalize" variant="h5" ml={1}>
            {project.name}
          </Typography>
          <Typography
            className="flex justify-start capitalize text-gray-400"
            variant="subtitle1"
          >
            ({project.description})
          </Typography>
        </Box>
        {user?.role === "admin" && (
          <Box className="flex ml-auto">
            <IconButton onClick={handleProjectEditOpen} sx={{ ml: 1 }}>
              <EditIcon className="text-blue-500" />
            </IconButton>
            <IconButton onClick={handleDelete} sx={{ ml: 1 }}>
              <DeleteIcon className="text-red-600" />
            </IconButton>
          </Box>
        )}
      </Box>

      <Box className="flex justify-between items-center mb-4 rounded-lg p-4 bg-gray-100">
        <Typography variant="h6">Tasks</Typography>
        {user?.role === "admin" && (
          <Button
            className="!bg-gray-500 !text-white text-base hover:!bg-gray-800"
            variant="contained"
            onClick={handleOpen}
          >
            New Task
          </Button>
        )}
      </Box>
      {loading && <CircularProgress />}
      <List className="flex flex-col gap-4">
        {tasks.map((task) => (
          <ListItem
            className="border border-gray-400 rounded-md shadow-sm "
            key={task._id}
          >
            <Avatar
              sx={{
                mr: 2,
                bgcolor: task.assignedTo ? "primary.main" : "grey.400",
              }}
            >
              {task.assignedTo
                ? members.find((m) => m._id === task.assignedTo)?.name?.[0] ||
                  "U"
                : "U"}
            </Avatar>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography
                    className="capitalize text-slate-700"
                    variant="body1"
                  >
                    {task.title}
                  </Typography>
                  {task.assignedTo && (
                    <Typography variant="caption" className="text-slate-400">
                      <strong>Assigned to: </strong>
                      {typeof task.assignedTo === "object" &&
                      task.assignedTo &&
                      "name" in task.assignedTo
                        ? (task.assignedTo as { name: string }).name
                        : orgUsers.find(
                            (u) =>
                              u._id ===
                              (typeof task.assignedTo === "string"
                                ? task.assignedTo
                                : task.assignedTo &&
                                  typeof task.assignedTo === "object" &&
                                  "_id" in task.assignedTo
                                ? (task.assignedTo as { _id: string })._id
                                : undefined)
                          )?.name || "User"}
                    </Typography>
                  )}
                </Box>
              }
              secondary={
                <>
                  <Typography
                    className="text-slate-500 capitalize font-bold"
                    variant="subtitle1"
                  >
                    <strong>{task.description}</strong>
                  </Typography>
                  <Typography
                    className="text-slate-700 font-bold"
                    variant="caption"
                  >
                    <strong>Status: </strong>
                    <span className="text-slate-400">{task.status}</span>
                  </Typography>
                </>
              }
            />
            {user?.role === "admin" && (
              <>
                <IconButton onClick={() => handleEditOpen(task)}>
                  <EditIcon className="text-blue-500" />
                </IconButton>
                <IconButton onClick={() => handleDeleteTask(task._id)}>
                  <DeleteIcon className="text-red-600" />
                </IconButton>
              </>
            )}
          </ListItem>
        ))}
      </List>
      {user?.role === "admin" && (
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Create Task</DialogTitle>
          <form onSubmit={handleCreate}>
            <DialogContent>
              <TextField
                label="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
              {user?.role === "admin" && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Assignee</InputLabel>
                  <Select
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    label="Assignee"
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {orgUsers.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained">
                Create
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle className="border-b border-slate-400 font-semibold text-lg">
          <strong>Edit Task</strong>
        </DialogTitle>
        <form onSubmit={handleEditSave}>
          <DialogContent>
            <TextField
              label="Task Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              value={editTaskDescription}
              onChange={(e) => setEditTaskDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
            {user?.role === "admin" && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  label="Assignee"
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {orgUsers.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions className="border-t border-slate-400 ">
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={projectEditOpen} onClose={handleProjectEditClose}>
        <DialogTitle>Edit Project</DialogTitle>
        <form onSubmit={handleProjectEditSave}>
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
              value={editProjectDescription}
              onChange={(e) => setEditProjectDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleProjectEditClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default ProjectDetail;
