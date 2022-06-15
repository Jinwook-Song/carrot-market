import { NextApiRequest, NextApiResponse } from 'next';
import client from '../../../libs/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.status(405).end();
  }
  console.log(JSON.parse(req.body.phone));
  res.status(200).end();
}
