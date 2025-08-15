import express from "express";
import { loginGet, loginPost, logoutGet } from "../controllers/loginController.js";

const router = express.Router();

router.get("/login", loginGet);

router.post("/login", loginPost);

router.get("/logout", logoutGet);

export { router as loginRouter };