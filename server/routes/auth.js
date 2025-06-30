const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Organization = require("../models/Organization");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "user", organization } = req.body;
    if (!name || !email || !password || !organization) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let orgDoc;
    let user;
    if (role === "admin") {
      // Admin must create a new unique organization
      const orgExists = await Organization.findOne({ name: organization });
      if (orgExists) {
        return res.status(409).json({
          message: "Organization already exists. Please choose a unique name.",
        });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create org with placeholder createdBy (dummy ObjectId)
      const dummyUserId = new mongoose.Types.ObjectId();
      orgDoc = new Organization({ name: organization, createdBy: dummyUserId });
      await orgDoc.save();
      // Now create user with org ObjectId
      user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        organization: orgDoc._id,
      });
      await user.save();
      // Update org's createdBy to real user._id
      orgDoc.createdBy = user._id;
      await orgDoc.save();
    } else {
      // User must select an existing organization (by ObjectId)
      orgDoc = await Organization.findById(organization);
      if (!orgDoc) {
        return res
          .status(400)
          .json({ message: "Selected organization does not exist." });
      }
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already in use" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({
        name,
        email,
        password: hashedPassword,
        role,
        organization: orgDoc._id,
      });
      await user.save();
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
