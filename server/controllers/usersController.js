import { prisma } from "../app.js";
import multer from "multer";
import { check, body, query, validationResult } from "express-validator";
import {
  getSearchedUsers,
  getProfileInfo,
  postEditProfileInfo,
  getFollowers,
  getFollowing,
  isUserFollowing,
  getThreeMostRecentUsers,
  getThreeMostFollowedUsers,
} from "../lib/dataService.js";
import bcrypt from "bcryptjs";
import supabase from "../lib/supabaseClient.js";
import path from "node:path";

export const upload = multer({ storage: multer.memoryStorage() });

export const validateUser = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .custom(async (username) => {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        throw new Error("This username is already taken");
      }
      return true;
    }),

  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Not a valid first name"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Not a valid last name"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Not a valid e-mail address")
    .normalizeEmail()
    .custom(async (email) => {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        throw new Error("Email is already registered");
      }
      return true;
    }),

  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    .withMessage(
      "Password must be at least 8 characters and include uppercase, lowercase, and a number"
    ),

  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
  check("profile-images").custom((value, { req }) => {
    if (!req.file) return true; // image optional

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new Error(
        "Invalid file type. Only JPEG, PNG, and GIF images are allowed"
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      throw new Error("File size exceeds the limit (5MB)");
    }

    return true;
  }),
  body("bio")
    .trim()
    .isLength({ max: 150 })
    .withMessage("Bio cannot exceed 150 characters"),
];

export const validateProfileUpdate = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username too short"),
  body("firstName")
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Invalid first name"),
  body("lastName")
    .optional()
    .trim()
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage("Invalid last name"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Bio must be ≤ 150 chars"),
  body("profileImageUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Invalid image URL"),
];

export const signup_post = [
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, firstName, lastName, password, bio } = req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 12);

      // Handle file upload to Supabase
      let profileImageUrl = "";
      if (req.file) {
        const fileExt = path.extname(req.file.originalname);
        const fileName = `profile-${Date.now()}${fileExt}`;
        const filePath = `profile-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
          return res.status(500).json({ error: "Image upload failed." });
        }

        // Get public URL
        const { data } = supabase.storage
          .from("profile-images")
          .getPublicUrl(filePath);
        profileImageUrl = data.publicUrl;
      }

      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          firstName,
          lastName,
          password: hashedPassword,
          bio: bio || "",
          profileImageUrl,
        },
      });

      return res.status(201).json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          bio: newUser.bio,
          profileImageUrl: newUser.profileImageUrl,
        },
      });
    } catch (err) {
      console.error("Signup error:", err);
      return res.status(500).json({ error: "Server error." });
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
      res.json({ users });
    } catch (err) {
      console.error("Search failed:", err);
      res.status(500).json({ message: "Server error during user search" });
    }
  },
];

export const viewUserProfileGet = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = user.id;

    const profile = await getProfileInfo(prisma, username);

    const isOwner = currentUserId === userId;

    const followRecord = currentUserId
      ? await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: userId,
            },
          },
        })
      : null;

    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    return res.json({
      profile: {
        ...profile,
        isOwner,
      },
      posts,
      isFollowing: Boolean(followRecord),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const followUserPost = async (req, res) => {
  const { username } = req.params;
  const followerId = req.user.id;

  try {
    const userToFollow = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    const followingId = userToFollow.id;

    if (followerId === followingId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    let isFollowing;

    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
      isFollowing = false;
    } else {
      await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
      isFollowing = true;
    }

    const followersCount = await prisma.follow.count({
      where: { followingId },
    });

    return res.json({ isFollowing, followersCount });
  } catch (err) {
    console.error("Follow toggle error:", err);
    return res.status(500).json({ error: "Failed to toggle follow" });
  }
};

export const unfollowUserDelete = async (req, res) => {
  const { username } = req.params;
  const followerId = req.user.id;

  const userToUnfollow = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!userToUnfollow) {
    return res.status(404).json({ error: "User not found" });
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId: userToUnfollow.id,
      },
    },
  });

  res.json({ success: true });
};

export const updateProfilePost = [
  upload.single("profile-images"),
  validateProfileUpdate,
  async (req, res) => {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user || user.id !== currentUserId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const userId = user.id;

    try {
      if (req.file) {
        const fileExt = path.extname(req.file.originalname);
        const fileName = `profile-${userId}-${Date.now()}${fileExt}`;
        const filePath = `profile-images/${fileName}`;

        await supabase.storage
          .from("profile-images")
          .upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-images").getPublicUrl(filePath);

        req.body.profileImageUrl = publicUrl;
      }

      const updated = await postEditProfileInfo(prisma, userId, req.body);
      return res.json({ profile: updated });
    } catch (err) {
      if (err?.code === "P2002") {
        return res.status(409).json({ error: "Username already in use." });
      }
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
  },
];

export const getFollowersGet = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const followers = await getFollowers(prisma, user.id);
    res.json(followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
};

export const getFollowingGet = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const following = await getFollowing(prisma, user.id);
    res.json(following);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch following" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        profileImageUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("GET /me error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// All logged-in users can view the 3 most recent users
export const getMostRecentUsers = async (req, res) => {
  try {
    const users = await getThreeMostRecentUsers();

    return res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching the 3 most recent users:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch the 3 most recent users" });
  }
};

// All logged-in users can view the 3 most followed users
export const getMostFollowedUsers = async (req, res) => {
  try {
    const users = await getThreeMostFollowedUsers();

    return res.status(200).json({ users });
  } catch (err) {
    console.error("Error fetching the 3 most followed users:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch the 3 most followed users" });
  }
};
