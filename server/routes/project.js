module.exports = (io) => {
  const express = require("express");
  const Project = require("../models/Project");
  const Task = require("../models/Task");
  const User = require("../models/User");
  const authMiddleware = require("../utils/authMiddleware");

  const router = express.Router();

  // Create Project
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { name, description, members } = req.body;
      // Only allow admin to create projects
      if (req.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Only admins can create projects" });
      }
      const project = new Project({
        name,
        description,
        members: members || [req.user.id],
        organization: req.organization,
        createdBy: req.user.id,
      });
      await project.save();
      io.emit("project:created", project);
      res.status(201).json(project);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get All Projects for User (scoped to org)
  router.get("/", authMiddleware, async (req, res) => {
    try {
      const projects = await Project.find({
        organization: req.organization,
      }).populate("members", "name email");
      res.json(projects);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update Project (admin only, org scoped)
  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        organization: req.organization,
      });
      if (!project)
        return res.status(404).json({ message: "Project not found" });
      if (
        req.role !== "admin" ||
        String(project.createdBy) !== String(req.user._id)
      ) {
        return res.status(403).json({
          message: "Only the admin who created this project can update it",
        });
      }
      Object.assign(project, req.body);
      await project.save();
      io.emit("project:updated", project);
      res.json(project);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete Project (admin only, org scoped)
  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        organization: req.organization,
      });
      if (!project)
        return res.status(404).json({ message: "Project not found" });
      if (
        req.role !== "admin" ||
        String(project.createdBy) !== String(req.user._id)
      ) {
        return res.status(403).json({
          message: "Only the admin who created this project can delete it",
        });
      }
      await Project.deleteOne({ _id: req.params.id });
      io.emit("project:deleted", req.params.id);
      res.json({ message: "Project deleted" });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all members of a project (admin or member)
  router.get("/:id/members", authMiddleware, async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        organization: req.organization,
      }).populate("members", "_id name email");
      if (!project)
        return res.status(404).json({ message: "Project not found" });
      // Only allow if user is a member or admin in org
      if (
        req.role !== "admin" &&
        !project.members.some((m) => String(m._id) === String(req.user._id))
      ) {
        return res.status(403).json({ message: "Not authorized" });
      }
      res.json(project.members);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  return router;
};
