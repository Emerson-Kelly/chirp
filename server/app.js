import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const databaseUrl = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DEV_DATABASE_URL;

  console.log(databaseUrl);

const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

app.use(express.json()); // parse JSON bodies
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Sample API route to test
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}!`));
