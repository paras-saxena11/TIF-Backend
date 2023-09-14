const express = require("express");
const memberController = require("../Controller/memberController");
const authMiddleware = require("../Middleware/authMiddleware");

const router = express.Router();

// create member route
router.post("/", authMiddleware, memberController.createMember);

// get role route
router.delete("/:id", authMiddleware, memberController.deleteMember);

module.exports = router;
