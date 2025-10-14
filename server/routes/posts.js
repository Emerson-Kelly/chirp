import express from "express";
import {
  userPost,
  validatePosts,
  getAllPosts,
} from "../controllers/postsController.js";
import multer from "multer";
const router = express.Router();

// Kept in the server's RAM
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", upload.single("imageUrl"), validatePosts, userPost);

router.get("/", getAllPosts);

export { router as postRouter };
