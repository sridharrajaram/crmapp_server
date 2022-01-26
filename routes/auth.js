const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const fs = require("fs");
const ejs = require("ejs");

const User = require("../models/User");
const verifyToken = require("../middlewares/ForgetPassword/verifyToken");

const {
  registerValidation,
  loginValidation,
  forgetPasswordValidation,
  resetPasswordValidation,
} = require("../validation");

const CLIENT_ID = process.env.MAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.MAIL_CLIENT_SECRET;
const REDIRECT_URL = process.env.MAIL_REDIRECT_URL;
const REFRESH_TOKEN = process.env.MAIL_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(receiverMail, data) {
  try {
    const ACCESS_TOKEN = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.MAIL_FROM,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: ACCESS_TOKEN,
      },
    });

    const mailOptions = {
      from: "CRM Application <mohitmdhule@gmail.com>",
      to: receiverMail,
      subject: "PASSWORD RESET LINK - CRM Application",
      html: data,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

router.post("/register", async (req, res) => {
  // Validate registration form data
  // delete confirm password cause validation schema does not have this field
  delete req.body.confirmPassword;
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  // Check for no duplicate email
  const userMatch = await User.findOne({ email: req.body.email });
  if (userMatch) {
    return res.status(400).json({ message: "Email address already used" });
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashPassword,
    role: req.body.role,
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json({ message: "Account has been created successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Email address already used" });
  }
});

router.post("/login", async (req, res) => {
  // Validate login form data
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const userMatch = await User.findOne({ email: req.body.email });
  if (userMatch) {
    // Validate the password using bcrypt
    const submittedPass = req.body.password;
    const savedPass = userMatch.password;

    // Compare hash and plain password
    const passwordDidMatch = await bcrypt.compare(submittedPass, savedPass);
    if (passwordDidMatch) {
      // Create and assign new token
      const token = jwt.sign(
        {
          _id: userMatch._id,
          name: `${userMatch.firstName} ${userMatch.lastName}`,
          email: userMatch.email,
          role: userMatch.role,
        },
        process.env.TOKEN_SECRET
      );
      res.header("auth-token", token).json({
        user: `${userMatch.firstName} ${userMatch.lastName}`,
        token: token,
      });
    } else {
      res.status(401).json({
        message: "invalid username or password",
      });
    }
  } else {
    // Cause a delay to avoid brute force attacks.
    let fakePass = `$2b$10$invalidusernameaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`;
    await bcrypt.compare(req.body.password, fakePass);

    res.status(401).json({ message: "Invalid username or password." });
  }
});

router.post("/forget-password", async (req, res) => {
  // Validate forget password form data
  const { error } = forgetPasswordValidation(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  try {
    const userMatch = await User.findOne({ email: req.body.email });
    if (userMatch) {
      // Create and assign new token with expiration time
      const token = jwt.sign(
        {
          _id: userMatch._id,
          name: `${userMatch.firstName} ${userMatch.lastName}`,
          email: userMatch.email,
          role: userMatch.role,
        },
        process.env.TOKEN_SECRET,
        { expiresIn: "5m" }
      );

      const link =
        process.env.SERVER_URL +
        `/api/user/reset-password/${userMatch._id}/${token}`;

      const data = await ejs.renderFile(
        path.join(__dirname, "..", "views", "mail-template.ejs"),
        {
          link: link,
        }
      );

      await sendMail(userMatch.email, data);
      res.send(
        "Password reset link has been sent to your email. Please check your mailbox."
      );
    } else {
      res.status(401).json({
        message: "This email is not registered",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(401).json({
      message: "This email is not registered",
    });
  }
});

router.get("/reset-password/:id/:token", verifyToken, (req, res) => {
  res.render(path.join(__dirname, "..", "views", "reset-password.ejs"));
});

router.post("/reset-password/:id/:token", verifyToken, async (req, res) => {
  const { error } = resetPasswordValidation(req.body);
  if (error) {
    return res
      .status(400)
      .send(error.details[0].message + ". Please Try again");
  }

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    await User.findOneAndUpdate(
      { _id: req.user._id },
      { password: hashPassword }
    );
    res.send(
      "Your password has been changed successfully. Please login with your new password."
    );
  } catch (err) {
    res.status(500).send("Something went wrong. Please try again");
  }
});

module.exports = router;
