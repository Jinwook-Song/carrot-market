import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/server/client';
import { withApiSession } from '@libs/server/withSession';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  switch (req.method) {
    case 'GET':
      const streams = await client.stream.findMany({});
      res.json({
        ok: true,
        streams,
      });
      break;

    case 'POST':
      const {
        body: { name, price, description },
        session: { user },
      } = req;
      const stream = await client.stream.create({
        data: {
          name,
          price,
          description,
          user: {
            connect: {
              id: user?.id,
            },
          },
        },
      });
      res.json({
        ok: true,
        stream,
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
