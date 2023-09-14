const Community = require("../Models/communityModel");
const Role = require("../Models/roleModel");
const Member = require("../Models/memberModel");
const User = require("../Models/userModel");
const mongoose = require("mongoose");

const createCommunity = async (req, res) => {
  try {
    const { name } = req.body;
    const owner = req.user;

    const slug = name.toLowerCase().replace(/\s+/g, "-");
    const community = await Community.create({ name, slug, owner });

    // Validate the user
    const validationErrors = community.validateSync();

    if (validationErrors) {
      // Check if there are validation errors
      const errors = [];

      for (const key in validationErrors.errors) {
        const error = validationErrors.errors[key];
        errors.push({
          param: key,
          message: error.message,
          code: "INVALID_INPUT",
        });
      }
      return res.status(400).json({ status: false, errors });
    }

    // Add the owner as the first member with the role "Community Admin"
    const roleUser = await Role.findOne({ name: "Community Admin" });
    const member = await Member.create({
      user_id: owner,
      community_id: community._id,
      role_id: roleUser._id,
    });
    const content = {
      data: {
        id: community._id,
        name: community.name,
        slug: community.slug,
        owner: community.owner._id,
        created_at: community.created_at,
        updated_at: community.updated_at,
      },
    };
    res.status(200).json({ status: true, content });
  } catch (error) {
    const errors = {
      param: "name",
      message: error.message,
      code: error.code,
    };
    res.status(400).json({ status: false, errors });
  }
};

const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find();
    // console.log(communities);
    const data = [];
    for (const keys of communities) {
      const ownerId = keys.owner;
      // console.log(ownerId);
      // const objectId = new mongoose.Types.ObjectId(ownerId);
      const ownerCom = await User.findOne({ _id: ownerId });

      data.push({
        id: keys._id,
        name: keys.name,
        slug: keys.slug,
        owner: {
          id: ownerCom._id,
          name: ownerCom.name,
        },
        created_at: keys.created_at,
        updated_at: keys.updated_at,
      });
    }
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    const total = await Community.countDocuments();
    const totalPages = Math.ceil(total / perPage);

    // Find roles for the requested page
    const roles = await Community.find({})
      .skip((page - 1) * perPage)
      .limit(perPage);

    const meta = {
      total,
      pages: totalPages,
      page,
    };
    const content = {
      meta,
      data,
    };
    res.status(200).json({ status: true, content });
  } catch (error) {
    res.status(400).json({
      status: false,
      errors: [
        {
          message: error.message,
          code: error.code,
        },
      ],
    });
  }
};

const getAllMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const members = await Member.find({ community_id: id });

    const data = [];
    for (const member of members) {
      const user = await User.findOne({ _id: member.user_id });
      const role = await Role.findOne({ _id: member.role_id });
      const item = {
        _id: member._id,
        community: id,
        user: {
          id: user._id,
          name: user.name,
        },
        role: {
          id: role._id,
          name: role.name,
        },
        created_at: member.created_at,
      };
      data.push(item);
    }
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    const total = members.length;
    const totalPages = Math.ceil(total / perPage);

    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    // Slice the 'members' array to get members for the requested page
    const membersForPage = members.slice(startIndex, endIndex);

    const meta = {
      total,
      pages: totalPages,
      page,
    };
    res.status(200).json({ status: true, content: { meta, data } });
  } catch (error) {
    res.status(400).json({
      status: false,
      errors: [
        {
          message: error.message,
          code: error.code,
        },
      ],
    });
  }
};

const getMyOwnedCommunity = async (req, res) => {
  try {
    const userId = req.user;
    const user = await User.findOne({ _id: userId });
    const communities = await Community.find({ owner: user._id });

    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    const total = communities.length;
    const totalPages = Math.ceil(total / perPage);

    // const startIndex = (page - 1) * perPage;
    // const endIndex = startIndex + perPage;
    // // Slice the 'members' array to get members for the requested page
    // const membersForPage = communities.slice(startIndex, endIndex);

    const meta = {
      total,
      pages: totalPages,
      page,
    };
    const data = [];
    for (const community of communities) {
      const item = {
        id: community._id,
        name: community.name,
        slug: community.slug,
        owner: community.owner,
        created_at: community.created_at,
        updated_at: community.updated_at,
      };
      data.push(item);
    }

    res.status(200).json({ status: true, content: { meta, data } });
  } catch (error) {
    res.status(400).json({
      status: false,
      errors: [
        {
          message: error.message,
          code: error.code,
        },
      ],
    });
  }
};

const getMyJoinedCommunity = async (req, res) => {
  try {
    const userId = req.user;
    const members = await Member.find({ user_id: userId });

    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    const total = members.length;
    const totalPages = Math.ceil(total / perPage);

    const meta = {
      total,
      pages: totalPages,
      page,
    };
    const data = [];
    for (const communityMember of members) {
      const joinedCommunity = await Community.findOne({
        _id: communityMember.community_id,
      });
      const user = await User.findOne({ _id: joinedCommunity.owner });
      const item = {
        id: joinedCommunity._id,
        name: joinedCommunity.name,
        slug: joinedCommunity.slug,
        owner: {
          id: user._id,
          name: user.name,
        },
        created_at: joinedCommunity.created_at,
        updated_at: joinedCommunity.updated_at,
      };
      data.push(item);
    }
    res.status(200).json({ status: true, content: { meta, data } });
  } catch (error) {
    res.status(400).json({
      status: false,
      errors: [
        {
          message: error.message,
          code: error.code,
        },
      ],
    });
  }
};
module.exports = {
  createCommunity,
  getCommunities,
  getAllMembers,
  getMyOwnedCommunity,
  getMyJoinedCommunity,
};
