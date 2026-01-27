import dotenv from "dotenv";
import express from "express";
import passport from "./authentication/passport.js";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { userRouter } from "./routes/user.js";
import { loginRouter } from "./routes/login.js";
import { postRouter } from "./routes/posts.js";

dotenv.config();

const app = express();

let databaseUrl;

if (process.env.NODE_ENV === "test") {
  databaseUrl = process.env.TEST_DATABASE_URL;
} else if (process.env.NODE_ENV === "production") {
  databaseUrl = process.env.DATABASE_URL;
} else {
  // development (default)
  databaseUrl = process.env.DEV_DATABASE_URL;
}

if (!databaseUrl) {
  throw new Error("DATABASE URL is not defined for current environment");
}

console.log("Using database:", process.env.NODE_ENV);

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(passport.initialize());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", loginRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API listening on port ${PORT}`));

export default app;
