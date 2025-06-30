import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  organization: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const token = localStorage.getItem("token");

export const login = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await axios.post("/api/auth/login", data);
      return res.data;
    } catch (err) {
      let message = "Login failed";
      if (axios.isAxiosError(err) && err.response) {
        message = err.response.data.message || message;
      }
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (
    data: {
      name: string;
      email: string;
      password: string;
      organization: string;
      role: "admin" | "user";
    },
    thunkAPI
  ) => {
    try {
      const res = await axios.post("/api/auth/register", data);
      return res.data;
    } catch (err) {
      let message = "Registration failed";
      if (axios.isAxiosError(err) && err.response) {
        message = err.response.data.message || message;
      }
      return thunkAPI.rejectWithValue({ message });
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, thunkAPI) => {
    const token = localStorage.getItem("token");
    if (!token) return thunkAPI.rejectWithValue({ message: "No token" });
    try {
      const res = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { user: res.data, token };
    } catch (err) {
      console.log("error while loading user:", err);
      localStorage.removeItem("token");
      return thunkAPI.rejectWithValue({ message: "Session expired" });
    }
  }
);

const initialState: AuthState = {
  user: null,
  token: token || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message || "Login failed";
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message: string })?.message ||
          "Registration failed";
      })
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error =
          (action.payload as { message: string })?.message || "Session expired";
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
