import { NextApiRequest, NextApiResponse } from 'next';
import withHandler from 'libs/server/withHandler';
import client from '@libs/server/client';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, phone } = req.body;
  const payload = email ? { email } : { phone: +phone };
  const user = await client.user.upsert({
    where: {
      ...payload,
    },
    create: {
      name: 'Anonymous',
      ...payload,
    },
    update: {},
  });
  console.log(user);
  /*   if (email) {
    user = await client.user.findUnique({
      where: { email },
    });
    if (user) {
      console.log('Found user');
    }
    if (!user) {
      console.log('Did not find user');
      user = await client.user.create({
        data: {
          name: 'Anonymous',
          email,
        },
      });
    }
    console.log(user);
  }
  if (phone) {
    user = await client.user.findUnique({
      where: { phone: +phone },
    });
    if (user) {
      console.log('Found user');
    }
    if (!user) {
      console.log('Did not find user');
      user = await client.user.create({
        data: {
          name: 'Anonymous',
          phone: +phone,
        },
      });
    }
    console.log(user);
  } */
  res.status(200).end();
}

export default withHandler('POST', handler);
