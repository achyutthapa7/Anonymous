import { analyzeComment } from "../helpers/analyzetext.js";
import { anonymousModel } from "../models/anonymoususer.model.js";
import { commentModel } from "../models/comment.model.js";
import { postModel } from "../models/post.model.js";
import { postCategoryModel } from "../models/postCategory.model.js";
import { replyModel } from "../models/replies.model.js";
import { userModel } from "../models/user.model.js";
export const addImages = async (req, res) => {
  try {
    if (req.files) {
      const imageURL = req.files.map(
        (file) => `http://localhost:3000/images/${file.filename}`
      );
      if (!imageURL) {
        return res.status(201).json({ message: "post without images" });
      }
      res.status(200).json({ imageURL });
    } else {
      return res.status(404).json({ message: "no files added" });
    }
  } catch (error) {
    console.log("Error while adding images" + error.message);
    res.status(500).send("Error while adding images " + error.message);
  }
};

export const createPost = async (req, res) => {
  const { content, images, category } = req.body;
  try {
    if (!content)
      return res.status(400).json({ message: "post requires some content" });
    if (!category)
      return res
        .status(402)
        .json({ message: "post requires atleast one category" });
    const analyzedText = await analyzeComment(content);
    const {
      PROFANITY,
      INSULT,
      IDENTITY_ATTACK,
      THREAT,
      SEVERE_TOXICITY,
      TOXICITY,
    } = analyzedText.attributeScores;
    const threshold = 0.9;
    if (
      PROFANITY.summaryScore.value >= threshold ||
      INSULT.summaryScore.value >= threshold ||
      IDENTITY_ATTACK.summaryScore.value >= threshold ||
      THREAT.summaryScore.value >= threshold ||
      SEVERE_TOXICITY.summaryScore.value >= threshold ||
      TOXICITY.summaryScore.value >= threshold
    ) {
      return res.status(400).json({
        message: "post contains offensive words and cannot be posted.",
      });
    } else {
      const newPost = new postModel({
        user: req.rootUser._id,
        anonumousUser: req.rootUser._id,
        content: content.trim(),
        images,
        category,
      });

      await newPost.save();
      const updatedUser = await userModel.findOneAndUpdate(
        { _id: req.rootUser._id },
        {
          $push: { posts: newPost._id },
        },
        { new: true }
      );
      const updatedAnonymousUser = await anonymousModel.findOneAndUpdate(
        { _id: req.rootUser._id },
        {
          $push: { posts: newPost._id },
        },
        { new: true }
      );
      return res.status(200).json({
        message: "Post created successfully",
        newPost,
        updatedUser,
        updatedAnonymousUser,
      });
    }
  } catch (error) {
    console.log("Error while creating post " + error.message);
    return res.status(500).send("Error while creating post " + error.message);
  }
};

export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const deletedPost = await postModel.findOneAndDelete({ _id: postId });
    if (!deletedPost) {
      return res.status(404).json({ message: "post not found" });
    }
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: req.rootUser._id },
      { $pull: { posts: postId } },
      { new: true }
    );
    const updatedAnonymousUser = await anonymousModel.findOneAndUpdate(
      { _id: req.rootUser._id },
      { $pull: { posts: postId } },
      { new: true }
    );
    return res.status(200).json({
      message: "Post deleted successfully",
      deletedPost,
      updatedUser,
      updatedAnonymousUser,
    });
  } catch (error) {
    console.log("Error while deleting post " + error.message);
    return res.status(500).send("Error while deleting post " + error.message);
  }
};

