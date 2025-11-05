const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userModel = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      // unique: true,
    },
    mobile_number: {
      type: Number,
      required: true,
      // unique: true,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    quizPerformance: {
      currentPerformance: {
        type: Number,
        default: 0,
      },
      pastPerformances: {
        type: [Number],
        default: [0],
      },
    },
    token: {
      type: String,
    },
    org_joined: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userModel.pre("save", async function (next) {
  if (!this.quizPerformance.pastPerformances.includes(0)) {
    this.quizPerformance.pastPerformances.unshift(0);
  }
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userModel.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userModel);
module.exports = User;
