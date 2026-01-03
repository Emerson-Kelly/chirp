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

const databaseUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DEV_DATABASE_URL
    : process.env.TEST_DATABASE_URL;

console.log(databaseUrl);

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

app.use(express.json()); // parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(passport.initialize());

// Sample API route to test
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", loginRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}!`));

export default app;
