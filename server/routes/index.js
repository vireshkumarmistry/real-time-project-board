const router = require("express").Router();

router.use("/api", require("./api"));
router.use("/api", (req, res) => res.status(404).json("No API route found"));
