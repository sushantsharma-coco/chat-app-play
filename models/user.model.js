const jsonwebtoken = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    blockedByUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.generateAccessToken = async function () {
  return await jsonwebtoken.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
    },
    "process.env.ACCESS_TOKEN_SECRET",
    {
      expiresIn: "1d",
    }
  );
};

module.exports = mongoose.model("User", userSchema);
