import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { userPost } from "../../controllers/postsController.js";

const prisma = new PrismaClient();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.post("/posts", upload.single("imageUrl"), (req, res, next) => {
  // Inject test user
  req.user = { id: global.testUserId };
  userPost(req, res, next);
});

beforeAll(async () => {
  const testUser = await prisma.user.create({
    data: {
      id: "123456789",
      username: "test-user",
      email: "test@example.com",
      password: "123test",
    },
  });
  global.testUserId = testUser.id;
});

afterAll(async () => {
  await prisma.post.deleteMany({ where: { userId: global.testUserId } });
  await prisma.user.delete({ where: { id: global.testUserId } });
  await prisma.$disconnect();
});

describe("POST /posts - Integration", () => {
  it("creates a post with valid data", async () => {
    const res = await request(app)
      .post("/posts")
      .field("caption", "Valid caption")
      .attach("imageUrl", Buffer.from([0xff, 0xd8, 0xff, 0xd9]), "image.jpg");

    expect(res.status).toBe(201);
    expect(res.body.post.caption).toBe("Valid caption");
    expect(res.body.post.userId).toBe(global.testUserId);
  });

  it("fails if no file is uploaded", async () => {
    const res = await request(app)
      .post("/posts")
      .field("caption", "My test caption");

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Image is required" }),
      ])
    );
  });

  it("fails if file type is invalid", async () => {
    const res = await request(app)
      .post("/posts")
      .field("caption", "Test caption")
      .attach("imageUrl", Buffer.from("not-an-image"), "fake.txt");

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Invalid file type. Only JPEG, PNG, and GIF images are allowed.",
        }),
      ])
    );
  });

  it("creates a post with valid data", async () => {
    const res = await request(app)
      .post("/posts")
      .field("caption", "Valid caption")
      .attach("imageUrl", Buffer.from([0xff, 0xd8, 0xff, 0xd9]), "image.jpg");

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("post");
    expect(res.body.post.caption).toBe("Valid caption");
  });
});
