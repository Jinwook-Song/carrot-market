import twilio from 'twilio';
import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from 'libs/server/withHandler';
import client from '@libs/server/client';

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { phone, email } = req.body;
  const user = phone ? { phone } : email ? { email } : null;
  if (!user)
    return res.status(400).json({
      ok: false,
    });
  // 6 digits random number
  const payload = Math.floor(100000 + Math.random() * 900000) + '';
  const token = await client.token.create({
    data: {
      payload,
      user: {
        connectOrCreate: {
          where: {
            ...user,
          },
          create: {
            name: 'Anonymous',
            ...user,
          },
        },
      },
    },
  });
  if (phone) {
    /*     const message = await twilioClient.messages.create({
      messagingServiceSid: process.env.TWILIO_MSID,
      // FIXME: 실제 입력 폰 번호가 들어갈 위치(국가코드 +82106363XXXX로 입력하여야 함)
      // to: phone
      to: process.env.MY_PHONE!,
      body: `Your login token is ${payload}.`,
    });
    console.log(message); */
  } else if (email) {
    // TODO: email api
  }

  res.json({
    ok: true,
  });
}

export default withHandler({
  method: 'POST',
  isPrivate: false,
  handler,
});
