const User = require("../models/userModel");
const { errorResponse } = require("../helpers/apiResponse");
const generateToken = require("../config/generateToken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");

const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, mobile_number, image, points } =
      req.body;

    if (!name || !username || !password || !mobile_number) {
      errorResponse({ res, message: "Please fill required fields!" });
      return;
    }
    // const emailExists = await User.findOne({ email });
    // const usernameExists = await User.findOne({ username });
    // const mobileExists = await User.findOne({ mobile_number });

    // if (emailExists) {
    //   errorResponse({ res, message: "Email already exists!" });
    // }
    // if (usernameExists) {
    //   errorResponse({ res, message: "Username already exists!" });
    // }
    // if (mobileExists) {
    //   errorResponse({ res, message: "Mobile number already exists!" });
    // }

    const user = await User.create({
      name,
      username,
      email,
      password,
      mobile_number,
      image,
      points,
    });

    if (user) {
      const data = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        username: user.username,
        image: user.image,
        points: user.points,
        org_joined: user.org_joined,
        token: generateToken(user._id),
      };
      return data;
    }
    return null;
  } catch (error) {
    console.log(error);
    errorResponse({ res, message: "Something went wrong!" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.findOne({ username: email });
    }
    if (user && (await user.matchPassword(password))) {
      const data = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile_number: user.mobile_number,
        username: user.username,
        image: user.image,
        points: user.points,
        org_joined: user.org_joined,
        token: generateToken(user._id),
      };
      return data;
    }
    return null;
  } catch (error) {
    console.log(error);
    errorResponse({ res, message: "Something went wrong!" });
  }
};

const sendPasswordMail = (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "For Reset Password",
      html: `<p>Hi ${name}, Please copy the link <a href="${
        process.env.APP_ENV === "production"
          ? "https://study-nex.vercel.app"
          : "http://localhost:3000"
      }/reset-password/${token}">and reset your password.</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Mail has been sent : ", info.response);
      }
    });
  } catch (error) {}
};

const forgotPass = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      errorResponse({ res, message: "Email is required!" });
    }
    const user = await User.findOne({ email });
    if (user) {
      const token = randomstring.generate();
      await User.updateOne(
        { email: email },
        { $set: { token: token } },
        { new: true }
      );
      const user = await User.findOne({ email });
      sendPasswordMail(user.name, user.email, token);
    }
    return user;
  } catch (error) {
    console.log(error);
    errorResponse({ res, message: "Something went wrong!" });
  }
};

const resetPass = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!password) {
      errorResponse({ res, message: "Password is required!" });
    }
    const tokenData = await User.findOne({ token });
    if (tokenData) {
      const salt = await bcrypt.genSalt(10);
      let newPass = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(
        { _id: tokenData._id },
        { $set: { password: newPass, token: "" } },
        { new: true }
      );
    }
    return tokenData;
  } catch (error) {
    console.log(error);
    errorResponse({ res, message: "Something went wrong!" });
  }
};

const getUserPoints = async (req, res) => {
  try {
    const { org } = req.params;
    if (!org)
      return errorResponse({ res, message: "Organization is required!" });
    const data = await User.find(
      {
        org_joined: org,
        $and: [
          { "quizPerformance.currentPerformance": { $ne: null } },
          { "quizPerformance.currentPerformance": { $ne: 0 } },
        ],
      },
      "username quizPerformance"
    )
      .sort({ "quizPerformance.currentPerformance": -1 })
      .then((users) => {
        return users;
      })
      .catch((err) => {
        console.log("Error fetching documents", err);
      });

    const rankUsers = data.map((user, index) => ({
      id: index + 1,
      username: user.username,
      currentPoints: user.quizPerformance.currentPerformance,
      pastPoints: user.quizPerformance.pastPerformances,
      // ...user._doc,
    }));
    return rankUsers;
  } catch (error) {
    console.log(error);
    errorResponse({ res, message: "Something went wrong!" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPass,
  resetPass,
  getUserPoints,
};
