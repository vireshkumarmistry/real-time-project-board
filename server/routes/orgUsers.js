const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../utils/authMiddleware");

const router = express.Router();

// Get all users in the same organization (admin or user)
router.get("/org-users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ organization: req.organization }).select(
      "_id name email"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
