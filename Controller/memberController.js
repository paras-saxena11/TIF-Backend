const Community = require("../Models/communityModel");
const Role = require("../Models/roleModel");
const Member = require("../Models/memberModel");
const User = require("../Models/userModel");

const createMember = async (req, res) => {
  try {
    const { community, user, role } = req.body;
    //admin user id
    const adminId = req.user;
    const admin = await User.findOne({ _id: adminId });
    const admin_id = admin._id;

    //community
    const communityDoc = await Community.findOne({ _id: community });
    if (!communityDoc) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "community",
            message: "Community not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }
    const owner_ID = communityDoc.owner;
    // const owner_ID = new mongoose.Types.ObjectId(community_owner);

    //Signed in user in not community admin
    if (admin_id.toString() !== owner_ID.toString()) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "You are not authorized to perform this action.",
            code: "NOT_ALLOWED_ACCESS",
          },
        ],
      });
    }

    const userMember = await User.findOne({ _id: user });
    if (!userMember) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "user",
            message: "User not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }
    const communityMembers = await Member.find({ community_id: community });
    for (const communityMember of communityMembers) {
      if (communityMember.user_id.toString() === userMember._id.toString()) {
        return res.status(400).json({
          status: false,
          errors: [
            {
              message: "User is already added in the community.",
              code: "RESOURCE_EXISTS",
            },
          ],
        });
      }
    }
    const roleFound = await Role.findOne({ _id: role });
    if (!roleFound) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "role",
            message: "Role not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }
    const member = await Member.create({
      community_id: communityDoc._id,
      user_id: userMember._id,
      role_id: roleFound._id,
    });
    const data = {
      id: member._id,
      community: member.community_id,
      user: member.user_id,
      role: member.role_id,
      created_at: member.created_at,
    };
    res.status(200).json({ status: true, content: { data } });
  } catch (error) {
    res.status(400).json({
      status: false,
      errors: [
        {
          message: error.message,
          code: error?.code,
        },
      ],
    });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    const admin = await User.findOne({ _id: userId });
    const member = await Member.findOne({ user_id: admin._id });
    if (!member) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "You are not authorized to perform this action.",
            code: "NOT_ALLOWED_ACCESS",
          },
        ],
      });
    }
    // console.log(member);
    const role = await Role.findOne({ _id: member.role_id });

    //check role
    const roleAdmin = role.name;
    // console.log(roleAdmin);
    if (
      roleAdmin !== "Community Admin" &&
      roleAdmin !== "Community Moderator"
    ) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            message: "You are not authorized to perform this action.",
            code: "NOT_ALLOWED_ACCESS R",
          },
        ],
      });
    }
    const deletedMember = await Member.findByIdAndDelete(id);
    if (deletedMember == null) {
      return res.status(200).json({
        status: false,
        errors: [
          {
            message: "Member not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }
    res.status(200).json({ status: true });
  } catch (error) {
    res.status(400).json({
      status: false,
      errors: [
        {
          message: error.message,
          code: error?.code,
        },
      ],
    });
  }
};
module.exports = { createMember, deleteMember };
