const express = require("express");
const authController = require("../Controller/authController");
const authMiddleware = require("../Middleware/authMiddleware");

const router = express.Router();

// Signup route
router.post("/signup", authController.signup);

// Login route
router.post("/signin", authController.signin);

// Login route
router.get("/me", authMiddleware, authController.getUser);

module.exports = router;
