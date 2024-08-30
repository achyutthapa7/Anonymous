import mongoose from "mongoose";
const postCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
});
export const postCategoryModel = mongoose.model(
  "Post_Category",
  postCategorySchema
);
