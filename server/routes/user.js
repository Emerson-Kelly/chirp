import express from 'express';
import { userSearchGet, viewUserProfileGet, updateProfilePost, signup_post, validateUser, upload, getMe, getFollowersGet, getFollowingGet, followUserPost, unfollowUserDelete, getMostRecentUsers, getMostFollowedUsers } from '../controllers/usersController.js';
import passport from "../authentication/passport.js";

const router = express.Router();

router.post("/register", upload.single("profile-images"), validateUser, signup_post);

router.get("/search", userSearchGet);

router.get('/:id/profile', passport.authenticate("jwt", { session: false }), viewUserProfileGet);

router.post('/:id/profile', passport.authenticate("jwt", { session: false }), updateProfilePost);

router.get("/:id/followers", passport.authenticate("jwt", { session: false }), getFollowersGet);
  
router.get("/:id/following", passport.authenticate("jwt", { session: false }), getFollowingGet);

router.get("/recent", passport.authenticate("jwt", { session: false }), getMostRecentUsers);

router.get("/most-followed", passport.authenticate("jwt", { session: false }), getMostFollowedUsers);

router.post("/:id/follow", passport.authenticate("jwt", { session: false }), followUserPost);

router.delete("/:id/follow", passport.authenticate("jwt", { session: false }), unfollowUserDelete);

router.get("/me", passport.authenticate("jwt", { session: false }), getMe);

export { router as userRouter };