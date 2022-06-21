# Carrot Market

| 프로젝트 기간 | 22.06.04 ~         |
| ------------- | ------------------ |
| 프로젝트 목적 | NextJS, Serverless |
| Github        | ‣                  |

---

## tsConfig.json

```jsx
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@libs/*": ["libs/*"],
      "@components/*": ["components/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

## Prisma

nodejs, typescript의 ORM

ORM은 typescript와 데이터베이스 사이의 다리 역할

우선 schema.prisma에 데이터의 모양을 알려주어야 함

Prisma가 타입을 알고 있으면 client를 생성해줌

client를 통해 타입스크립트로 데이터베이스와 직접 상호작용

Prisma studio (Visual Database Browser): Admin 패널같이 데이터를 관리할 수 있음

---

`npm i prisma -D`

in terminal

```jsx
npx prisma init
```

prisma 폴더와, .env 파일이 생성됨

.env파일에 제대로 된 DATABASE URL을 연결

schema.prisma에 provider를 설정(이 프로젝트에서는 mySQL을 사용)

database에 사용될 model 생성

```jsx
model User {
  id        Int      @id @default(autoincrement())
  phone     Int?     @unique
  email     String?  @unique
  name      String
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## PlanetScale

mysql과 호환(Compatible)되는 serverless 데이터베이스 플랫폼

scaling을 자동으로 해줌 ( + no vacumming, no rebalencing, no query planning, no downtime)

Vitess 오픈소스를 통해 MySQL Scaling

CLI를 통해 쉽게 데이터베이스를 다룰 수 있음

마치 Git처럼 메인 데이터베이스 이외에 Branch 데이터베이스를 사용할 수도 있음

이후 Merge를 하면 자동으로 배포가 됨

---

## PlanetScale CLI

mac

`brew install planetscale/tap/pscale`

`brew install mysql-client`

`pscale auth login`

`pscale region list`

`pscale database create carrot-market --region ap-northeast`

carrot-market: databse name

ap-northeast: region list의 slug 사용

admin pannel에서도 동일하게 생성이 가능

보안 터널을 통해 PlanetScale과 컴퓨터를 연결할 수 있다

`pscale connect carrot-market`

pscale 에서 제공하는 URL을 데이터베이스에 연결 (터미널 연결은 유지해야함)

`DATABASE_URL="mysql://127.0.0.1:3306/carrot-market"`

이를통해 별다른 암호 없이 직접 데이터베이스와 연결할 수 있음

---

Vitess는 foreign key constraint를 지원하지 않음 (일반적인 MySQL, PostgresQL은 지원함)

Scaling을 위해 데이터를 분산하기 때문

따라서 이 작업은 Prisma에서 수행

```jsx
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["referentialIntegrity"]
}

datasource db {
  provider             = "mysql"
  url                  = env("DATABASE_URL")
  referentialIntegrity = "prisma"
}
```

referentialIntegrity를 prisma에서 수행한다고 명시해줌으로써 동작 가능

---

`npx prisma db push` 를 통해 Prisma client 생성

Admin Pannel에 모델이 SQL로 잘 생성되었음 (prisma가 번역해준것)

---

`npx prisma studio`

Prisma Studio가 schema.prisma를 읽고, 모델을 이해한 후, 모델을 관리할 수 있는 패널을 제공

---

## client 이용

`npm i @prisma/client`

in client.ts

```jsx
import { PrismaClient } from 'prisma/prisma-client';

const client = new PrismaClient();

client.user.create({
  data: {
    name: 'test',
    email: 'song',
  },
});
```

`npx prisma generate` client 생성(type이 생성됨, node_module에서 확인 가능)

```jsx
/**
 * Model User
 *
 */
export type User = {
  id: number
  phone: number | null
  email: string | null
  name: string
  avatar: string | null
  createdAt: Date
  updatedAt: Date
}
```

---

client.ts 는 당연하게도 front에서 import하여 사용할 수 없음 (보안에 심각한 문제)

따라서 front(브라우져)가 아닌 서버가 필요

pages 경로에 api 폴더를 생성함으로써 api서버가 생성됨

connection 핸들러 함수를 export defualt해주면 됨

in client.ts

```jsx
import { PrismaClient } from 'prisma/prisma-client';

export default new PrismaClient();
```

in api/client-test.tsx

```jsx
import { NextApiRequest, NextApiResponse } from 'next';
import client from '../../libs/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await client.user.create({
    data: {
      name: 'test',
      email: 'song',
    },
  });

  res.json({
    ok: true,
  });
}
```

---

POST요청을 보낼때 header를 지정해 주어야함

Frontend

```jsx
const onValid = (data: IEnterForm) => {
  fetch('/api/users/enter', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
```

Backend

```jsx
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
```

---

withHandler

```jsx
import { NextApiRequest, NextApiResponse } from 'next';

export default function withHandler(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  fn: (req: NextApiRequest, res: NextApiResponse) => void
) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== method) {
      return res.status(405).end();
    }
    try {
      await fn(req, res);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  };
}

// NextJS는 withHandler가 Return하는것을 실행
```

---

### Auth Logic

`phone # --> check exist --> it does, Send Token(connected with User) to the Phone (use Twilo) --> Client submit that Token --> If is correct, Authenticate`

---

User create

유저가 있는지 확인 후, 생성

```jsx
const { email, phone } = req.body;
let user;
if (email) {
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
}
```

upsert

위 과정을 es6 문법과 upsert method를 사용하여 간결하게 정리

```jsx
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
```

---

Token model (schema update)

`npx prisma db push`

```jsx
model User {
  id        Int      @id @default(autoincrement())
  phone     Int?     @unique
  email     String?  @unique
  name      String
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tokens    Token[]
}

model Token {
  id        Int      @id @default(autoincrement())
  payload   String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

실제 Token은 user를 저장하지 않고, userId를 참조해서 User에 접근

---

Create Token

```tsx
const { email, phone } = req.body;
const payload = email ? { email } : { phone: +phone };

const token = await client.token.create({
  data: {
    payload: '1234',
    user: {
      // User가 없다면 생성하고, 연결 => user.upsert 대체 할 수 있음
      connectOrCreate: {
        where: {
          ...payload,
        },
        create: {
          name: 'Anonymous',
          ...payload,
        },
      },
    },
  },
});
```

---

`npm i twilio`

Tutorial

https://www.twilio.com/docs/messaging/services/tutorials/how-to-send-sms-messages-services-node-js

```jsx
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

if (phone) {
    const message = await twilioClient.messages.create({
      messagingServiceSid: process.env.TWILIO_MSID,
      // FIXME: 실제 입력 폰 번호가 들어갈 위치(국가코드 +82106363XXXX로 입력하여야 함)
      // to: phone
      to: process.env.MY_PHONE!,
      body: `Your login token is ${payload}.`,
    });
    console.log(message);
  }
```

```bash
.env file
TWILIO_SID=
TWILIO_TOKEN=
TWILIO_MSID=
MY_PHONE=
```

---

`onDelete: Cascade`

User가 삭제되면, Token도 삭제

```jsx
model Token {
  id        Int      @id @default(autoincrement())
  payload   String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

Generic response

useMutation.tsx

```jsx
interface UseMutationState<T> {
  loading: boolean;
  data?: T;
  error?: object;
}
type UseMutationResult<T> = [(data: any) => void, UseMutationState<T>];

export default function useMutation<T = any>(
  url: string
): UseMutationResult<T> {
  return [mutation, { ...state }];
}
```

```tsx
const [enter, { loading, data, error }] =
  useMutation<Pick<ResponseType, 'ok'>>('/api/users/enter');
```

---

`npm i iron-session`

[https://github.com/vvo/iron-session#readme](https://github.com/vvo/iron-session#readme)

```tsx
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/server/client';

declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: number;
    };
  }
}

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
  if (!exists) res.status(404).end();
  // token 인증이 된 경우 session에 저장
  req.session.user = {
    id: exists?.userId,
  };
  // encrypt the session
  await req.session.save();
  res.status(200).end();
}

export default withIronSessionApiRoute(withHandler('POST', handler), {
  cookieName: 'carrot_cookie',
  password: 'complex_password_at_least_32_characters_long',
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
});
```

---

get user profile

모든 api는 실제 백엔드 없이 개별적으로 동작하기 때문에

각 api 마다 type과 withIronSessionApiRoute config를 매번 설정해줘야함

쿠키에 세션이 userId가 저장되어 있기 때문에 Id에 해당하는 user정보를 가져올 수 있음

```tsx
import { withIronSessionApiRoute } from 'iron-session/next';
import { NextApiRequest, NextApiResponse } from 'next';
import withHandler, { ResponseType } from '@libs/server/withHandler';
import client from '@libs/server/client';

// iron session에 sesstion type 정의
declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: number;
    };
  }
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  console.log(req.session.user);
  const profile = await client.user.findUnique({
    where: {
      id: req.session.user?.id,
    },
  });
  res.json({
    ok: true,
    profile,
  });
}

export default withIronSessionApiRoute(withHandler('GET', handler), {
  cookieName: 'carrot_cookie',
  password: 'complex_password_at_least_32_characters_long',
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
});
```

functional programming

```tsx
import { withIronSessionApiRoute } from 'iron-session/next';

// iron session에 sesstion type 정의
declare module 'iron-session' {
  interface IronSessionData {
    user?: {
      id: number;
    };
  }
}

const cookieOptions = {
  cookieName: 'carrot_cookie',
  password: process.env.COOKIE_PASSWORD!,
  // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

export function withApiSession(fn: any) {
  return withIronSessionApiRoute(fn, cookieOptions);
}
```

```tsx
export default withApiSession(withHandler('GET', handler));
```

---

(SMS, EMAIL)로 받은 토큰 입력 → 해당 토큰이 존재 → 토큰에 연결된 UserID 세션에 저장 (Authentication) → 인증 후, 사용된 토큰 삭제 (+ 인증된 유저와 연결된 모든 토큰 삭제)

```tsx
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

export default withApiSession(withHandler('POST', handler));
```
