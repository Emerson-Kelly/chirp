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
import passport from "../authentication/passport.js";
import multer from "multer";
const router = express.Router();

// Kept in the server's RAM
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", passport.authenticate("jwt", { session: false }), upload.single("imageUrl"), validatePosts, userPost);

router.get("/", passport.authenticate("jwt", { session: false }), getAllPosts);

router.get("/user", passport.authenticate("jwt", { session: false }), getFollowingPosts);

router.get("/trending", passport.authenticate("jwt", { session: false }), getTrendingPosts);

router.post("/:postId/comments", passport.authenticate("jwt", { session: false }), validateComment, createCommentForPost);

router.get("/:postId/comments", passport.authenticate("jwt", { session: false }), getCommentsForPost);

router.delete("/:postId/comments/:commentId", passport.authenticate("jwt", { session: false }), deleteCommentForPost);

router.put("/:postId", passport.authenticate("jwt", { session: false }), validateUpdatePost, updateUserPost);

router.delete("/:postId", passport.authenticate("jwt", { session: false }), deleteUserPost);

export { router as postRouter };
