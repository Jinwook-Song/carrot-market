import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/server/client';
import { withApiSession } from '@libs/server/withSession';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { id },
  } = req;
  const product = await client.product.findUnique({
    where: {
      id: +id.toString(),
    },
    include: {
      user: {
        // 필요한 데이터만 선택할 수 있음
        select: {
          name: true,
          avatar: true,
        },
      },
    },
  });
  res.json({
    ok: true,
    product,
  });
}

export default withApiSession(
  withHandler({
    methods: ['GET'],
    isPrivate: true,
    handler,
  })
);
