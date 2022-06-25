import { NextApiRequest, NextApiResponse } from 'next';

export interface ResponseType {
  ok: boolean;
  [key: string]: any;
  isPrivate?: boolean;
}

type method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ConfigType {
  methods: method[];
  handler: (req: NextApiRequest, res: NextApiResponse) => void;
  isPrivate?: boolean;
}

export default function withHandler({
  methods,
  isPrivate = true, // default
  handler,
}: ConfigType) {
  return async function (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<any> {
    if (req.method && !methods.includes(req.method as method)) {
      return res.status(405).end();
    }
    if (isPrivate && !req.session.user) {
      return res
        .status(401)
        .json({ ok: false, error: 'You are not allowed to access.' });
    }
    try {
      await handler(req, res);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  };
}

// NextJS는 withHandler가 Return하는것을 실행
