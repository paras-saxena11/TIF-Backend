const Role = require("../Models/roleModel");

const createRole = async (req, res) => {
  const { name } = req.body;
  try {
    const role = new Role({ name });
    await role.save();
    const content = {
      data: {
        id: role._id,
        name: role.name,
        created_at: role.created_at,
        updated_at: role.updated_at,
      },
    };
    res.status(200).json({ status: true, content });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {
        param: "name",
        message: "Name should be at least 2 characters.",
        code: "INVALID_INPUT",
      };
      res.status(400).json({ status: false, errors });
    } else {
      const errors = [
        {
          param: "Server Error",
          message: error.message,
          code: error.code,
        },
      ];
      res.status(500).json({ status: false, errors });
    }
  }
};

const getRole = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    const total = await Role.countDocuments();
    const totalPages = Math.ceil(total / perPage);

    // Find roles for the requested page
    const roles = await Role.find({})
      .skip((page - 1) * perPage)
      .limit(perPage);

    const meta = {
      total,
      pages: totalPages,
      page,
    };
    const content = {
      meta,
      data: roles,
    };
    res.status(200).json({ status: true, content });
  } catch (error) {
    const errors = [
      {
        param: "Server Error",
        message: error.message,
        code: error.code,
      },
    ];
    res.status(400).json({ status: false, errors });
  }
};

module.exports = {
  createRole,
  getRole,
};
