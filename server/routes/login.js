import express from "express";
import {
  loginGet,
  loginPost,
  logoutGet,
  validateLogin
} from "../controllers/loginController.js";

const router = express.Router();

router.get("/login", loginGet);

router.post("/login", validateLogin, loginPost);

router.get("/logout", logoutGet);

export { router as loginRouter };
