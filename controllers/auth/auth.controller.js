const { isValidObjectId } = require("mongoose");
const User = require("../../models/user.model");
const { ApiError } = require("../../utils/ApiError.utils");
const { ApiResponse } = require("../../utils/ApiResponse.utils");
const { catcher } = require("../../utils/catcher.utils");

const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV == "production",
};

const login = async (req, res) => {
  try {
    console.log(req.body);
    const { email, name } = req.body;

    if (!email || email == "" || !name || name == "")
      throw new ApiError(400, "email or name is empty");

    let user = await User.findOne({ email, name });

    if (!user) user = await User.create({ email, name });

    const acccessToken = await user.generateAccessToken();

    return res
      .cookie("acccessToken", acccessToken, options)
      .status(200)
      .send(
        new ApiResponse(
          200,
          { user, acccessToken },
          "user logged-in successfully"
        )
      );
  } catch (error) {
    catcher(error, res);
  }
};

const logout = async (req, res) => {
  try {
    if (!req.user?._id || !isValidObjectId(req.user?._id))
      throw new ApiError(401, "invalid user creds");

    return res
      .clearCookie("acccessToken", options)
      .status(200)
      .send(new ApiResponse(200, {}, "user logged out successfully"));
  } catch (error) {
    catcher(error, res);
  }
};

module.exports = {
  login,
  logout,
};
