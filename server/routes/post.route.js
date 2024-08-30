import express from "express";
import {
  addImages,
  commentOnPost,
  createPost,
  deletePost,
  dislikeUndislikePost,
  editPost,
  likeUnlikePost,
  replyOnComment,
  replyOnReply,
} from "../controllers/post.controllers.js";
import { authentication } from "../auth/auth.js";
const route = express.Router();
import multer from "multer";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });
route.post("/addImages", authentication, upload.array("images", 10), addImages);
route.post("/createPost", authentication, createPost);
route.post("/deletePost/:postId", authentication, deletePost);
route.post("/editPost/:postId", authentication, editPost);
route.post("/likeUnlikePost/:postId", authentication, likeUnlikePost);
route.post(
  "/dislikeUndislikePost/:postId",
  authentication,
  dislikeUndislikePost
);
route.post("/commentOnPost/:postId", authentication, commentOnPost);
route.post("/replyOnComment/:commentId", authentication, replyOnComment);
route.post("/replyOnReply/:replyId", authentication, replyOnReply);

export default route;
