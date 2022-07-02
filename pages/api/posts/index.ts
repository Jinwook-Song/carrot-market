import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/server/client';
import { withApiSession } from '@libs/server/withSession';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    body: { question, latitude, longitude },
    session: { user },
    query: { latitude: currLatitude, longitude: currLongitude },
    method,
  } = req;

  switch (method) {
    case 'GET':
      const parsedLatitude = parseFloat(currLatitude.toString());
      const parsedLongitude = parseFloat(currLongitude.toString());
      const posts = await client.post.findMany({
        where: {
          latitude: {
            gte: parsedLatitude - 0.01,
            lte: parsedLatitude + 0.01,
          },
          longitude: {
            gte: parsedLongitude - 0.01,
            lte: parsedLongitude + 0.01,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              answers: true,
              wondering: true,
            },
          },
        },
        take: 6,
      });
      res.json({
        ok: true,
        posts,
      });
      break;
    case 'POST':
      const post = await client.post.create({
        data: {
          question,
          latitude,
          longitude,
          user: {
            connect: {
              id: user?.id,
            },
          },
        },
      });

      res.json({
        ok: true,
        post,
      });
      break;
  }
}

export default withApiSession(
  withHandler({
    methods: ['GET', 'POST'],
    isPrivate: true,
    handler,
  })
);
