import { jest } from "@jest/globals";
import request from "supertest";
import { PrismaClient } from "@prisma/client";
import app from "../../app.js";

const prisma = new PrismaClient();

describe("POST /api/posts - Integration", () => {
  let testUser;

  beforeAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

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
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("creates a post with valid data", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("x-user-id", testUser.id)
      .field("caption", "Valid caption")
      .attach("imageUrl", Buffer.from([0xff, 0xd8, 0xff, 0xd9]), "image.jpg");

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
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    testUser = await prisma.user.create({
      data: {
        username: "exploreTester",
        firstName: "explore",
        lastName: "tester",
        email: "explore@test.com",
        password: "hashedpassword",
      },
    });

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

    expect(res.body.posts.length).toBeGreaterThanOrEqual(2);

    const post = res.body.posts[0];
    expect(post).toHaveProperty("caption");
    expect(post).toHaveProperty("imageUrl");
    expect(post).toHaveProperty("user");
    expect(post.user).toHaveProperty("username", "exploreTester");
  });
});

describe("GET /api/posts/user (User Feed)", () => {
  let johnTestUser;
  let followedUser1, followedUser2;

  beforeAll(async () => {
    await prisma.follow.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        username: { in: ["johndoe123", "FollowedUser1", "FollowedUser2"] },
      },
    });

    // Create the main test user
    johnTestUser = await prisma.user.create({
      data: {
        username: "johndoe123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "hashed-password",
      },
    });

    // Create two followed users
    followedUser1 = await prisma.user.create({
      data: {
        username: "FollowedUser1",
        email: "f1@example.com",
        password: "hashed-password",
      },
    });

    followedUser2 = await prisma.user.create({
      data: {
        username: "FollowedUser2",
        email: "f2@example.com",
        password: "hashed-password",
      },
    });

    // Create posts for those followed users
    await prisma.post.createMany({
      data: [
        {
          caption: "Post from user 1",
          imageUrl: "https://example.com/img1.jpg",
          userId: followedUser1.id,
        },
        {
          caption: "Post from user 2",
          imageUrl: "https://example.com/img2.jpg",
          userId: followedUser2.id,
        },
      ],
    });

    // Test users that John follows
    await prisma.follow.createMany({
      data: [
        { followerId: johnTestUser.id, followingId: followedUser1.id },
        { followerId: johnTestUser.id, followingId: followedUser2.id },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return all posts from accounts that a user follows", async () => {
    const res = await request(app)
      .get("/api/posts/user")
      .set("x-user-id", johnTestUser.id)

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("posts");
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.posts.length).toBeGreaterThanOrEqual(2);

    const captions = res.body.posts.map((p) => p.caption);
    expect(captions).toEqual(
      expect.arrayContaining(["Post from user 1", "Post from user 2"])
    );
  });
});
