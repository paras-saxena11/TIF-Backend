const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

const authMiddleware = async (req, res, next) => {
  const fetchedToken = req.header("Authorization");
  if (!fetchedToken) {
    return res.status(401).json({
      status: false,
      errors: [
        {
          message: "You need to sign in to proceed.",
          code: "NOT_SIGNEDIN",
        },
      ],
    });
  }
  const token = fetchedToken.match(/"([^"]+)"/)[1];

  if (token) {
    try {
      const { userId } = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findOne({ _id: userId }).select("_id");
      req.token = token;
      // console.log(token);
      next();
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
  } else {
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

module.exports = authMiddleware;
