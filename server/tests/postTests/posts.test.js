import { prisma } from "../../app.js";
import request from "supertest";
import app from "../../app.js";
import jwt from "jsonwebtoken";

function generateTestJWT(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
}

describe("POST /api/posts - Integration", () => {
  let testUser;
  let token;

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

    token = generateTestJWT(testUser);
  });

  afterAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("creates a post with valid data", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${token}`)
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
      .set("Authorization", `Bearer ${token}`)
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
      .set("Authorization", `Bearer ${token}`)
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
  let token;

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

    token = generateTestJWT(testUser);

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
      .set("Authorization", `Bearer ${token}`);

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
  let token;

  beforeAll(async () => {
    await prisma.follow.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        username: { in: ["johndoe123", "FollowedUser1", "FollowedUser2"] },
      },
    });

    johnTestUser = await prisma.user.create({
      data: {
        username: "johndoe123",
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "hashed-password",
      },
    });

    token = generateTestJWT(johnTestUser);

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
      .get("/api/posts")
      .set("Authorization", `Bearer ${token}`);

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
  let token;
  let createdPosts = [];

  beforeAll(async () => {
    await prisma.like.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({
      where: { username: "trending_test_user" },
    });

    testUser = await prisma.user.create({
      data: {
        username: "trending_test_user",
        firstName: "Test",
        lastName: "User",
        email: "trend@example.com",
        password: "hashed-password",
      },
    });

    token = generateTestJWT(testUser);

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

    async function addLikes(post, likeCount) {
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

    await addLikes(createdPosts[0], 10);
    await addLikes(createdPosts[1], 5);
    await addLikes(createdPosts[2], 20);
  });

  afterAll(async () => {
    await prisma.like.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({
      where: { username: { startsWith: "dummy_user_" } },
    });
    await prisma.$disconnect();
  });

  it("should return posts ordered by like count (descending)", async () => {
    const res = await request(app)
      .get("/api/posts/trending")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty("posts");
    expect(Array.isArray(res.body.posts)).toBe(true);
    expect(res.body.posts.length).toBe(3);

    const likeCounts = res.body.posts.map((post) => post._count.likes);
    const isDescending = likeCounts.every(
      (count, i, arr) => i === 0 || arr[i - 1] >= count
    );

    expect(isDescending).toBe(true);
  });
});

describe("GET /api/posts/:postId/comments and POST comments", () => {
  let alice, bob, carl, bobPost, token;

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

    token = generateTestJWT(alice);

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
        firstName: "Carl",
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
        { text: "Amazing shot!", userId: alice.id, postId: bobPost.id },
        { text: "Love the scenery!", userId: carl.id, postId: bobPost.id },
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

  it("allows a user to comment on a post", async () => {
    const newComment = { text: "Wow, this is stunning!" };

    const res = await request(app)
      .post(`/api/posts/${bobPost.id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .send(newComment)
      .expect(201);

    expect(res.body).toHaveProperty("comment");
    expect(res.body.comment.text).toBe("Wow, this is stunning!");
    expect(res.body.comment.userId).toBe(alice.id);
    expect(res.body.comment.postId).toBe(bobPost.id);
  });

  it("returns all comments for a post", async () => {
    const res = await request(app)
      .get(`/api/posts/${bobPost.id}/comments`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty("comments");
    expect(Array.isArray(res.body.comments)).toBe(true);
    expect(res.body.comments.length).toBeGreaterThanOrEqual(2);
  });
});

