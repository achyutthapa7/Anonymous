import express from "express";
import {
  anonymousLogin,
  login,
  logout,
  registration,
  verification,
} from "../controllers/user.controllers.js";
import { authentication } from "../auth/auth.js";
const route = express.Router();
route.post("/registration", registration);
route.post("/verification", verification);
route.post("/anonymousLogin", anonymousLogin);
route.post("/login", login);
route.post("/logout", authentication, logout);
export default route;
