module.exports = (io) => {
  const express = require("express");
  const Task = require("../../models/Task");
  const Project = require("../../models/Project");
  const authMiddleware = require("../../utils/authMiddleware");

  const router = express.Router();

  // Create Task (admin only, assign to user in org and project)
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { title, description, status, project, assignedTo, dueDate } =
        req.body;
      // Only allow admin to assign tasks
      if (req.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admins can create/assign tasks" });
      }
      // Check project exists and belongs to admin's org and admin is creator
      const proj = await Project.findOne({
        _id: project,
        organization: req.organization,
        createdBy: req.user._id,
      });
      if (!proj) {
        return res.status(403).json({
          message:
            "You can only assign tasks for your own projects in your organization",
        });
      }
      // Check assignedTo user is in org (do not require project membership)
      if (assignedTo) {
        const user = await require("../../models/User").findOne({
          _id: assignedTo,
          organization: req.organization,
        });
        if (!user) {
          return res.status(403).json({
            message: "Assigned user must be in your organization",
          });
        }
      }
      const task = new Task({
        title,
        description,
        status,
        project,
        assignedTo,
        dueDate,
        createdBy: req.user.id,
      });
      await task.save();
      io.emit("task:created", task);
      res.status(201).json(task);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get Tasks for Project (org scoped)
  router.get("/project/:projectId", authMiddleware, async (req, res) => {
    try {
      // Allow if user is in the same org as the project
      const proj = await Project.findOne({
        _id: req.params.projectId,
        organization: req.organization,
      });
      if (!proj)
        return res
          .status(403)
          .json({ message: "Not authorized for this project" });
      const tasks = await Task.find({ project: req.params.projectId });
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update Task (admin only, org/project scoped)
  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      const proj = await Project.findOne({
        _id: task.project,
        organization: req.organization,
        createdBy: req.user._id,
      });
      if (!proj || req.role !== "admin") {
        return res.status(403).json({
          message: "Only the admin who owns this project can update its tasks",
        });
      }
      Object.assign(task, req.body);
      await task.save();
      await task.populate("assignedTo", "_id name email");
      io.emit("task:updated", task);
      res.json(task);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete Task (admin only, org/project scoped)
  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      const proj = await Project.findOne({
        _id: task.project,
        organization: req.organization,
        createdBy: req.user._id,
      });
      if (!proj || req.role !== "admin") {
        return res.status(403).json({
          message: "Only the admin who owns this project can delete its tasks",
        });
      }
      await Task.deleteOne({ _id: req.params.id });
      io.emit("task:deleted", req.params.id);
      res.json({ message: "Task deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
};
