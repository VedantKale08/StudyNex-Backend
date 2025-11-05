const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const { errorResponse, successResponse } = require("../helpers/apiResponse");
const {
  registerUser,
  loginUser,
  forgotPass,
  resetPass,
  getUserPoints,
} = require("../services/userService");

const register = asyncHandler(async (req, res) => {
  try {    
    const data = await registerUser(req, res);
    if (data) {
      successResponse({
        res,
        message: "User created successfully",
        data: data,
      });
    } else {
      errorResponse({ res, message: "Something went wrong!" });
    }
  } catch (error) {
    // errorResponse({ res, message: "Something went wrong!" });
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    const data = await loginUser(req, res);
    if (data) {
      successResponse({
        res,
        message: "User logged in successfully",
        data: data,
      });
    } else {
      errorResponse({ res, message: "Invalid credentials!" });
    }
  } catch (error) {
    errorResponse({ res, message: "Something went wrong!" });
  }
});

const getUser = asyncHandler(async (req, res) => {
  const users = await User.findOne({ _id: req.user._id }).select("-password");
  res.status(200).send(users);
});

const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const data = await forgotPass(req, res);
    if (data) {
      successResponse({
        res,
        message: "Please check your inbox and resend your password",
      });
    } else {
      errorResponse({ res, message: "User not found!" });
    }
  } catch (error) {
    errorResponse({ res, message: "Something went wrong!" });
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    const data = await resetPass(req, res);
    if (data) {
      successResponse({
        res,
        message: "Password has been changed successfully!",
      });
    } else {
      errorResponse({ res, message: "Link has been expired!" });
    }
  } catch (error) {
    errorResponse({ res, message: "Something went wrong!" });
  }
});

const getUserProgress = asyncHandler(async (req, res) => {
  try {
    const data = await getUserPoints(req, res);
    if (data) {
      successResponse({
        res,
        message: "User progress fetched successfully!",
        data: data,
      });
    } else {
      errorResponse({ res, message: "Cant't fetch user progress right now!" });
    }
  } catch (error) {
    errorResponse({ res, message: "Something went wrong!" });
  }
});

module.exports = {
  register,
  login,
  getUser,
  forgotPassword,
  resetPassword,
  getUserProgress,
};
