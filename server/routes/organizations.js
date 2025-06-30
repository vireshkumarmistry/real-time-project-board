const express = require("express");
const Organization = require("../models/Organization");

const router = express.Router();

// Get all organizations (id and name)
router.get("/organizations", async (req, res) => {
  try {
    const orgs = await Organization.find({}, "_id name");
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
