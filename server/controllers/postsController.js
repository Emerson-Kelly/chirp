import { check, body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";
import supabase from "../lib/supbaseClient.js";
import {
  getExploreFeed,
  postNewUserPost,
  getFollowingFeed,
  getTheMostLikedPosts,
  getCommentsFromUsers,
  postCommentsFromUsers,
} from "../lib/dataService.js";
import path from "node:path";

const prisma = new PrismaClient();

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

// Any logged-in user can create posts
export const userPost = async (req, res) => {
  const file = req.file;
  const caption = req.body.caption;
  const userId = req.user?.id;

  if (!file)
    return res.status(400).json({ errors: [{ msg: "Image is required" }] });
  if (!caption)
    return res.status(400).json({ errors: [{ msg: "Caption is required" }] });

  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({
      errors: [
        {
          msg: "Invalid file type. Only JPEG, PNG, and GIF images are allowed.",
        },
      ],
    });
  }

  try {
    const fileExt = path.extname(file.originalname);
    const fileName = `post-${userId}-${Date.now()}${fileExt}`;
    const filePath = `post-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const publicUrl = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath).data.publicUrl;

    const newPost = await postNewUserPost(
      prisma,
      { caption, imageUrl: publicUrl },
      userId
    );

    return res.status(201).json({ post: newPost });
  } catch (err) {
    console.error(err);
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

// Only comment owner or admin can delete

// Only post owner can edit caption

// Only post owner can delete their post
