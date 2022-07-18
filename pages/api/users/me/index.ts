import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/server/client';
import { withApiSession } from '@libs/server/withSession';

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const method = req.method;
  switch (method) {
    case 'GET':
      const profile = await client.user.findUnique({
        where: {
          id: req.session.user?.id,
        },
      });
      res.json({
        ok: true,
        profile,
      });
      break;
    case 'POST':
      const {
        session: { user },
        body: { name, email, phone, avatarId },
      } = req;

      const currentUser = await client.user.findUnique({
        where: {
          id: user?.id,
        },
      });

      if (email && email !== currentUser?.email) {
        const aleadyExist = Boolean(
          await client.user.findUnique({
            where: {
              email,
            },
            select: {
              id: true,
            },
          })
        );
        if (aleadyExist) {
          res.json({
            ok: false,
            error: 'Email address already in use.',
          });
        } else {
          await client.user.update({
            where: {
              id: user?.id,
            },
            data: {
              email,
            },
          });
          res.json({
            ok: true,
          });
        }
      } else if (phone && phone !== currentUser?.phone) {
        const aleadyExist = Boolean(
          await client.user.findUnique({
            where: {
              phone,
            },
            select: {
              id: true,
            },
          })
        );
        if (aleadyExist) {
          res.json({
            ok: false,
            error: 'Phone number already in use.',
          });
        } else {
          await client.user.update({
            where: {
              id: user?.id,
            },
            data: {
              phone,
            },
          });
          res.json({
            ok: true,
          });
        }
      }

      if (name) {
        await client.user.update({
          where: {
            id: user?.id,
          },
          data: {
            name,
          },
        });
        res.json({
          ok: true,
        });
      }

      if (avatarId) {
        await client.user.update({
          where: {
            id: user?.id,
          },
          data: {
            avatar: avatarId,
          },
        });
        res.json({
          ok: true,
        });
      }

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
