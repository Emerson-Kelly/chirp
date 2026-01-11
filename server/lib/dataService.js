import { prisma } from "../app.js";

export function getSearchedUsers(prisma, query) {
  return prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: [{ username: "asc" }, { firstName: "asc" }, { lastName: "asc" }],
  });
}

export function getProfileInfo(prisma, id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true,
      profileImageUrl: true,
      bio: true,
    },
  });
}

export function postEditProfileInfo(prisma, id, data) {
  const { username, firstName, lastName, profileImageUrl, bio } = data;

  const updateData = {
    ...(username && { username }),
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    profileImageUrl:
      profileImageUrl ?? "/assets/images/default-user-profile.jpg",
    ...(bio && { bio }),
  };

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

export async function postNewUserPost(prisma, data, userId) {
  const { caption, imageUrl } = data;

  return await prisma.post.create({
    data: {
      caption,
      imageUrl,
      userId,
      createdAt: new Date(),
    },
  });
}

export function getExploreFeed() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: { likes: true, comments: true },
      },
      likes: true,
    },
  });
}

export async function getFollowingFeed(prisma, userId) {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const followingIds = following.map((f) => f.followingId);

  const posts = await prisma.post.findMany({
    where: { userId: { in: followingIds } },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, username: true, profileImageUrl: true },
      },
    },
  });

  return posts;
}

export async function getTheMostLikedPosts() {
  return prisma.post.findMany({
    orderBy: {
      likes: {
        _count: "desc",
      },
    },
    include: {
      user: {
        select: { id: true, username: true },
      },
      _count: { select: { likes: true } },
    },
  });
}

export async function postCommentsFromUsers(data, userId) {
  const { text, postId } = data;

  return prisma.comment.create({
    data: {
      text,
      userId,
      postId,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          profileImageUrl: true,
        },
      },
      post: {
        select: {
          id: true,
          caption: true,
          comments: true,
        },
      },
    },
  });
}

export async function getCommentsFromUsers(postId) {
  if (!postId) throw new Error("postId is required");

  return prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profileImageUrl: true,
        },
      },
      post: {
        select: {
          id: true,
          caption: true,
        },
      },
    },
  });
}

export async function deleteUserComment(commentId, userId) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId) {
    throw new Error("Not authorized to delete this comment");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { message: "Comment deleted successfully" };
}

export async function updateUserPostById(postId, userId, caption) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return null;
  if (post.userId !== userId) return false;

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { caption },
  });
  return updated;
}

export async function deleteUserPostById(postId, userId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) return null;
  if (post.userId !== userId) return false;

  await prisma.post.delete({
    where: { id: postId },
  });

  return true;
}
