import express from "express";
import { userPost, validatePosts } from "../controllers/postsController.js";

const router = express.Router();

router.post("/", validatePosts, userPost);

export { router as postRouter };