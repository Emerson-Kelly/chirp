import { check, body, query, validationResult } from "express-validator";
import { getSearchedUsers } from "../lib/dataService.js";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const validateUser = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required.")
    .custom(async (username) => {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        throw new Error("This username is already taken.");
      }
      return true;
    }),

  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Not a valid first name"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Not a valid last name"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Not a valid e-mail address.")
    .normalizeEmail()
    .custom(async (email) => {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        throw new Error("Email is already registered.");
      }
      return true;
    }),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage(
      "Password must be at least 8 characters and include uppercase, lowercase, and a number."
    ),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Please confirm your password.")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),

  check("profileImageUrl").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Profile image is required");
    }
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and GIF images are allowed."
      );
    }
    // Maximum 5MB file size
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      throw new Error("File size exceeds the limit (5MB).");
    }
    return true;
  }),

  body("bio")
    .trim()
    .isLength({ max: 150 })
    .withMessage("Bio cannot exceed 150 characters"),
];

export const signup_post = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        values: {
          email: req.body.email,
          username: req.body.username,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          bio: req.body.bio,
        },
      });
    }

    const { username, email, firstName, lastName, password, bio } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          firstName,
          lastName,
          password: hashedPassword,
          profileImageUrl: req.file?.path || "",
          bio: bio || "",
        },
      });

      res.redirect("/auth/login");
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
];

export const validateUserSearch = [
  query("q").trim().notEmpty().withMessage("Search query is required."),
];

export const userSearchGet = [
  validateUserSearch,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q } = req.query;

    try {
      const users = await getSearchedUsers(prisma, q);
      res.json(users);
    } catch (err) {
      console.error("Search failed:", err);
      res.status(500).json({ message: "Server error during user search." });
    }
  },
];
