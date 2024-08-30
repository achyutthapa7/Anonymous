import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        { message: "Email address is not valid" },
      ],
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
      match: [
        /^[a-zA-Z0-9]+$/,
        {
          message:
            "Username should contain only alphanumeric characters and should be between 3 and 20 characters long",
        },
      ],
    },
    password: {
      type: String,
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    profilePic: {
      type: "String",
      default: "https://via.placeholder.com/150",
    },
    token: {
      type: String,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    sub: {
      type: String,
      default: null,
    },
    userProfileStatus: {
      type: String,
      default: "not anonymous",
    },
  },
  { timestamps: true }
);

export const userModel = mongoose.model("User", userSchema);
