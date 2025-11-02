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
      .set("x-user-id", johnTestUser.id);

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

describe("GET /api/posts/trending (Trending Feed)", () => {
  let testUser;
  let createdPosts = [];

  beforeAll(async () => {
    // Clean up previous test data
    await prisma.like.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({
      where: { username: "trending_test_user" },
    });

    // Create a test user
    testUser = await prisma.user.create({
      data: {
        username: "trending_test_user",
        firstName: "Test",
        lastName: "User",
        email: "trend@example.com",
        password: "hashed-password",
      },
    });

    // Create posts under the same user
    createdPosts = await Promise.all([
      prisma.post.create({
        data: {
          caption: "Post with 10 likes",
          imageUrl: "http://localhost/test1.png",
          userId: testUser.id,
        },
      }),
      prisma.post.create({
        data: {
          caption: "Post with 5 likes",
          imageUrl: "http://localhost/test2.png",
          userId: testUser.id,
        },
      }),
      prisma.post.create({
        data: {
          caption: "Post with 20 likes",
          imageUrl: "http://localhost/test3.png",
          userId: testUser.id,
        },
      }),
    ]);

    // Helper to bulk create likes
    async function addLikes(post, likeCount) {
      const likeData = Array.from({ length: likeCount }).map(() => ({
        userId: testUser.id,
        postId: post.id,
      }));

      // To avoid unique constraint errors, ensure to add one like per (user, post)
      // "dummy users" are being added for other likes
      const extraUsers = await Promise.all(
        Array.from({ length: likeCount - 1 }).map((_, i) =>
          prisma.user.create({
            data: {
              username: `dummy_user_${post.id}_${i}`,
              firstName: "Dummy",
              lastName: "User",
              email: `dummy_${post.id}_${i}@example.com`,
              password: "hashed",
            },
          })
        )
      );

      const likes = [
        { userId: testUser.id, postId: post.id },
        ...extraUsers.map((u) => ({ userId: u.id, postId: post.id })),
      ];

      await prisma.like.createMany({ data: likes });
    }

    // Add varying like counts
    await addLikes(createdPosts[0], 10);
    await addLikes(createdPosts[1], 5);
    await addLikes(createdPosts[2], 20);
  });

  afterAll(async () => {
    // Clean up after tests
    await prisma.like.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        OR: [{ id: testUser.id }, { username: { startsWith: "dummy_user_" } }],
      },
    });

    await prisma.$disconnect();
  });

  it("should return posts ordered by like count (descending)", async () => {
    const res = await request(app)
      .get("/api/posts/trending")
      .set("x-user-id", testUser.id)
      .expect(200);

    expect(res.body).toHaveProperty("posts");
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.posts.length).toBe(3);

    // Ensure posts are sorted in descending order by like count
    const likeCounts = res.body.posts.map((post) => post._count.likes);
    const isDescending = likeCounts.every(
      (count, i, arr) => i === 0 || arr[i - 1] >= count
    );

    expect(isDescending).toBe(true);
  });
});

describe("GET /api/posts/comments", () => {
  let alice;
  let bob;
  let carl;
  let bobPost;

  beforeAll(async () => {
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({
      where: { username: { in: ["alice_test", "bob_test", "carl_test"] } },
    });

    alice = await prisma.user.create({
      data: {
        username: "alice_test",
        firstName: "Alice",
        lastName: "Anderson",
        email: "alice@example.com",
        password: "hashed-password",
      },
    });

    bob = await prisma.user.create({
      data: {
        username: "bob_test",
        firstName: "Bob",
        lastName: "Baker",
        email: "bob@example.com",
        password: "hashed-password",
      },
    });

    carl = await prisma.user.create({
      data: {
        username: "carl_test",
        firstName: "carl",
        lastName: "Chapman",
        email: "carl@example.com",
        password: "hashed-password",
      },
    });

    bobPost = await prisma.post.create({
      data: {
        caption: "Bob’s latest travel photo",
        imageUrl: "http://localhost/bob_post.png",
        userId: bob.id,
      },
    });

    await prisma.comment.createMany({
      data: [
        {
          text: "Amazing shot!",
          userId: alice.id,
          postId: bobPost.id,
        },
        {
          text: "Love the scenery!",
          userId: carl.id,
          postId: bobPost.id,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({
      where: { username: { in: ["alice_test", "bob_test", "carl_test"] } },
    });

    await prisma.$disconnect();
  });

  it("should allow a logged-in user to comment on a post", async () => {
    const newComment = {
      text: "Wow, this is stunning!",
      postId: bobPost.id,
    };

    const res = await request(app)
      .post(`/api/posts/${bobPost.id}/comments`)
      .set("x-user-id", alice.id)
      .send(newComment)
      .expect(201);

    expect(res.body).toHaveProperty("comment");
    expect(res.body.comment.text).toBe("Wow, this is stunning!");
    expect(res.body.comment.userId).toBe(alice.id);
    expect(res.body.comment.postId).toBe(bobPost.id);
  });

  it("should return all comments for a specific post", async () => {
    const res = await request(app)
      .get(`/api/posts/${bobPost.id}/comments`)
      .set("x-user-id", alice.id)
      .expect(200);

    expect(res.body).toHaveProperty("comments");
    expect(Array.isArray(res.body.comments)).toBe(true);
    expect(res.body.comments.length).toBeGreaterThanOrEqual(2);

    const commentTexts = res.body.comments.map((c) => c.text);
    expect(commentTexts).toContain("Amazing shot!");
    expect(commentTexts).toContain("Love the scenery!");
  });
});
