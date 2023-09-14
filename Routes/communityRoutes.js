const express = require("express");
const communityController = require("../Controller/communityController");
const authMiddleware = require("../Middleware/authMiddleware");

const router = express.Router();

// create role route
router.post("/", authMiddleware, communityController.createCommunity);

// get role route
router.get("/", communityController.getCommunities);

//All community members
router.get("/:id/members", communityController.getAllMembers);

//get my owned community
router.get(
  "/me/owner",
  authMiddleware,
  communityController.getMyOwnedCommunity
);

router.get(
  "/me/member",
  authMiddleware,
  communityController.getMyJoinedCommunity
);
module.exports = router;
