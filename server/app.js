import express from "express";
import passport from "passport";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import { userRouter } from "./routes/user.js";
import { fakeAuth } from './authentication/fakeAuth.js';
import { loginRouter } from "./routes/login.js";
import { postRouter } from "./routes/posts.js";


dotenv.config();

const app = express();

const databaseUrl = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DEV_DATABASE_URL;

  console.log(databaseUrl);

export const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });



app.use(express.json()); // parse JSON bodies
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));


app.use(passport.initialize());

// Sample API route to test
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Fake Auth for Unit Tests
app.use(fakeAuth);

app.use("/api/users", userRouter);
app.use("/api/auth", loginRouter);
app.use("/api/posts", postRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}!`));

export default app;