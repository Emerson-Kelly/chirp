import express from "express";
import path from "node:path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

const app = express();

const prisma = new PrismaClient();


app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Express app listening on port ${PORT}!`));