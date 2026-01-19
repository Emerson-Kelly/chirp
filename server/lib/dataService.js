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
    orderBy: [
      { username: "desc" },
      { firstName: "desc" },
      { lastName: "desc" },
    ],
  });
}

export async function getProfileInfo(prisma, userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      profileImageUrl: true,
      bio: true,
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  });
}

export function isUserFollowing(prisma, currentUserId, profileUserId) {
  if (!currentUserId) return false;

  return prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: profileUserId,
      },
    },
  });
}

export async function getFollowers(prisma, userId) {
  return prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          profileImageUrl: true,
        },
      },
    },
  });
}

export async function getFollowing(prisma, userId) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          profileImageUrl: true,
        },
      },
    },
  });
}

export function postEditProfileInfo(prisma, id, data) {
  const { username, firstName, lastName, profileImageUrl, bio } = data;

  const updateData = {
    ...(username && { username }),
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(bio !== undefined && { bio }),
    ...(profileImageUrl && { profileImageUrl }),
  };

  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

export async function postNewUserPost(prisma, data, userId) {
  const { caption, imageUrl, imagePath } = data;

  return prisma.post.create({
    data: {
      caption,
      imageUrl,
      imagePath,
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

  const userIds = [...followingIds, userId];

  return prisma.post.findMany({
    where: {
      userId: { in: userIds },
    },
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
              username: true,
              firstName: true,
              lastName: true,
              profileImageUrl: true,
            },
          },
        },
      },
      likes: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });
}

export function getTheMostLikedPosts() {
  return prisma.post.findMany({
    orderBy: {
      likes: {
        _count: "desc",
      },
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

export async function getPostById(prisma, postId) {
  return prisma.post.findUnique({
    where: { id: postId },
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
        orderBy: { createdAt: "asc" },
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
        },
      },
      likes: true,
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });
}

export function getThreeMostRecentUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  });
}

export function getThreeMostFollowedUsers() {
  return prisma.user.findMany({
    orderBy: {
      followers: {
        _count: "desc",
      },
    },
    take: 3,
  });
}
