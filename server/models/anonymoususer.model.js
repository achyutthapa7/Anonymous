import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    avatar: {
      type: "String",
      default: "https://via.placeholder.com/150",
    },
    token: {
      type: String,
    },
    userProfileStatus: {
      type: String,
      default: "anonymous",
    },
    preferedCategory: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);
export const anonymousModel = new mongoose.model("Anonymous_User", schema);
