import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../api/axios";

interface Project {
  _id: string;
  name: string;
  description?: string;
  members: Array<{ _id: string; name: string; email: string }>;
  createdBy: string;
  createdAt: string;
}

interface ProjectsState {
  items: Project[];
  loading: boolean;
  error: string | null;
}

export const fetchProjects = createAsyncThunk<
  Project[],
  void,
  {
    state: { auth: { token: string | null } };
    rejectValue: { message: string };
  }
>("projects/fetchProjects", async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.get("/api/projects", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch {
    const message = "Failed to fetch projects";
    return thunkAPI.rejectWithValue({ message });
  }
});

export const createProject = createAsyncThunk<
  Project,
  { name: string; description?: string },
  {
    state: { auth: { token: string | null } };
    rejectValue: { message: string };
  }
>("projects/createProject", async (data, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.post("/api/projects", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch {
    const message = "Failed to create project";
    return thunkAPI.rejectWithValue({ message });
  }
});

export const updateProject = createAsyncThunk<
  Project,
  {
    id: string;
    updates: Partial<
      Omit<Project, "_id" | "createdBy" | "createdAt" | "members">
    >;
  },
  {
    state: { auth: { token: string | null } };
    rejectValue: { message: string };
  }
>("projects/updateProject", async ({ id, updates }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    const res = await api.put(`/api/projects/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch {
    const message = "Failed to update project";
    return thunkAPI.rejectWithValue({ message });
  }
});

export const deleteProject = createAsyncThunk<
  string,
  string,
  {
    state: { auth: { token: string | null } };
    rejectValue: { message: string };
  }
>("projects/deleteProject", async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.token;
    await api.delete(`/api/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  } catch {
    const message = "Failed to delete project";
    return thunkAPI.rejectWithValue({ message });
  }
});

const initialState: ProjectsState = {
  items: [],
  loading: false,
  error: null,
};

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    updateProjectInState(state, action: PayloadAction<Project>) {
      state.items = state.items.map((project) =>
        project._id === action.payload._id ? action.payload : project
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchProjects.fulfilled,
        (state, action: PayloadAction<Project[]>) => {
          state.loading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Failed to fetch projects";
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createProject.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.loading = false;
          state.items.unshift(action.payload);
        }
      )
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Failed to create project";
      })
      .addCase(updateProject.fulfilled, () => {})
      .addCase(
        deleteProject.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.items = state.items.filter(
            (project) => project._id !== action.payload
          );
        }
      );
  },
});

export const { updateProjectInState } = projectSlice.actions;
export default projectSlice.reducer;
export type { Project };
