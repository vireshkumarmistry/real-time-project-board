// server/index.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Parse allowed origins from .env
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

// CORS for Express
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // if you use cookies/auth
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI);

// Socket.io connection (use allowedOrigins for CORS)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Basic route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Routes
const authRoutes = require("./routes/api/auth.routes");
app.use("/api/auth", authRoutes);

const projectRoutes = require("./routes/api/project.routes")(io);
const taskRoutes = require("./routes/api/task.routes")(io);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

const orgUsersRoutes = require("./routes/api/orgUsers.routes");
app.use("/api/auth", orgUsersRoutes);

const organizationsRoutes = require("./routes/api/organizations.routes");
app.use("/api/auth", organizationsRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
