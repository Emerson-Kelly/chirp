import { prisma } from "../app.js";
import { check, body, validationResult } from "express-validator";
import supabase from "../lib/supabaseClient.js";
import {
  getExploreFeed,
  postNewUserPost,
  getFollowingFeed,
  getTheMostLikedPosts,
  getCommentsFromUsers,
  postCommentsFromUsers,
  deleteUserComment,
  updateUserPostById,
  deleteUserPostById,
  getPostById
} from "../lib/dataService.js";
import path from "node:path";
import multer from "multer";

export const upload = multer({ storage: multer.memoryStorage() });

// Validate user posts
export const validatePosts = [
  check("imageUrl").custom((value, { req }) => {
    if (!req.file) throw new Error("Image is required");

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and GIF images are allowed."
      );
    }

    const maxSize = 30 * 1024 * 1024;
    if (req.file.size > maxSize) {
      throw new Error("File size exceeds the limit (30MB).");
    }

    return true;
  }),

  body("caption")
    .trim()
    .notEmpty()
    .withMessage("caption is required.")
    .isLength({ max: 2200 })
    .withMessage("Caption cannot exceed 2,200 characters"),
];

// Validate user comments
export const validateComment = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ max: 500 })
    .withMessage("Comment cannot exceed 500 characters"),
  check("postId").isInt().withMessage("Invalid postId"),
];

// Validate updated user post
export const validateUpdatePost = [
  body("caption")
    .trim()
    .notEmpty()
    .withMessage("Caption is required")
    .isLength({ max: 2200 })
    .withMessage("Caption cannot exceed 2,200 characters"),
  check("postId").isInt().withMessage("Invalid postId"),
];

// Any logged-in user can create posts
export const userPost = async (req, res) => {
  const file = req.file;
  const caption = req.body.caption;
  const userId = req.user?.id;

  if (!file)
    return res.status(400).json({ errors: [{ msg: "Image is required" }] });

  try {
    const fileExt = path.extname(file.originalname);
    const fileName = `post-${userId}-${Date.now()}${fileExt}`;
    const filePath = `post-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return res.status(500).json({ message: "Failed to upload image" });
    }

    const { data } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    const newPost = await postNewUserPost(
      prisma,
      { caption, imageUrl: publicUrl, imagePath: filePath },
      userId
    );

    return res.status(201).json({ post: newPost });
  } catch (err) {
    console.error("Server error creating post:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// All logged-in users can view the explore feed
export const getAllPosts = async (req, res) => {
  try {
    const posts = await getExploreFeed();

    return res.status(200).json({ posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    return res.status(500).json({ message: "Failed to fetch posts" });
  }
};

// All logged-in users can view a post by id
export const getUserPostById = async (req, res) => {
    const userId = req.user?.id;
    const { postId } = req.params;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    try {
      const post = await getPostById(prisma, postId);
  
      return res.status(200).json({ post: post });
    } catch (err) {
      console.error("Error fetching post:", err);
      return res.status(500).json({ message: "Failed to fetch post" });
    }
  };

// All logged-in users can view their following feed
export const getFollowingPosts = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const posts = await getFollowingFeed(prisma, userId);
    res.status(200).json({ posts });
  } catch (err) {
    console.error("Feed fetch error:", err);
    res.status(500).json({ error: "Server error fetching feed" });
  }
};

// All logged-in users can view a trending feed
export const getTrendingPosts = async (req, res) => {
  try {
    const posts = await getTheMostLikedPosts();

    return res.status(200).json({ posts });
  } catch (err) {
    console.error("Error fetching posts:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch the most liked posts" });
  }
};

// Logged-in user can create comments on a post
export const createCommentForPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!text || !postId) {
      return res.status(400).json({ message: "Text and postId are required" });
    }

    const newComment = await postCommentsFromUsers({ text, postId }, userId);

    return res.status(201).json({ comment: newComment });
  } catch (err) {
    console.error("Error creating comment:", err);
    return res.status(500).json({ message: "Failed to create comment" });
  }
};

// Logged-in user can view comments on a post
export const getCommentsForPost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "postId is required" });
    }

    const comments = await getCommentsFromUsers(postId);
    return res.status(200).json({ comments });
  } catch (err) {
    console.error("Error fetching comments:", err);
    return res.status(500).json({ message: "Failed to load comments" });
  }
};

// Comment owner can delete their own comment
export const deleteCommentForPost = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!commentId) {
      return res.status(400).json({ message: "commentId is required" });
    }

    const deletedComment = await deleteUserComment(commentId, userId);
    return res.status(200).json(deletedComment);
  } catch (err) {
    console.error("Error deleting comment:", err);
    if (err.message === "Comment not found") {
      return res.status(404).json({ message: err.message });
    } else if (err.message === "Not authorized to delete this comment") {
      return res.status(403).json({ message: err.message });
    } else {
      return res.status(500).json({ message: "Failed to delete comment" });
    }
  }
};

// Only post owner can edit caption
export const updateUserPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption } = req.body;
    const userId = req.user?.id;

    const result = await updateUserPostById(postId, userId, caption);

    if (result === null)
      return res.status(404).json({ message: "Post not found" });
    if (result === false)
      return res
        .status(403)
        .json({ message: "Not authorized to update this post" });

    return res.status(200).json({ post: result });
  } catch (err) {
    console.error("Error updating post:", err);
    return res.status(500).json({ message: "Failed to update post" });
  }
};

// Only post owner can delete their post
export const deleteUserPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    if (post.imagePath) {
      const { error } = await supabase.storage
        .from("post-images")
        .remove([post.imagePath]);

      if (error) {
        console.error("Failed to delete image:", error);
      }
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    return res.status(500).json({ message: "Failed to delete post" });
  }
};

// Like a post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const like = await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    return res.status(201).json({ like });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ message: "Already liked" });
    }
    console.error(err);
    return res.status(500).json({ message: "Failed to like post" });
  }
};

// Unlike a post
export const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await prisma.like.deleteMany({
      where: {
        userId,
        postId,
      },
    });

    return res.status(200).json({ message: "Post unliked" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to unlike post" });
  }
};
