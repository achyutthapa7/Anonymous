import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
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
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Replies",
    },
  ],
});
export const commentModel = mongoose.model("Comment", commentSchema);
