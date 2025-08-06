import express from 'express';
import { userSearchGet, viewUserProfileGet, updateProfilePost } from '../controllers/usersController.js';
import { fakeAuth } from '../authentication/fakeAuth.js';

const router = express.Router();


router.get("/search", userSearchGet);

router.get('/:id/profile', viewUserProfileGet);

router.post('/:id/profile', fakeAuth, updateProfilePost);

export { router as userRouter };