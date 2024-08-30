import jwt from "jsonwebtoken";
import { userModel } from "../models/user.model.js";
import { anonymousModel } from "../models/anonymoususer.model.js";

export async function authentication(req, res, next) {
  try {
    const token = req.cookies.jwtToken;
    if (!token) return res.status(404).json({ message: "Login First" });
    const isVerify = await jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!isVerify) return res.status(404).json({ message: "Login First" });
    const [user, anonymousUser] = await Promise.all([
      userModel.findOne({ _id: isVerify._id }),
      anonymousModel.findOne({ _id: isVerify._id }),
    ]);
    const rootUser = user || anonymousUser;
    req.rootUser = rootUser;
    next();
  } catch (err) {
    console.log(`Error while authentication: ${err.message}`);
  }
}
