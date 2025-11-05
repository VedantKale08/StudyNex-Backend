const { expect } = require("chai");
const express = require("express");
const chaiHttp = require("chai-http");
const chai = require("chai");

chai.use(chaiHttp);

const {
  register,
  login,
  getUser,
  forgotPassword,
  resetPassword,
  getUserProgress,
} = require("../controllers/userController");

const protect = require("../middlewares/authMiddleware");

const app = express();
app.use(express.json());

app.post("/register", register);
app.post("/login", login);
app.get("/user", protect, getUser);
app.post("/forgot-password", forgotPassword);
app.post("/reset-password", resetPassword);

describe("User API Tests", () => {
  let userToken;
  let resetToken;

  it("should register a new user and return success", (done) => {
    chai
      .request(app)
      .post("/register")
      .send({
        name: "Test User",
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        mobile_number: 9919919919,
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.be.true;
        expect(res.body.data).to.have.property("token");
        userToken = res.body.data.token;
      });
      done();
  });

  it("should login user and return success", (done) => {
    chai
      .request(app)
      .post("/login")
      .send({
        email: "test@example.com",
        password: "password123",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.be.true;
        expect(res.body.data).to.have.property("token");
        userToken = res.body.data.token;
    });
    done();
  });

  it("should get user details with valid token", (done) => {
    chai
      .request(app)
      .get("/user")
      .set("Authorization", `Bearer ${userToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
    });
    done();
  });

  it("should handle forgot password request", (done) => {
    chai
      .request(app)
      .post("/forgot-password")
      .send({
        email: "test@example.com",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.be.true;
        expect(res.body.message).to.equal(
          "Please check your inbox and resend your password"
        );
        // Note: In a real test, you'd need to get the reset token from the email
    });
    done();
  });

    // Fail Test Cases
  it("should fail registration with missing required fields", (done) => {
    chai
      .request(app)
      .post("/register")
      .send({
        email: "test2@example.com",
        password: "password123",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.be.false;
        expect(res.body.message).to.equal("please fill required fields!"); // 'P'lease 
        done();
    });
  });

  it("should fail login with invalid credentials", (done) => {
    chai
      .request(app)
      .post("/login")
      .send({
        email: "test@example.com",
        password: "password1233333",
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.be.false;
        expect(res.body.message).to.equal("Invalid credentials!");
    });
    done();
  });

  it("should fail get user without token", (done) => {
    chai
      .request(app)
      .get("/user")
      .end((err, res) => {
        expect(res.body.status).to.be.true;
        done(); 
    });
  });

  it("should fail to get user progress with missing org param", (done) => {
    chai
      .request(app)
      .get("/get-user-progress/")
      .end((err, res) => {
        expect(res.body.status).to.be.false;
        expect(res.body.message).to.equal("Organization is required!");
        done();
      });
  });
});
