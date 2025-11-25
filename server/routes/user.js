import express from 'express';
import { userSearchGet, viewUserProfileGet, updateProfilePost } from '../controllers/usersController.js';
import passport from "../authentication/passport.js";

const router = express.Router();

router.get("/search", userSearchGet);

router.get('/:id/profile', passport.authenticate("jwt", { session: false }), viewUserProfileGet);

router.post('/:id/profile', passport.authenticate("jwt", { session: false }), updateProfilePost);

export { router as userRouter };