import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  //   const post1 = await prisma.article.upsert({
  //     where: { title: 'Prisma Adds Support for MongoDB' },
  //     update: {},
  //     create: {
  //       title: 'Prisma Adds Support for MongoDB',
  //       body: 'Support for MongoDB has been one of the most requested features since the initial release of...',
  //       description:
  //         "We are excited to share that today's Prisma ORM release adds stable support for MongoDB!",
  //       published: false,
  //     },
  //   });
  //   console.log({ post1 });
}

// execute the main function
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
