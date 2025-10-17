import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

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
        select: { id: true, username: true },
      },
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
  
  