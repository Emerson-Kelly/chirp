import express from 'express';
import { userSearchGet, viewUserProfileGet, updateProfilePost, signup_post, validateUser, upload, getMe, getFollowersGet, getFollowingGet, followUserPost, unfollowUserDelete, getMostRecentUsers, getMostFollowedUsers } from '../controllers/usersController.js';
import passport from "../authentication/passport.js";

const router = express.Router();

router.get("/me", passport.authenticate("jwt", { session: false }), getMe);

router.get("/recent", passport.authenticate("jwt", { session: false }), getMostRecentUsers);

router.get("/most-followed", passport.authenticate("jwt", { session: false }), getMostFollowedUsers);

router.post("/register", upload.single("profile-images"), validateUser, signup_post);

router.get("/search", userSearchGet);

router.get('/:username', passport.authenticate("jwt", { session: false }), viewUserProfileGet);

router.post('/:username', passport.authenticate("jwt", { session: false }), updateProfilePost);

router.get("/:username/followers", passport.authenticate("jwt", { session: false }), getFollowersGet);
  
router.get("/:username/following", passport.authenticate("jwt", { session: false }), getFollowingGet);

router.post("/:username/follow", passport.authenticate("jwt", { session: false }), followUserPost);

router.delete("/:username/follow", passport.authenticate("jwt", { session: false }), unfollowUserDelete);

export { router as userRouter };