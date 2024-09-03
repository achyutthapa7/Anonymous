import {
  uniqueUsernameGenerator,
  adjectives,
  nouns,
} from "unique-username-generator";
import { AvatarGenerator } from "random-avatar-generator";
import { anonymousModel } from "../models/anonymoususer.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { userModel } from "../models/user.model.js";
import cron from "node-cron";
const config = {
  dictionaries: [adjectives, nouns],
};

cron.schedule("*/5 * * * *", async (req, res) => {
  try {
    const result = await userModel.deleteMany({
      isVerified: false,
    });
    if (result.deletedCount > 0) {
      console.log(
        `Deleted ${result.deletedCount} unverified users with expired verification codes.`
      );
    }
  } catch (error) {
    console.error(`Error while deleting unverified users: ${error.message}`);
  }
});

export const anonymousLogin = async (req, res) => {
  const generator = new AvatarGenerator();

  const randomNumber = Math.floor(Math.random() * 899 + 100);
  try {
    const userName = uniqueUsernameGenerator(config) + randomNumber;
    const avatar = generator.generateRandomAvatar();
    if (!userName || !avatar) {
      return res
        .status(400)
        .send("Username or profile picture generation failed");
    }
    const newUser = new anonymousModel({
      userName,
      avatar,
    });
    const token = await jwt.sign(
      { _id: newUser._id },
      process.env.JWT_SECRET_KEY
    );
    res.cookie("jwtToken", token);
    newUser.token = token;
    await newUser.save();

    res
      .status(200)
      .send({ message: "user created successfully", newUser, token });
  } catch (error) {
    console.log("error while creating anonymous user" + error.message);
    res.status(500).send("error while creating anonymous user" + error.message);
  }
};

export const registration = async (req, res) => {
  try {
    const verificationCode = Math.floor(
      Math.random() * 89999 + 10000
    ).toString();
    const title = "verify your email";
    const heading = "verify your email";
    const paragraph =
      "Thank you for registering with us. Please use the verification code below to complete your registration:";
    const { email, userName, password, confirmPassword, preferedCategory } =
      req.body;
    if (email && userName && password && confirmPassword && preferedCategory) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userExistByEmail = await userModel.findOne({ email });
      const userExistByUserName = await userModel.findOne({ userName });
      if (userExistByEmail)
        return res.status(400).json({ error: "Email already exists" });
      if (userExistByUserName)
        return res.status(401).json({ error: "username must be unique" });
      if (password != confirmPassword)
        return res.status(402).json({ error: "password is incorrect" });
      const newUser = new userModel({
        email,
        userName,
        password: hashedPassword,
        verificationCode,
        preferedCategory,
      });
      await newUser.save();
      res.status(201).json({ message: "User saved successfully", newUser });
      // sendOtp(verificationCode, email, title, heading, paragraph);

      return;
    } else {
      return res.status(403).json({ error: "Please fill all the fields" }); // if any of the fields are missing or empty.  // Also, if the passwords don't match.  // Also, if the email is not valid.  // Also, if the username is not unique.  // Also, if the password is incorrect.  // Also, if the confirm password is incorrect.   // Also, if the email is already exists.  // Also, if the username is already exists.  // Also, if the password is incorrect.  // Also, if the confirm password is incorrect.  // Also, if the email is already exists.  // Also, if the username is already exists.  // Also, if the password is incorrect.  // Also, if the confirm password is incorrect.  // Also, if the email is already exists.  // Also, if the username is already exists.  // Also, if
    }
  } catch (error) {
    console.log("error while registration " + error.message);
    res.status(500).send("error while registration " + error.message);
  }
};

export const verification = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const user = await userModel.findOne({ verificationCode });
    if (!user)
      return res
        .status(401)
        .json({ error: "Verification code is incorrect or expired" });
    if (user.isVerified == true)
      return res.status(201).json({ message: "You are verified" });
    if (user) {
      await userModel.updateOne(
        { verificationCode },
        {
          $set: {
            isVerified: true,
          },
        },
        { new: true }
      );
      const updatedUser = await userModel.findOne({ verificationCode });
      return res
        .status(200)
        .json({ message: "Verification successful", user: updatedUser });
    } else {
      return res.status(401).json({ message: "Verification code is wrong" });
    }
  } catch (error) {
    console.log("error while verification " + error.message);
    res.status(500).send("error while verification " + error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await userModel.findOne({ email });
      // if (user.isVerified === false)
      //   return res.status(403).json({ message: "Please verify your email" });
      if (!user)
        return res.status(401).json({ error: "Invalid email or password" });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(401).json({ error: "Invalid email or password" });
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
      res.cookie("jwtToken", token, { expiresIn: "1h" });
      user.token = token;
      await user.save();
      res
        .status(200)
        .json({ message: "User logged in successfully", user, token });
      return;
    } else {
      return res.status(403).json({ error: "Please fill all fields" });
    }
  } catch (error) {
    console.log("error while login " + error.message);
    res.status(500).send("error while login " + error.message);
  }
};

export const loginWithGoogle = async (req, res) => {
  const { email, sub, picture } = req.body;
  try {
    let user = await userModel.findOne({ sub });
    if (!user) {
      const users = new userModel({
        email,
        isVerified: true,
        profilePic: picture,
        sub,
      });
      await users.save();
      res.status(200).json("success", users);
    }
  } catch (error) {}
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwtToken");
    res
      .status(201)
      .json({ message: "logout successfully", rootUser: req.rootUser });
  } catch (error) {
    console.log("error while logging out " + error.message);
    res.status(500).send("error while logging out " + error.message);
  }
};
