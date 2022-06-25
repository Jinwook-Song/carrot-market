import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/server/client';
import { withApiSession } from '@libs/server/withSession';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { token } = req.body;
  const matchedToken = await client.token.findUnique({
    where: {
      payload: token,
    },
    // userId를 참조하여 user 정보를 가져올 수 있다.
    include: {
      user: true,
    },
  });
  if (!matchedToken) return res.status(404).end();
  // token 인증이 된 경우 session에 저장
  req.session.user = {
    id: matchedToken.userId,
  };
  // encrypt the session
  await req.session.save();
  // 세션 저장 후, 인증된 유저와 연결된 토큰 모두 제거
  // 인증에 사용된 토큰을 다시 사용하지 못하게 하기 위함
  await client.token.deleteMany({
    where: {
      userId: matchedToken.userId,
    },
  });
  res.json({
    ok: true,
  });
}

export default withApiSession(
  withHandler({
    methods: ['POST'],
    isPrivate: false,
    handler,
  })
);
