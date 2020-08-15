const mongoose = require("mongoose");
const passportlocalmongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

//NEEDED TO USE SETPASSWORD METHOD OF MONGOOSE WHEN WE ARE RESETTING THE PASSWORD AFTER FORGETTING
userSchema.plugin(passportlocalmongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
