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
      const products = await client.product.findMany({});
      res.json({
        ok: true,
        products,
      });
      break;
    case 'POST':
      const {
        body: { name, price, description },
        session: { user },
      } = req;
      const product = await client.product.create({
        data: {
          name,
          price: +price,
          description,
          image: 'imageURL',
          user: {
            connect: {
              id: user?.id,
            },
          },
        },
      });
      res.json({
        ok: true,
        product,
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
