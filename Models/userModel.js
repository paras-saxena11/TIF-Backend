const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail, isStrongPassword } = require("validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [isEmail, "Invalid Email"],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Must be of 6 length"],
    validate: [isStrongPassword, "Please enter strong password"],
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
module.exports = User;
