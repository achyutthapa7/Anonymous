import mongoose from "mongoose";
const postCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: [true, "Category already in the database"],
  },
});
export const postCategoryModel = mongoose.model(
  "Post_Category",
  postCategorySchema
);
