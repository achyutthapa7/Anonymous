import mongoose from "mongoose";
const replySchema = new mongoose.Schema({
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
  replies: [{ type: String, default: [] }],
});
export const replyModel = mongoose.model("Replies", replySchema);
