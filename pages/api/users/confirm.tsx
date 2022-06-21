import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/server/client';
import { withApiSession } from '@libs/server/withSession';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { token } = req.body;
  const exists = await client.token.findUnique({
    where: {
      payload: token,
    },
    // userId를 참조하여 user 정보를 가져올 수 있다.
    include: {
      user: true,
    },
  });
  if (!exists) return res.status(404).end();
  // token 인증이 된 경우 session에 저장
  req.session.user = {
    id: exists.userId,
  };
  // encrypt the session
  await req.session.save();
  res.json({
    ok: true,
  });
}

export default withApiSession(withHandler('POST', handler));