export const editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!content)
      return res.status(400).json({ message: "post requires some content" });
    const updatedPost = await postModel.findOneAndUpdate(
      { _id: postId },
      { content: content.trim() },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(404).json({ message: "post not found" });
    }
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: req.rootUser._id },
      { new: true }
    );
    const updatedAnonymousUser = await anonymousModel.findOneAndUpdate(
      { _id: req.rootUser._id },
      { new: true }
    );
    return res.status(200).json({
      message: " successfully updated",
      updatedUser,
      updatedAnonymousUser,
    });
  } catch (error) {
    console.log("Error while editing post " + error.message);
    return res.status(500).send("Error while editing post " + error.message);
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUser =
      (await userModel.findOne({ _id: req.rootUser._id })) ||
      (await anonymousModel.findOne({ _id: req.rootUser._id }));
    const postToBeLikedOrUnliked = await postModel.findOne({ _id: postId });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!postToBeLikedOrUnliked) {
      return res.status(404).json({ message: "post not found" });
    }
    if (postToBeLikedOrUnliked.upvote.includes(currentUser._id)) {
      await postModel.findOneAndUpdate(
        { _id: postId },
        { $pull: { upvote: currentUser._id } }
      );
      return res.status(201).json({ message: "you undo upvote" });
    }
    if (postToBeLikedOrUnliked.downvote.includes(currentUser._id)) {
      await postModel.findOneAndUpdate(
        { _id: postId },
        { $pull: { downvote: currentUser._id } }
      );
      await postModel.findOneAndUpdate(
        { _id: postId },
        { $push: { upvote: currentUser._id } }
      );
      res.status(200).json({ message: "you upvote the post" });
      return;
    }
    await postModel.findOneAndUpdate(
      { _id: postId },
      { $push: { upvote: currentUser._id } }
    );
    res.status(200).json({ message: "you upvote the post" });
  } catch (error) {
    console.log("Error while liking/unliking post " + error.message);
    return res
      .status(500)
      .send("Error while liking/unliking post " + error.message);
  }
};
export const dislikeUndislikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUser =
      (await userModel.findOne({ _id: req.rootUser._id })) ||
      (await anonymousModel.findOne({ _id: req.rootUser._id }));
    const postToBeDislikedOrUndisliked = await postModel.findOne({
      _id: postId,
    });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!postToBeDislikedOrUndisliked) {
      return res.status(404).json({ message: "post not found" });
    }
    if (postToBeDislikedOrUndisliked.downvote.includes(currentUser._id)) {
      await postModel.findOneAndUpdate(
        { _id: postId },
        { $pull: { downvote: currentUser._id } }
      );
      return res.status(201).json({ message: "you undo downvote" });
    }
    if (postToBeDislikedOrUndisliked.upvote.includes(currentUser._id)) {
      await postModel.findOneAndUpdate(
        { _id: postId },
        { $pull: { upvote: currentUser._id } }
      );
      await postModel.findOneAndUpdate(
        { _id: postId },
        { $push: { downvote: currentUser._id } }
      );
      res.status(200).json({ message: "you downvote the post" });
      return;
    }
    await postModel.findOneAndUpdate(
      { _id: postId },
      { $push: { downvote: currentUser._id } }
    );
    res.status(200).json({ message: "you downvote the post" });
  } catch (error) {
    console.log("Error while disliking/undisliking post " + error.message);
    return res
      .status(500)
      .send("Error while disliking/undisliking post " + error.message);
  }
};
export const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const postToBeCommented = await postModel.findOne({ _id: postId });
    const currentUser =
      (await userModel.findOne({ _id: req.rootUser._id })) ||
      (await anonymousModel.findOne({ _id: req.rootUser._id }));

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "comment requires some content" });
    }
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });
    if (!postToBeCommented)
      return res.status(404).json({ message: "post not found" });

    const analyzedText = await analyzeComment(content);
    const {
      PROFANITY,
      INSULT,
      IDENTITY_ATTACK,
      THREAT,
      SEVERE_TOXICITY,
      TOXICITY,
    } = analyzedText.attributeScores;
    const threshold = 0.9;
    if (
      PROFANITY.summaryScore.value >= threshold ||
      INSULT.summaryScore.value >= threshold ||
      IDENTITY_ATTACK.summaryScore.value >= threshold ||
      THREAT.summaryScore.value >= threshold ||
      SEVERE_TOXICITY.summaryScore.value >= threshold ||
      TOXICITY.summaryScore.value >= threshold
    ) {
      return res.status(400).json({
        message: "Comment contains offensive words and cannot be posted.",
      });
    } else {
      const newComment = new commentModel({
        user:
          currentUser.userProfileStatus === "not anonymous"
            ? currentUser._id
            : null,
        anonymousUser:
          currentUser.userProfileStatus === "anonymous"
            ? currentUser._id
            : null,
        content: content.trim(),
      });
      const updatedPostAfterCommnet = await postModel.findOneAndUpdate(
        { _id: postId },
        { $push: { comments: newComment._id } },
        { new: true }
      );
      await newComment.save();
      res.status(200).json({
        message: "Comment updated successfully",
        updatedPostAfterCommnet,
        newComment,
      });
    }
  } catch (error) {
    console.log("Error while commenting on post " + error.message);
    return res
      .status(500)
      .send("Error while commenting on post " + error.message);
  }
};
export const replyOnComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res
        .status(400)
        .json({ message: "reply to a comment requires some content" });
    }
    const { commentId } = req.params;
    const commentToBeReplied = await commentModel.findOne({ _id: commentId });

    const currentUser =
      (await userModel.findOne({ _id: req.rootUser._id })) ||
      (await anonymousModel.findOne({ _id: req.rootUser._id }));
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });
    if (!commentToBeReplied)
      return res.status(404).json({ message: "Comment not found" });
    const analyzedText = await analyzeComment(content);
    const {
      PROFANITY,
      INSULT,
      IDENTITY_ATTACK,
      THREAT,
      SEVERE_TOXICITY,
      TOXICITY,
    } = analyzedText.attributeScores;
    const threshold = 0.9;
    if (
      PROFANITY.summaryScore.value >= threshold ||
      INSULT.summaryScore.value >= threshold ||
      IDENTITY_ATTACK.summaryScore.value >= threshold ||
      THREAT.summaryScore.value >= threshold ||
      SEVERE_TOXICITY.summaryScore.value >= threshold ||
      TOXICITY.summaryScore.value >= threshold
    ) {
      return res.status(400).json({
        message: "Comment contains offensive words and cannot be posted.",
      });
    } else {
      const newReply = new replyModel({
        user:
          currentUser.userProfileStatus === "not anonymous"
            ? currentUser._id
            : null,
        anonymousUser:
          currentUser.userProfileStatus === "anonymous"
            ? currentUser._id
            : null,
        content: content.trim(),
      });
      const updatedCommentAfterReply = await commentModel.findOneAndUpdate(
        { _id: commentId },
        { $push: { replies: newReply._id } },
        { new: true }
      );
      await newReply.save();
      res.status(200).json({
        message: "reply to a comment successfully",
        updatedCommentAfterReply,
        newReply,
      });
    }
  } catch (error) {
    console.log("Error while replying on commnent " + error.message);
    return res
      .status(500)
      .send("Error while replying on commnent " + error.message);
  }
};
export const replyOnReply = async (req, res) => {
  try {
    const { content } = req.body;
    const { replyId } = req.params;
    if (!content) {
      return res
        .status(400)
        .json({ message: "reply to a comment requires some content" });
    }
    const replyToBereplied = await replyModel.findOne({ _id: replyId });
    const currentUser =
      (await userModel.findOne({ _id: req.rootUser._id })) ||
      (await anonymousModel.findOne({ _id: req.rootUser._id }));
    if (!currentUser)
      return res.status(404).json({ message: "User not found" });
    if (!replyToBereplied)
      return res.status(404).json({ message: "Comment not found" });
    const analyzedText = await analyzeComment(content);
    const {
      PROFANITY,
      INSULT,
      IDENTITY_ATTACK,
      THREAT,
      SEVERE_TOXICITY,
      TOXICITY,
    } = analyzedText.attributeScores;
    const threshold = 0.9;
    if (
      PROFANITY.summaryScore.value >= threshold ||
      INSULT.summaryScore.value >= threshold ||
      IDENTITY_ATTACK.summaryScore.value >= threshold ||
      THREAT.summaryScore.value >= threshold ||
      SEVERE_TOXICITY.summaryScore.value >= threshold ||
      TOXICITY.summaryScore.value >= threshold
    ) {
      return res.status(400).json({
        message: "Comment contains offensive words and cannot be posted.",
      });
    } else {
      await replyModel.findOneAndUpdate(
        { _id: replyId },
        { $push: { replies: { content: content.trim() } } }
      );
      res.status(200).json({ message: "reply to a reply successfully" });
    }
  } catch (error) {
    console.log("Error while replying on reply " + error.message);
    return res
      .status(500)
      .send("Error while replying on reply " + error.message);
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const allPosts = await postModel.find();
    if (!allPosts) return res.status(404).json({ message: "there is no post" });
    res.status(200).json(allPosts);
  } catch (error) {
    console.log("Error while getting all posts " + error.message);
    return res
      .status(500)
      .send("Error while getting all posts " + error.message);
  }
};

export const getAllPostsByCategory = async (req, res) => {
  try {
    const currentUser =
      (await userModel.findOne({ _id: req.rootUser._id })) ||
      (await anonymousModel.findOne({ _id: req.rootUser._id }));

    // const allPostByCategory = await postModel.find({
    //   user: { $ne: currentUser._id },
    //   category: { $in: currentUser.preferedCategory },
    // });
    const allPostByCategory = await postModel.aggregate([
      {
        $match: {
          user: { $ne: currentUser._id },
          category: { $in: currentUser.preferedCategory },
        },
      },
    ]);
    if (!allPostByCategory)
      return res.status(404).json({ message: "there is no post" });
    res.status(200).json(allPostByCategory);
  } catch (error) {
    console.log("Error while getting all posts by category " + error.message);
    return res
      .status(500)
      .send("Error while getting all posts by category " + error.message);
  }
};

export const editComment = async (req, res) => {};
//edit comment and replies
//delete comment and replies
