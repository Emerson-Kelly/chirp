import express from 'express';
import { userSearchGet, viewUserProfileGet, updateProfilePost, signup_post, validateUser, upload, getMe } from '../controllers/usersController.js';
import passport from "../authentication/passport.js";

const router = express.Router();

router.post("/register", upload.single("profile-images"), validateUser, signup_post);

router.get("/search", userSearchGet);

router.get('/:id/profile', passport.authenticate("jwt", { session: false }), viewUserProfileGet);

router.post('/:id/profile', passport.authenticate("jwt", { session: false }), updateProfilePost);

router.get("/me", passport.authenticate("jwt", { session: false }), getMe);

export { router as userRouter };