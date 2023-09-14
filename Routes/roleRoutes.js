const express = require("express");
const roleController = require("../Controller/roleController");

const router = express.Router();

// create role route
router.post("/", roleController.createRole);

// get role route
router.get("/", roleController.getRole);

module.exports = router;
