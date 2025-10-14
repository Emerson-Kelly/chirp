import { jest } from "@jest/globals";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import app from "../../app.js";

const prisma = new PrismaClient();

describe("POST /api/posts - Integration", () => {
  let testUser;

  beforeAll(async () => {
    // Clean slate
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // Create a new user with a unique ID each time
    testUser = await prisma.user.create({
      data: {
        username: "test-user",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        password: "hashedpassword",
      },
    });
  });

  afterAll(async () => {
    // Cleanup database after tests
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("creates a post with valid data", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("x-user-id", testUser.id) // Auth header for fakeAuth
      .field("caption", "Valid caption")
      .attach("imageUrl", Buffer.from([0xff, 0xd8, 0xff, 0xd9]), "image.jpg");

    // Log to debug if needed
    if (res.status !== 201) console.log(res.body);

    expect(res.status).toBe(201);
    expect(res.body.post.caption).toBe("Valid caption");
    expect(res.body.post.userId).toBe(testUser.id);
  });

  it("fails if no file is uploaded", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("x-user-id", testUser.id)
      .field("caption", "My test caption");

    if (res.status !== 400) console.log(res.body);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ msg: "Image is required" }),
      ])
    );
  });

  it("fails if file type is invalid", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("x-user-id", testUser.id)
      .field("caption", "Test caption")
      .attach("imageUrl", Buffer.from("not-an-image"), "fake.txt");

    if (res.status !== 400) console.log(res.body);

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: "Invalid file type. Only JPEG, PNG, and GIF images are allowed.",
        }),
      ])
    );
  });
});



describe("GET /posts (Explore Feed)", () => {
    let testUser;
  
    beforeAll(async () => {
      // Reset DB before test run
      await prisma.post.deleteMany();
      await prisma.user.deleteMany();
  
      // Create a user
      testUser = await prisma.user.create({
        data: {
          username: "exploreTester",
          firstName: "explore",
          lastName: "tester",
          email: "explore@test.com",
          password: "hashedpassword", // hashed in real app
        },
      });
  
      // Create posts
      await prisma.post.createMany({
        data: [
          {
            caption: "First explore post",
            imageUrl: "http://localhost/test1.png",
            userId: testUser.id,
          },
          {
            caption: "Second explore post",
            imageUrl: "http://localhost/test2.png",
            userId: testUser.id,
          },
        ],
      });
    });
  
  
    it("should return all posts in the explore feed", async () => {
        const res = await request(app)
        .get("/api/posts")
        .set("x-user-id", testUser.id);

      expect(res.statusCode).toBe(200);
      expect(res.body.posts).toBeDefined();
      expect(Array.isArray(res.body.posts)).toBe(true);
  
      // Ensure posts come back
      expect(res.body.posts.length).toBeGreaterThanOrEqual(2);
  
      // Check structure of a post
      const post = res.body.posts[0];
      expect(post).toHaveProperty("caption");
      expect(post).toHaveProperty("imageUrl");
      expect(post).toHaveProperty("user");
      expect(post.user).toHaveProperty("username", "exploreTester");
    });
  });

