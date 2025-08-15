import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create 10 users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(async () => {
      return await prisma.user.create({
        data: {
          username: faker.internet.userName(),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          profileImageUrl: faker.image.avatar(),
          bio: faker.lorem.sentence(),
        },
      });
    })
  );

  // Create posts for each user
  const posts = [];
  for (const user of users) {
    const postCount = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < postCount; i++) {
      const post = await prisma.post.create({
        data: {
          caption: faker.lorem.sentence(),
          imageUrl: faker.image.urlLoremFlickr({ category: 'nature' }),
          userId: user.id,
        },
      });
      posts.push(post);
    }
  }

  // Create comments from random users on random posts
  for (let i = 0; i < 20; i++) {
    const post = faker.helpers.arrayElement(posts);
    const commenter = faker.helpers.arrayElement(users);

    await prisma.comment.create({
      data: {
        text: faker.lorem.sentence(),
        userId: commenter.id,
        postId: post.id,
      },
    });
  }

  // Create likes from random users on random posts
  const likeSet = new Set();
  for (let i = 0; i < 30; i++) {
    const post = faker.helpers.arrayElement(posts);
    const user = faker.helpers.arrayElement(users);
    const likeKey = `${user.id}_${post.id}`;
    if (likeSet.has(likeKey)) continue;

    likeSet.add(likeKey);
    await prisma.like.create({
      data: {
        userId: user.id,
        postId: post.id,
      },
    });
  }

  // Create follows between users
  const followSet = new Set();
  for (let i = 0; i < 30; i++) {
    const follower = faker.helpers.arrayElement(users);
    const following = faker.helpers.arrayElement(users);
    const followKey = `${follower.id}_${following.id}`;
    if (follower.id === following.id || followSet.has(followKey)) continue;

    followSet.add(followKey);
    await prisma.follow.create({
      data: {
        followerId: follower.id,
        followingId: following.id,
      },
    });
  }

  console.log('✅ Seed complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
