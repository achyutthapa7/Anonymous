import express from "express";
const route = express.Router();
route.get("/registration", (req, res) => {
  console.log("hello");
});
export default route;
