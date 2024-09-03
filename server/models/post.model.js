import mongoose from "mongoose";
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    anonymousUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Anonymous_User",
    },
    content: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      default: [],
    },
    upvote: {
      type: Array,
      default: [],
    },
    downvote: {
      type: Array,
      default: [],
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: [],
      },
    ],
    category: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);
export const postModel = mongoose.model("Post", postSchema);