describe("DELETE /api/posts/:postId/comments/:commentId", () => {
  let alice, bob, carl, bobPost, aliceComment, carlComment, token;

  beforeAll(async () => {
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({
      where: { username: { in: ["alice_test", "bob_test", "carl_test"] } },
    });

    alice = await prisma.user.create({
      data: { username: "alice_test", firstName: "Alice", lastName: "Anderson", email: "alice@example.com", password: "hashed-password" },
    });

    token = generateTestJWT(alice);

    bob = await prisma.user.create({
      data: { username: "bob_test", firstName: "Bob", lastName: "Baker", email: "bob@example.com", password: "hashed-password" },
    });

    carl = await prisma.user.create({
      data: { username: "carl_test", firstName: "Carl", lastName: "Chapman", email: "carl@example.com", password: "hashed-password" },
    });

    bobPost = await prisma.post.create({
      data: { caption: "Bob’s latest travel photo", imageUrl: "http://localhost/bob_post.png", userId: bob.id },
    });

    aliceComment = await prisma.comment.create({ data: { text: "Amazing shot!", userId: alice.id, postId: bobPost.id } });
    carlComment = await prisma.comment.create({ data: { text: "Love the scenery!", userId: carl.id, postId: bobPost.id } });
  });

  afterAll(async () => {
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({
      where: { username: { in: ["alice_test", "bob_test", "carl_test"] } },
    });
    await prisma.$disconnect();
  });

  it("allows a user to delete their own comment", async () => {
    const res = await request(app)
      .delete(`/api/posts/${bobPost.id}/comments/${aliceComment.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty("message", "Comment deleted successfully");

    const deleted = await prisma.comment.findUnique({ where: { id: aliceComment.id } });
    expect(deleted).toBeNull();
  });

  it("prevents a user from deleting someone else's comment", async () => {
    const res = await request(app)
      .delete(`/api/posts/${bobPost.id}/comments/${carlComment.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(res.body).toHaveProperty("message", "Not authorized to delete this comment");
  });
});

describe("PUT /api/posts/:postId (Update Post Caption)", () => {
  let testUser;
  let createdPost;
  let token;

  beforeAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    testUser = await prisma.user.create({
      data: { username: "test-user", firstName: "Test", lastName: "User", email: "test@example.com", password: "hashedpassword" },
    });

    token = generateTestJWT(testUser);

    createdPost = await prisma.post.create({
      data: { caption: "Original caption", imageUrl: "http://localhost/test.png", userId: testUser.id },
    });
  });

  afterAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("updates the caption of the user's own post", async () => {
    const updatedData = { caption: "Updated caption" };

    const res = await request(app)
      .put(`/api/posts/${createdPost.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updatedData)
      .expect(200);

    expect(res.body).toHaveProperty("post");
    expect(res.body.post.caption).toBe("Updated caption");

    const updatedPost = await prisma.post.findUnique({ where: { id: createdPost.id } });
    expect(updatedPost.caption).toBe("Updated caption");
  });

  it("prevents a user from updating someone else's post", async () => {
    const otherUser = await prisma.user.create({
      data: { username: "intruder", email: "intruder@example.com", password: "hackedpassword" },
    });

    const otherToken = generateTestJWT(otherUser);

    const res = await request(app)
      .put(`/api/posts/${createdPost.id}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ caption: "Hacked caption" })
      .expect(403);

    expect(res.body.message).toBe("Not authorized to update this post");
  });
});

describe("DELETE /api/posts/:postId (Delete Post)", () => {
  let testUser;
  let createdPost;
  let token;

  beforeAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    testUser = await prisma.user.create({
      data: { username: "test-user", firstName: "Test", lastName: "User", email: "test@example.com", password: "hashedpassword" },
    });

    token = generateTestJWT(testUser);

    createdPost = await prisma.post.create({
      data: { caption: "Original caption", imageUrl: "http://localhost/test.png", userId: testUser.id },
    });
  });

  afterAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it("removes a user's own post", async () => {
    const res = await request(app)
      .delete(`/api/posts/${createdPost.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.message).toBe("Post deleted successfully");

    const postInDb = await prisma.post.findUnique({ where: { id: createdPost.id } });
    expect(postInDb).toBeNull();
  });

  it("prevents a user from deleting someone else's post", async () => {
    const otherUser = await prisma.user.create({
      data: { username: "intruder", email: "intruder@example.com", password: "hackedpassword" },
    });

    const otherToken = generateTestJWT(otherUser);

    const anotherPost = await prisma.post.create({
      data: { caption: "Protected post", imageUrl: "http://localhost/protected.png", userId: testUser.id },
    });

    const res = await request(app)
      .delete(`/api/posts/${anotherPost.id}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .expect(403);

    expect(res.body.message).toBe("Not authorized to delete this post");
  });
});