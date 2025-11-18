import express from "express";
import {
  userPost,
  validatePosts,
  validateComment,
  validateUpdatePost,
  getAllPosts,
  getFollowingPosts,
  getTrendingPosts,
  createCommentForPost,
  getCommentsForPost,
  deleteCommentForPost,
  updateUserPost,
  deleteUserPost,
} from "../controllers/postsController.js";
import multer from "multer";
const router = express.Router();

// Kept in the server's RAM
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("imageUrl"), validatePosts, userPost);

router.get("/", getAllPosts);

router.get("/user", getFollowingPosts);

router.get("/trending", getTrendingPosts);

router.post("/:postId/comments", validateComment, createCommentForPost);

router.get("/:postId/comments", getCommentsForPost);

router.delete("/:postId/comments/:commentId", deleteCommentForPost);

router.put("/:postId", validateUpdatePost, updateUserPost);

router.delete("/:postId", deleteUserPost);

export { router as postRouter };
