import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../api/axios";
import axios from "axios";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  project: string;
  assignedTo?: string;
  createdBy: string;
  dueDate?: string;
  createdAt: string;
}

interface TasksState {
  items: Task[];
  loading: boolean;
  error: string | null;
}

export const fetchTasks = createAsyncThunk<
  Task[],
  string,
  {
    state: { auth: { token: string | null } };
    rejectValue: { message: string };
  }
>("tasks/fetchTasks", async (projectId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.get(`/api/tasks/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    let message = "Failed to fetch tasks";
    if (axios.isAxiosError(err) && err.response) {
      message = err.response.data.message || message;
    }
    return thunkAPI.rejectWithValue({ message });
  }
});

export const createTask = createAsyncThunk<
  Task,
  { title: string; description?: string; project: string },
  {
    state: { auth: { token: string | null } };
    rejectValue: { message: string };
  }
>("tasks/createTask", async (data, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.post("/api/tasks", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    let message = "Failed to create task";
    if (axios.isAxiosError(err) && err.response) {
      message = err.response.data.message || message;
    }
    return thunkAPI.rejectWithValue({ message });
  }
});

export const updateTask = createAsyncThunk<
  Task,
  {
    id: string;
    updates: Partial<Omit<Task, "_id" | "project" | "createdBy" | "createdAt">>;
  },
  {
    state: { auth: { token: string | null } };
    rejectValue: { message: string };
  }
>("tasks/updateTask", async ({ id, updates }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.put(`/api/tasks/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    let message = "Failed to update task";
    if (axios.isAxiosError(err) && err.response) {
      message = err.response.data.message || message;
    }
    return thunkAPI.rejectWithValue({ message });
  }
});

export const deleteTask = createAsyncThunk<
  string,
  string,
  {
    state: { auth: { token: string | null } };
    rejectValue: { message: string };
  }
>("tasks/deleteTask", async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    await api.delete(`/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  } catch (err) {
    let message = "Failed to delete task";
    if (axios.isAxiosError(err) && err.response) {
      message = err.response.data.message || message;
    }
    return thunkAPI.rejectWithValue({ message });
  }
});

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.items = action.payload;
    },
    addTask(state, action: PayloadAction<Task>) {
      // Only add if not already present
      if (!state.items.some((t) => t._id === action.payload._id)) {
        state.items.unshift(action.payload);
      }
    },
    updateTaskInState(state, action: PayloadAction<Task>) {
      state.items = state.items.map((task) =>
        task._id === action.payload._id ? action.payload : task
      );
    },
    removeTask(state, action: PayloadAction<string>) {
      state.items = state.items.filter((task) => task._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Failed to fetch tasks";
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state) => {
        state.loading = false;
        // Do not add the task here, rely on socket event
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Failed to create task";
      })
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state) => {
        state.loading = false;
        // Do not update here, rely on socket event
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Failed to update task";
      })
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state) => {
        state.loading = false;
        // Do not remove here, rely on socket event
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Failed to delete task";
      });
  },
});

export const { setTasks, addTask, updateTaskInState, removeTask } =
  taskSlice.actions;
export default taskSlice.reducer;
