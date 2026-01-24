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
  likePost,
  unlikePost,
  getUserPostById,
  handleValidationErrors
} from "../controllers/postsController.js";
import passport from "../authentication/passport.js";
import { upload } from "../controllers/usersController.js";


const router = express.Router();

router.post("/", passport.authenticate("jwt", { session: false }), upload.single("imageUrl"), validatePosts, handleValidationErrors, userPost);

router.get("/explore", passport.authenticate("jwt", { session: false }), getAllPosts);

router.get("/", passport.authenticate("jwt", { session: false }), getFollowingPosts);

router.get("/trending", passport.authenticate("jwt", { session: false }), getTrendingPosts);

router.get("/:postId", passport.authenticate("jwt", { session: false }), getUserPostById);

router.post("/:postId/comments", passport.authenticate("jwt", { session: false }), validateComment, createCommentForPost);

router.get("/:postId/comments", passport.authenticate("jwt", { session: false }), getCommentsForPost);

router.delete("/:postId/comments/:commentId", passport.authenticate("jwt", { session: false }), deleteCommentForPost);

router.put("/:postId", passport.authenticate("jwt", { session: false }), validateUpdatePost, updateUserPost);

router.delete("/:postId", passport.authenticate("jwt", { session: false }), deleteUserPost);

router.post("/:postId/like", passport.authenticate("jwt", { session: false }), likePost);

router.delete("/:postId/like", passport.authenticate("jwt", { session: false }), unlikePost);

export { router as postRouter };
