const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/projects", require("./project.routes"));
router.use("/tasks", require("./task.routes"));
router.use("/org-users", require("./orgUsers.routes"));

module.exports = router;
