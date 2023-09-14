const bcrypt = require("bcrypt");
const User = require("../Models/userModel");
const generateToken = require("../Utils/generateToken");
require("dotenv").config();

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const errors = [
        {
          param: "email",
          message: "User with this email address already exists.",
          code: "RESOURCE_EXISTS",
        },
      ];
      return res.status(400).json({ status: false, errors });
    }
    // Create the new user
    const user = new User({
      name,
      email,
      password,
    });
    // Validate the user
    const validationErrors = user.validateSync();

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

    // Generate a JWT
    const userId = user._id;
    const token = generateToken(res, userId);
    // Save the user to the database
    await user.save();
    const content = {
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
      meta: {
        access_token: token,
      },
    };

    // Return the email and access token
    res.status(200).json({ status: true, content });
  } catch (error) {
    const errors = [
      {
        param: "Server Error",
        message: error?.message,
        code: error?.code,
      },
    ];
    res.status(400).json({ status: false, errors });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      const errors = [
        {
          param: "email",
          message: "Please provide a valid email address.",
          code: "INVALID_INPUT",
        },
      ];
      return res.status(400).json({ status: false, errors });
    }

    // Compare the passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      const errors = [
        {
          param: "password",
          message: "The credentials you provided are invalid.",
          code: "INVALID_CREDENTIALS",
        },
      ];
      return res.status(400).json({ status: false, errors });
    }

    // Generate a JWT
    const userId = user._id;
    const token = generateToken(res, userId);

    await user.save();
    const content = {
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
      meta: {
        access_token: token,
      },
    };
    res.status(200).json({ status: true, content });
  } catch (error) {
    const errors = [
      {
        param: "Server Error",
        message: error?.message,
        code: error?.code,
      },
    ];
    res.status(400).json({ status: false, errors });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.user;
    console.log(userId);
    const user = await User.findOne({ _id: userId });

    const content = {
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
      },
    };
    res.status(200).json({ status: true, content });
  } catch (error) {
    res.status(401).json({
      status: false,
      errors: [
        {
          message: "You need to sign in to proceed.",
          code: "NOT_SIGNEDIN",
        },
      ],
    });
  }
};

module.exports = {
  signup,
  signin,
  getUser,
};
