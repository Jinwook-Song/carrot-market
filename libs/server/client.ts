import { PrismaClient } from 'prisma/prisma-client';

export default new PrismaClient();

// const client = new PrismaClient();

// client.user.create({
//   data: {
//     name: 'test',
//     email: 'song',
//   },
// });