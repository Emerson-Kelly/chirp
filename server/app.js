import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
//const prisma = new PrismaClient();

app.use(express.json()); // parse JSON bodies
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// Sample API route to test
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}!`));
