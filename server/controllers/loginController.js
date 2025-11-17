import { validationResult, body } from "express-validator";
import passport from "/authentication/passport.js";
import bcrypt from "bcryptjs";

export const validateLogin = [
  body("username").trim().notEmpty().withMessage("Enter a valid username"),
  body("password").trim().notEmpty().withMessage("Password cannot be blank"),
];

export const loginGet = (req, res) => {
  return res.status(200).json({
    route: "/auth/login",
    title: "Login",
    errors: [],
  });
};

export const loginPost = [
  validateLogin,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        values: {
          username: req.body.username,
          password: req.body.password,
        },
      });
    }

    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Passport auth error:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    })(req, res, next);
  },
];

export const logoutGet = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};
