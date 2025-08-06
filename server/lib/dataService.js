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
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.profileImageUrl && { profileImageUrl: data.profileImageUrl }),
        ...(data.bio && { bio: data.bio }),
      },
    });
  }
  
