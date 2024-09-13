import dotenv from "dotenv";
dotenv.config();
import express from "express";
const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.routes.js";
import postRoute from "./routes/post.route.js";
const port = process.env.PORT || 3000;
import mongoose from "mongoose";

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(() => {
    console.log("Failed to connect to MongoDB");
  });

//middlewares
app.use(cors({ credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/images", express.static("./upload/images/"));

app.use("/api/user", userRoute);
app.use("/api/post", postRoute);

app.get("/:name", (req, res) => {
  const name = req.params.name;
  res.send("Hell " + name);
});

app.listen(port, () => {
  console.log("listening on port " + port);
});
