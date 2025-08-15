import { validationResult, body } from "express-validator";
import passport from "passport";

// Validation middleware for login form
export const validateLogin = [
  body("username").trim().notEmpty().withMessage("Enter a valid username"),
  body("password").trim().notEmpty().withMessage("Password cannot be blank"),
];

// GET login page
export const loginGet = (req, res) => {
  return res.status(400).json("/auth/login", {
    title: "Login",
    errors: [],
  });
};

// POST login logic using Passport.js
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

    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json("/auth/login", {
          title: "Login",
          errors: [{ msg: "Invalid username or password" }],
        });
      }

      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.redirect("/");
      });
    })(req, res, next);
  },
];

// GET logout
export const logoutGet = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
};
