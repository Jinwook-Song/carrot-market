import { PrismaClient } from 'prisma/prisma-client';

const client = new PrismaClient();

client.user.create({
  data: {
    name: 'test',
    email: 'song',
  },
});
