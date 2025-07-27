import express from 'express';
import { userSearchGet } from '../controllers/usersController';

const router = express.Router();

router.get("/search", userSearchGet);

export { router as userRouter };