# Carrot Market

| 프로젝트 기간 | 22.06.04 ~         |
| ------------- | ------------------ |
| 프로젝트 목적 | NextJS, Serverless |
| Github        | ‣                  |

---

## tsConfig.json

---

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

---

### Next Auth

간단한 인증은 매우 간단하게 처리가능

`path: **pages/api/auth/[...nextauth].js**`

```tsx
import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // ...add more providers here
  ],
});
```

NextAuth 로 prisma db에 데이터를 저장하기 위해서 몇가지 설정 필요

[https://next-auth.js.org/adapters/prisma](https://next-auth.js.org/adapters/prisma)

---

Protect Handler

인자가 많아지면 객체 형식으로 표현해주는것이 가독성에 좋다

`fn('GET', handler, true) -> fn({method:'GET', handler, isPrivate:true})`

```tsx
import { NextApiRequest, NextApiResponse } from 'next';

export interface ResponseType {
  ok: boolean;
  [key: string]: any;
  isPrivate?: boolean;
}

interface ConfigType {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: (req: NextApiRequest, res: NextApiResponse) => void;
  isPrivate?: boolean;
}

export default function withHandler({
  method,
  isPrivate = true, // default
  handler,
}: ConfigType) {
  return async function (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<any> {
    if (req.method !== method) {
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
```

```tsx
export default withApiSession(
  withHandler({
    method: 'GET',
    isPrivate: true,
    handler,
  })
);
```

---

useUser.ts hook

```tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function useUser() {
  const router = useRouter();
  const [user, setuser] = useState();
  useEffect(() => {
    fetch('/api/users/myProfile')
      .then((response) => response.json())
      .then((data) => {
        if (!data.ok) return router.replace('/enter'); // push의 경우 브라우져가 history를 남김
        setuser(data.profile);
      });
  }, [router]);
  return user;
}
```

`const user = useUser()`를 통해 각 페이지에서 사용할 수 있음

하지만 매번 api 요청을 필요로 하기때문에 받아온 데이터를 캐쉬할 필요가 있음 → SWR 사용

---

SWR

`npm i swr`

VS react-query `https://goongoguma.github.io/2021/11/04/React-Query-vs-SWR/`

- React Query가 더 많은 기능을 제공하지만 그만큼 더 많은 용량을 차지(3배)
- 간단한 용도로 사용하기에는 유용하게 사용가능

데이터가 변경되면 자동으로 데이터를 변경해줌

(실제로 user name을 수정하자 즉각적으로 데이터를 다시 불러옴)

```tsx
import { useRouter } from 'next/router';
import useSWR from 'swr';

function fetcher(url: string) {
  return fetch(url).then((response) => response.json());
}

export default function useUser() {
  const url = '/api/users/myProfile';
  const { data, error } = useSWR(url, fetcher);
  const router = useRouter();

  return data;
}
```

SWR Config를 통해 fetcher function을 세팅할 수 있음

`const { data, error } = useSWR(url)` url만 넘겨주어도 사용 가능

```tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { fetcher } from '@libs/client/utils';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig value={{ fetcher }}>
      <div className='w-full max-w-xl mx-auto'>
        <Component {...pageProps} />
      </div>
    </SWRConfig>
  );
}

export default MyApp;
```

code refactoring

```tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSWR from 'swr';

export default function useUser() {
  const url = '/api/users/myProfile';
  const { data, error } = useSWR(url);
  const router = useRouter();
  useEffect(() => {
    if (data && !data.ok) {
      router.replace('/enter');
    }
  }, [data, router]);

  return { user: data?.profile, isLoading: !data && !error };
}
```

---

Product Model

```tsx
model Product {
  id          Int      @id @default(autoincrement())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      Int
  image       String   @db.Text
  name        String
  price       Int
  description String   @db.MediumText
}

TINYTEXT 256 bytes 최대 255 글자
TEXT 65,535 bytes ~64kb 최대 65535 글자
MEDIUMTEXT 16,777,215 bytes ~16MB 최대 16777215 글자
LONGTEXT 4,294,967,295 bytes ~4GB 최대 4294967295 글자
```

---

REST API

GET, POST에 따라 각각의 로직을 처리

```tsx
type method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ConfigType {
  methods: method[];
  handler: (req: NextApiRequest, res: NextApiResponse) => void;
  isPrivate?: boolean;
}
```

```tsx
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
```

---

useSWR data type

```tsx
interface IProductResponse {
  ok: boolean;
  products: Product[];
}

const { data } = useSWR<IProductResponse>(url);
```

---

get Product

```tsx
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
```

reponse interface

```tsx
interface IProductResponse {
  ok: boolean;
  product:
    | (Product & {
        user: {
          name: string;
          avatar: string | null;
        };
      })
    | null;
}
```

related product

[`https://www.prisma.io/docs/concepts/components/prisma-client/crud#read`](https://www.prisma.io/docs/concepts/components/prisma-client/crud#read)

```tsx
const terms = product?.name.split(' ').map((word) => ({
  name: {
    contains: word,
  },
}));
const relatedProducts = await client.product.findMany({
  where: {
    OR: terms,
    AND: {
      id: {
        not: product?.id,
      },
    },
  },
  take: 4,
});
```

---

Favorite model

```tsx
model Fav {
  id        Int      @id @default(autoincrement())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

```tsx
const alreadyExists = await client.fav.findFirst({
  where: {
    productId: +id.toString(),
    userId: user?.id,
  },
});

if (alreadyExists) {
  // DELETE deleteMany와는 다르게 Unique 속성으로만 삭제 가능
  await client.fav.delete({
    where: {
      id: alreadyExists.id,
    },
  });
} else {
  await client.fav.create({
    data: {
      user: {
        connect: { id: user?.id },
      },
      product: {
        connect: {
          id: +id.toString(),
        },
      },
    },
  });
}
```

Optimistic UI Update

: backend 처리를 기다리지 않고, 잘 처리가 될것을 기대하고 UI를 업데이트 시켜주는 것

```tsx
const onFavClick = () => {
  // Optimistic UI Update
  if (!data) return;
  /**
   * mutation의 첫번째 arg는 업데이트 될 캐쉬 데이터
   * 두번쨰 인자는 캐쉬 업데이트 후 백엔드에 요청을 통해 검증하는 용도로 default: true
   */
  mutate({ ...data, isLiked: !data?.isLiked }, false);
  // Backend process
  toggleFav({});
};
```

Unbound mutation

```tsx
// Optimistic UI Update
/**
 * mutation의 첫번째 arg는 업데이트 될 캐쉬 데이터
 * 두번쨰 인자는 캐쉬 업데이트 후 백엔드에 요청을 통해 검증하는 용도로 default: true
 */
boundMutate((prev) => prev && { ...prev, isLiked: !prev?.isLiked }, false);
/**
 * unbound mutation 첫번째 argㄴ는 어떤 데이터를 다룰것인지 key값 명시
 * 두번째 인자는 업데이트 될 데이터, 함수 형태로 prev값을 가져다 사용할 수 있음
 * 세번째 인자는 마찬가지로 백엔드 검증 요청 여부
 * key값만 전달하는 경우 단순한 refetch를 의미함
 */
unboundMutate('/api/users/myProfile', (prev: any) => ({ ok: !prev.ok }), false);
```

---

Count relation

fav 전체 데이터를 불러오는 것이 아닌 \_count 만 가져와서 사용

```tsx
const products = await client.product.findMany({
  include: {
    _count: {
      select: {
        favs: true,
      },
    },
  },
});
```

interface

```tsx
interface IProductResponse {
  ok: boolean;
  products: (Product & {
    _count: {
      favs: number;
    };
  })[];
}
```

---

useCoords hook

```tsx
import { useEffect, useState } from 'react';

type ICoordsState = {
  latitude: number | null;
  longitude: number | null;
};

export default function useCoords() {
  const [coords, setCoords] = useState<ICoordsState>({
    latitude: null,
    longitude: null,
  });

  function onSuccess({ coords: { latitude, longitude } }: GeolocationPosition) {
    setCoords({ latitude, longitude });
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(onSuccess);
  }, []);
  return coords;
}
```

---

```tsx
// 중복되는 형태의 모델을 Enum과 Kind를 통해 하나의 모델로 처리
model Record {
  id        Int      @id @default(autoincrement())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    Int
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  kind      Kind
}

enum Kind {
  Purchase
  Sale
  Fav
}
```

하나의 모델을 두 번 이상 참조하는 하는 경우

name을 통해 relation을 명시

```tsx
model User {
  id              Int         @id @default(autoincrement())
  phone           String?     @unique
  email           String?     @unique
  name            String
  avatar          String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  writtenReviews  Review[]    @relation("writtenReviews")
  receivedReviews Review[]    @relation("receivedReviews")

}

model Review {
  id           Int      @id @default(autoincrement())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  createdBy    User     @relation(name: "writtenReviews", fields: [createdById], references: [id], onDelete: Cascade)
  createdById  Int
  createdFor   User     @relation(name: "receivedReviews", fields: [createdForId], references: [id], onDelete: Cascade)
  createdForId Int
}
```

데이터베이스가 이미 존재하는 모델의 schema를 변경하고자 할때

1. 기존 데이터 베이스를 지운 후 생성
2. 새로 추가되는 필드를 옵셔널하게 생성
3. default value를 입력하여 기존 데이터에도 추가되도록 설정

---

Star Score

```tsx
{
  new Array(5).fill(0).map((_, idx) => (
    <svg
      key={idx}
      className={cls(
        'h-5 w-5',
        review.score > idx ? 'text-yellow-400' : 'text-gray-400'
      )}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 20 20'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
    </svg>
  ));
}
```

---

useUser hook 전역사용 (enter page 제외) → middleware의 역할을 함

\_app.tsx 에서 사용해주면 된다.

```tsx
_app.tsx;

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  useUser(pathname);

  return (
    <SWRConfig value={{ fetcher }}>
      <div className='w-full max-w-xl mx-auto'>
        <Component {...pageProps} />
      </div>
    </SWRConfig>
  );
}

export default MyApp;

useUser.ts;
export default function useUser(pathname?: string) {
  const router = useRouter();
  const url = '/api/users/me';
  const { data, error } = useSWR<IResponseUser>(
    pathname === '/enter' ? null : url
  );

  useEffect(() => {
    if (data && !data.ok) {
      router.replace('/enter');
    }
  }, [data, router]);

  return { user: data?.profile, isLoading: !data && !error };
}
```

---

메시지 생성 등으로 아래에 element가 생길 때, 해당 위치로 스크롤을 변경

```tsx
// Scroll Into View
const scrollRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  scrollRef?.current?.scrollIntoView();
});

<div ref={scrollRef} />;
```

---

SWR refreshInterval 설정

```tsx
const { data, mutate } = useSWR<IStreamResponse>(
  query.id ? `/api/streams/${query.id}` : null,
  {
    refreshInterval: 1000,
  }
);
```

---

Prisma Seed

Seeding database

시딩을 사용하면 데이터베이스에서 동일한 데이터를 일관되게 다시 생성할 수 있으며 다음을 수행\

1. 애플리케이션을 시작하는 데 필요한 데이터(예: 기본 언어 또는 기본 통화)

2. 개발 환경에서 애플리케이션을 검증하고 사용하기 위한 기본 데이터

```tsx
import { PrismaClient } from 'prisma/prisma-client';

const client = new PrismaClient();

async function main() {
  new Array(200).fill(0).forEach(async (_, idx) => {
    await client.stream.create({
      data: {
        name: String(idx),
        description: String(idx),
        price: idx,
        user: {
          connect: {
            id: 10,
          },
        },
      },
    });
    console.log(`${idx}/200`);
  });
}

main()
  .catch((e) => console.log(e))
  .finally(() => client.$disconnect());
```

package.json

```tsx
"prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
```

`npx prisma db seed` 로 실행

혹은 tsconfig.json

```tsx
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
  "ts-node": {
    "compilerOptions": {
      "module": "CommonJS"
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

---

Infinity scroll

useInfinityScroll.ts

```tsx
import { useEffect, useState } from 'react';

export function useInfiniteScroll() {
  const [page, setPage] = useState(1);
  function handleScroll() {
    if (
      document.documentElement.scrollTop + window.innerHeight >=
      document.documentElement.scrollHeight
    ) {
      setPage((p) => p + 1);
    }
  }
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  return page;
}
```

intex.tsx (front)

```tsx
const getKey = (pageIndex: number, previousPageData: IStreamsResponse) => {
  if (pageIndex === 0) return `/api/streams?page=1`;
  if (pageIndex + 1 > previousPageData.pages) return null;
  return `/api/streams?page=${pageIndex + 1}`;
};

const { data, setSize } = useSWRInfinite<IStreamsResponse>(getKey, fetcher);
const streams = data ? data.map((item) => item.streams).flat() : [];
const page = useInfiniteScroll();
useEffect(() => {
  setSize(page);
}, [setSize, page]);
```

index.ts (backend)

```tsx
const contentsPerPage = 5;
const {
  query: { page },
} = req;
const streamCount = await client.stream.count();
const streams = await client.stream.findMany({
  take: contentsPerPage,
  skip: (+page - 1) * contentsPerPage,
});
res.json({
  ok: true,
  streams,
  pages: Math.ceil(streamCount / contentsPerPage),
});
```

---

Image handling

input으로부터 받은 파일은 브라우져가 캐쉬하여 사용할 수 있음

```tsx
const avatar = watch('avatar');
useEffect(() => {
  if (avatar && avatar.length > 0) {
    // 유저가 파일을 선택하게 되면 브라우저의 메모리에 캐쉬된다.
    const file = avatar[0];
    setPreviewAvatar(URL.createObjectURL(file));
  }
}, [avatar]);
```

---

Cloudflare image upload

```
general method
1. File(browser) ---> Api Server ---> CloudFlare Server

direct creator upload (DCU)
2. File() ---> CloudFlare Server

DCU concepts

1. Client wants to upload ---> Api Server notice CF(with Api key)
2. CF send empty file URL ---> Api Server transport URL ---> Client
3. Client ---> Upload with URL directly

--> backend에 데이터를 넘기지 않고 client가 직접 업로드면서도 Api key를 노출 시키지 않음
```

[DOCs](https://developers.cloudflare.com/images/cloudflare-images/upload-images/direct-creator-upload/)

files.ts

```tsx
const reponse = await(
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/images/v2/direct_upload`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CF_TOKEN}`,
      },
    }
  )
).json();
```

response의 형태는 다음과 같음

이때 id는 백엔드에 저장, uploadURL을 통해 CF에 업로드

```tsx
{
  result: {
    id: 'f6fe9989-8fab-4ef0-16fe-faa2cbfb8100',
    uploadURL: 'https://upload.imagedelivery.net/0yNBnB1j4b45loBWzdicYQ/f6fe9989-8fab-4ef0-16fe-faa2cbfb8100'
  },
  result_info: null,
  success: true,
  errors: [],
  messages: []
}
```

CF Image variants

https://developers.cloudflare.com/images/cloudflare-images/resize-images/

```tsx
Resize images

Cloudflare 이미지는 다양한 사용을 고려하여 이미지 크기를 조정하는 방법을 지정하는 variants을 지원합니다. 최대 20개의 variants을 구성할 수 있습니다.

각 variants에는 크기가 조정된 이미지의 너비와 높이를 포함한 속성이 있습니다.

Scale down

이미지는 주어진 너비 또는 높이에 완전히 맞도록 크기가 축소되지만 확대되지는 않습니다.

Contain

이미지는 가로 세로 비율을 유지하면서 주어진 너비 또는 높이 내에서 가능한 한 크게 크기 조정(축소 또는 확대)됩니다.

Cover

너비와 높이로 지정된 전체 영역을 정확히 채우도록 이미지 크기가 조정되고 필요한 경우 잘립니다.

Crop

너비와 높이로 지정된 영역에 맞게 이미지가 축소되고 잘립니다.

```

---

Next Image

nextjs는 유저가 해당 영역으로 스크롤을 내렸을때 이미지를 다운 받는다

또한 lazy loading을 통해 완전히 다운받기 전까지 blur처리된 이미지를 보여준다 (local image의 경우)

아래와 같이 사용 가능하다. 이미지의 퀄리티는 0~100

```tsx
<Image src={test} placeholder='blur' quality={10} />
```

remote의 경우

next.config.json에 해당 서버의 도메인을 등록시킨다

```tsx
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['imagedelivery.net'],
  },
};
```

```tsx
<Image width={64} height={64} src={test} />
```

로컬 이미지와는 다르게 크기를 지정해 주어야 함, 크기를 지정할 수 없을때는 layout=’fill’ 이 유일한 옵션

```tsx
<div className='relative py-40'>
  <Image
    layout='fill'
    src={`https://imagedelivery.net/0yNBnB1j4b45loBWzdicYQ/${data?.product.image}/public`}
    className='bg-slate-300 object-cover'
  />
</div>
```

이미지는 최대 크기를 갖게 되고, position: absolute 상태이다. 따라서 parent container를 감싸고 그 크기를 조절하는 방식이 좋다. 또한 이미지는 object-fill 속성을 이용하여 적합한 형태를 사용할 수 있다.

blurDataURL (remote image blur 적용)

```tsx
src 이미지가 성공적으로 로드되기 전에 placeholder 이미지로 사용할 데이터 URL입니다. placeholder="blur"와 결합된 경우에만 적용됩니다. base64로 인코딩된 이미지여야 합니다. 확대되어 흐려지므로 아주 작은 이미지(10px 이하)를 권장합니다. 더 큰 이미지를 placeholder로 포함하면 애플리케이션 성능이 저하될 수 있습니다.

https://nextjs.org/docs/api-reference/next/image#blurdataurl

Remote 이미지에 블러 적용하기

placeholder를 blur로 지정하면 blurDataURL이 placeholder로 사용됩니다.

<Image
alt=""
src={`이미지 URL`}
placeholder="blur"
blurDataURL="https://i.ibb.co/ByhpsFY/blur.png"
/>

PNG Pixel
투명 BASE64 PNG 픽셀 생성기
https://png-pixel.com/
```

---

Dynamic import

```tsx
Dynamic Import

Next.js는 JavaScript용 ES2020 Dynamic import()를 지원합니다. 이를 통해 JavaScript 모듈을 동적으로 가져와서 작업할 수 있습니다. 또한 SSR과 함께 작동합니다. dynamic()은 React.lazy와 유사하게 사전 로드가 작동하도록 모듈의 최상위에 표시되어야 하므로 React 렌더링 내부에서 사용할 수 없습니다.
ex) 사용자가 검색을 입력한 후에만 브라우저에서 모듈을 동적으로 로드합니다.
```

import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('../components/hello'))

< div>
< DynamicComponent />
< /div>

```
https://nextjs.org/docs/advanced-features/dynamic-import

With custom loading component
Dynamic Component가 로드되는 동안 로드 상태를 렌더링하기 위해 선택적 로딩 컴포넌트를 추가할 수 있습니다.
https://nextjs.org/docs/advanced-features/dynamic-import#with-custom-loading-component
```

With custom loading component

dynamic 컴포넌트가 로드되는 동안 로드 상태를 렌더링하기 위해 선택적으로 로딩 컴포넌트를 추가할 수 있습니다.

```tsx
const DynamicComponent = dynamic(
  () =>
    new Promise((resolve) =>
      setTimeout(() => resolve(import('@components/dynamicComponent')), 3000)
    ),
  { ssr: false, suspense: true, loading: () => <span>loading from next</span> }
);
```

With no SSR

항상 server side에 모듈을 포함하고 싶지는 않을 수 있습니다. 예를 들어 모듈에 브라우저에서만 작동하는 라이브러리가 포함된 경우에는 ssr: false를 통해 CSR으로 실행합니다.

With suspense

suspense를 사용하면 React.lazy 및 React 18의 Suspense와 유사한 컴포넌트를 지연 로드(lazy-load)할 수 있습니다. fallback이 있는 클라이언트 측 또는 서버 측에서만 작동합니다.

동시 모드에서 완전한 SSR 지원은 아직 진행 중입니다.

```tsx
const DynamicLazyComponent = dynamic(() => import('../components/hello4'), {

suspense: true,

})

<Suspense fallback={`loading`}>

<DynamicLazyComponent />

</Suspense>
```

https://nextjs.org/docs/advanced-features/dynamic-import#with-custom-loading-component

---

\_document.tsx

app component와의 차이는 app component는 user가 페이지를 불러올때마다 브라우져에서 실행됨

document component는 서버에서 한번만 실행되고

`Html, Head, Main, NextScript`가 필수 요소이다.

(따라서 onclick과 같은 event를 실행시킬 수 없음)

document의 역할을 NextJs Html의 뼈대 역할을 함

Main Component 에서는 App component를 렌더링 한다

font 최적화

구글 폰트에 한해서 Nextjs 앱 빌드시 폰트를 미리 다운받도록 해준다.

script

```tsx
Script Component

Next.js Script 컴포넌트인 next/script는 HTML script 태그의 확장입니다.
이를 통해 개발자는 애플리케이션에서 써드 파티 스크립트의 로드되는 우선 순위를 설정할 수 있으므로 개발자 시간을 절약하면서 로드하는 성능을 향상시킬 수 있습니다.

beforeInteractive: 페이지가 interactive 되기 전에 로드
afterInteractive: (기본값) 페이지가 interactive 된 후에 로드
lazyOnload: 다른 모든 데이터나 소스를 불러온 후에 로드
worker: (실험적인) web worker에 로드
```

---

getServerSideProps

서버에서 미리 데이터를 fetch하여 props로 건내준다.

prisma client를 사용할 수 있는데 이때, prisma의 date 타입을 이해하지 못하기 때문에

`products: JSON.parse(JSON.stringify(products))` 같은 처리가 필요하다.

getServerSideProps는 페이지가 렌더될때마다 실행되며 캐시 데이터를 사용할 수 없다.

```tsx
const Home: NextPage<{
  products: ProductsType[];
}> = ({ products }) => {};
```

```tsx
export async function getServerSideProps() {
  const products = await client?.product.findMany({});
  console.log(products);
  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
}
```

SSR + SWR

```tsx
const Page: NextPage<{ products: ProductWithCount[] }> = ({ products }) => {
  return (
    <SWRConfig
      value={{
        fallback: {
          '/api/products': {
            ok: true,
            products,
          },
        },
      }}
    >
      <Home />
    </SWRConfig>
  );
};
```

처음 렌더링 될때 SWR의 캐쉬는 비어있다.

그 빈곳을 ServerSideProps를 통해 채워주고, Home을 렌더링하게되면 CSR, SSR의 이점을 모두 갖는다

---

SSR + Auth

withSession.ts

```tsx
export function withSsrSession(handler: any) {
  return withIronSessionSsr(handler, cookieOptions);
}
```

```tsx
export const getServerSideProps = withSsrSession(async function ({
  req,
}: NextPageContext) {
  const profile = await client.user.findUnique({
    where: { id: req?.session.user?.id }, // withSsrSession으로부터 값을 받음
  });
  return {
    props: {
      profile: JSON.parse(JSON.stringify(profile)),
    },
  };
});
```

---

getStaticProps

getStaticProps는 항상 서버에서 실행되고 클라이언트에서는 실행되지 않습니다. getStaticProps는 정적 HTML을 생성하므로 들어오는 request(예: 쿼리 매개변수 또는 HTTP 헤더)에 액세스할 수 없습니다. getStaticProps가 있는 페이지가 빌드 시 미리 렌더링되면 페이지 HTML 파일 외에도 Next.js가 getStaticProps 실행 결과를 포함하는 JSON 파일을 생성합니다.

https://nextjs.org/docs/basic-features/data-fetching/get-static-props

```tsx
export async function getStaticProps() {
  const blogPosts = readdirSync('./posts').map((file) => {
    const content = readFileSync(`./posts/${file}`, 'utf-8');
    return matter(content).data;
  });
  return {
    props: {
      posts: blogPosts.reverse(),
    },
  };
}

export default Blog;
```

getStaticPath

동적인 url을 사용하는곳에서 getStaticProps를 사용할때 필요하다

```tsx
import { readdirSync } from 'fs';
import { NextPage } from 'next';

const Post: NextPage = () => {
  return <div>hi</div>;
};

export function getStaticPaths() {
  const files = readdirSync('./posts').map((file) => {
    const [name, _] = file.split('.');
    return { params: { slug: name } };
  });
  console.log(files);
  return {
    paths: files,
    fallback: false,
  };
}

export function getStaticProps() {
  return {
    props: {},
  };
}

export default Post;
```

언제 getStaticPath를 사용해야 합니까?

동적 경로를 사용하는 페이지를 정적으로 pre-rendering하는 경우 getStaticPaths를 사용해야 합니다.

- 데이터를 헤드리스 CMS에서 가져올 때
- 데이터를 데이터베이스에서 가져올 때
- 데이터를 파일 시스템에서 가져올 때
- 데이터를 공개적으로 캐시할 수 있을 때
- 페이지는 SEO를 위해 pre-rendering되어야 하고 매우 빨라야 할 때

getStaticProps는 성능을 위해 CDN에서 캐시할 수 있는 HTML 및 JSON 파일을 생성합니다.

https://nextjs.org/docs/basic-features/data-fetching/get-static-paths#when-should-i-use-getstaticpaths

getStaticPaths는 언제 실행됩니까?

getStaticPaths는 프로덕션 환경에서 빌드하는 동안에만 실행되며 런타임에는 호출되지 않습니다.

https://nextjs.org/docs/basic-features/data-fetching/get-static-paths#when-does-getstaticpaths-run

---

```tsx
미들웨어 (_middleware 사용)
중간에 request를 가로챔

Server (getInitialProps 또는 getServerSideProps 사용)
런타임 시 서버 사이드 렌더링

Static (초기 props를 사용하지 않음)
static HTML로 자동으로 렌더링됨

SSG (getStaticProps 사용)
static HTML + JSON으로 자동으로 생성됨
```

---

Incremental static regeration (ISR)

```tsx
Incremental Static Regeneration
빌드 타임때, pre-render된 페이지에 대한 요청이 이루어지면 처음에는 캐시된 페이지가 표시됩니다.
1. 초기 요청 후 10초 이전에 페이지에 오는 모든 요청은 캐시되고, 즉각적으로 보여줍니다.
2. 10초 후 다음 요청은 여전히 캐시된 페이지를 표시합니다.
3. Next.js는 백그라운드에서 페이지 regeneration을 트리거합니다.
4. 페이지가 성공적으로 생성되면 Next.js는 캐시를 무효화하고 업데이트된 페이지를 표시합니다. 백그라운드 regeneration이 실패하면 이전 페이지는 여전히 변경되지 않습니다.
https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration

On-demand Revalidation (Beta)
revalidate 시간을 60으로 설정하면 모든 방문자는 1분 동안 동일한 버전의 사이트를 보게 됩니다. 캐시를 무효화하는 유일한 방법은 1분이 지난 후 누군가가 해당 페이지를 방문하는 것입니다.
Next.js v12.1.0부터 on-demand Incremental Static Regeneration을 지원하여 특정 페이지의 Next.js 캐시를 수동으로 제거할 수 있습니다. 이렇게 하면 사이트를 수동으로 업데이트할 수 있습니다.
https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration#on-demand-revalidation-beta
```

---

getStaticPath , fallback

```tsx
fallback: 'blocking'

fallback이 'blocking'인 경우 getStaticPaths에서 반환되지 않은 새 경로는 SSR과 동일하게 HTML이 생성될 때까지 기다렸다가 이후 요청을 위해 캐시되어 path당 한 번만 발생합니다. fallback: 'blocking'은 기본적으로 생성된 페이지를 업데이트하지 않습니다. 생성된 페이지를 업데이트하려면 fallback: blocking과 함께 ISR을 사용하십시오.

https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-blocking

await new Promise((resolve) => setTimeout(resolve, 5000));
```

```tsx
fallback: false
fallback이 false인 경우 getStaticPaths에서 반환하지 않은 모든 경로는 404 페이지가 됩니다. next build가 실행되면 Next.js는 getStaticPaths가 fallback: false를 반환했는지 확인한 다음 getStaticPaths가 반환한 경로만 빌드합니다. 이 옵션은 생성할 경로가 적거나 새 페이지 데이터가 자주 추가되지 않는 경우에 유용합니다.

fallback: true
fallback이 true인 경우, 빌드 시 생성되지 않은 경로는 404 페이지를 생성하지 않습니다. 대신 Next.js는 이러한 경로에 대한 첫 번째 요청에서 페이지의 "fallback" 버전(isFallback)을 제공합니다. Google과 같은 웹 크롤러는 fallback 서비스를 제공하지 않으며 대신 경로는 fallback: 'blocking'과 같이 작동합니다. 백그라운드에서 Next.js는 요청된 경로 HTML 및 JSON을 정적으로 생성합니다.

fallback: true가 언제 유용합니까?
fallback: true는 데이터에 의존하는 static 페이지가 많은 경우에 유용합니다(예: 매우 큰 전자 상거래 사이트). 모든 제품 페이지를 미리 렌더링하려면 빌드 시간이 매우 오래 걸립니다.

Fallback pages
router를 사용하여 fallback이 렌더링되고 있는지 감지할 수 있습니다. fallback이 렌더링되고 있다면 router.isFallback은 true가 됩니다.
```

// 페이지가 아직 생성되지 않은 경우 getStaticProps() 실행이 완료될 때까지 아래 로딩이 표시됩니다.
if (router.isFallback) {
return < div>Loading...< /div>
}

```
https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-pages

fallback: blocking
getStaticProps나 getStaticPaths를 가지고 있는 페이지에 방문할 때, 만약 그 페이지에 해당하는 HTML 파일이 없다면, fallback: blocking은 유저를 잠시동안 기다리게 만들고, 그동안 백그라운드에서 페이지를 만들어서 유저에게 넘겨줍니다.
```

---

## React 18

### Suspense + SWR

SWR을 사용하는 컴포넌트를 분리하여 사용할 수 있다

Suspense의 장점은 loading state를 분리하여 데이터가 있다고 생각하고 작업이 가능하다

또한 여러개의 Suspense를 사용할 수 있다.

Suspense는 각 라이브러리에서 지원하는 방식으로 사용해야 한다.

SWR의 경우

```tsx
const Page: NextPage = () => {
  return (
    <SWRConfig
      value={{
        suspense: true,
        // fallback: {
        //   '/api/users/me': { ok: true, profile },
        // },
      }}
    >
      <Profile />
    </SWRConfig>
  );
};
```

- 여러개의 SWR

  ```tsx
  const Reviews: NextPage = () => {
    const { data } = useSWR<IReviewsResponse>('/api/reviews');
    return (
      <>
        {data?.reviews.map((review) => (
          <div key={review.id} className='mt-12'>
            <div className='flex space-x-4 items-center'>
              <div className='w-12 h-12 rounded-full bg-slate-500' />
              <div>
                <h4 className='text-sm font-bold text-gray-800'>
                  {review.createdBy.name}
                </h4>
                <div className='flex items-center'>
                  {new Array(5).fill(0).map((_, idx) => (
                    <svg
                      key={idx}
                      className={cls(
                        'h-5 w-5',
                        review.score > idx ? 'text-yellow-400' : 'text-gray-400'
                      )}
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                      aria-hidden='true'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <div className='mt-4 text-gray-600 text-sm'>
              <p>{review.review}</p>
            </div>
          </div>
        ))}
      </>
    );
  };

  const MiniProfile: NextPage = () => {
    const { user, isLoading } = useUser();
    return (
      <div className='flex items-center mt-4 space-x-3'>
        {user?.avatar ? (
          <Image
            width={64}
            height={64}
            src={`https://imagedelivery.net/0yNBnB1j4b45loBWzdicYQ/${user?.avatar}/avatar`}
            className='w-16 h-16 bg-slate-500 rounded-full'
            alt={user?.name}
          />
        ) : (
          <div className='w-16 h-16 bg-slate-500 rounded-full' />
        )}

        <div className='flex flex-col'>
          <span className='font-medium text-gray-900'>{user?.name}</span>
          <Link href='/profile/edit'>
            <a className='text-sm text-gray-700'>Edit profile &rarr;</a>
          </Link>
        </div>
      </div>
    );
  };

  const Profile: NextPage = () => {
    return (
      <Layout hasTabBar title='나의 캐럿'>
        <Suspense fallback='Loading profile...'>
          <MiniProfile />
        </Suspense>

        <Suspense fallback='Loading reviews...'>
          <Reviews />
        </Suspense>
      </Layout>
    );
  };

  const Page: NextPage = () => {
    return (
      <SWRConfig
        value={{
          suspense: true,
          // fallback: {
          //   '/api/users/me': { ok: true, profile },
          // },
        }}
      >
        <Profile />
      </SWRConfig>
    );
  };

  export default Page;
  ```

---

### Server Component

서버 컴포넌트는 서버사이드 렌더링과 다르다.

말그대로 서버에서 동작하는 컴포넌트로, 페이지에 접근했을때 모든 클라이언트 컴포넌트를 볼 수 있다.

서버 컴포넌트 렌더링이 끝나면 http stream를 통해 클라이언트로 렌더링된 컴포넌트 결과를 보내준다.

coins.server.tsx

```tsx
import { Suspense } from 'react';

let finished = false;
function List() {
  if (!finished) {
    throw Promise.all([
      new Promise((resolve) => setTimeout(resolve, 5000)),
      new Promise((resolve) => {
        finished = true;
        resolve('');
      }),
    ]);
  }
  return <ul>xxxxx</ul>;
}

export default function Coins() {
  return (
    <div>
      <h1>Welcome to RSC</h1>
      <Suspense fallback='Rendering in the server...'>
        <List />
      </Suspense>
    </div>
  );
}
```

외부 API

```tsx
import { Suspense } from 'react';

const cache: any = {};
function fetchData(url: string) {
  if (!cache[url]) {
    throw fetch(url)
      .then((r) => r.json())
      .then((json) => (cache[url] = json.slice(0, 50)));
  }
  return cache[url];
}

function List() {
  const coins = fetchData('https://api.coinpaprika.com/v1/coins');
  console.log(coins);
  return (
    <ul>
      {coins.map((coin: any) => (
        <li key={coin.id}>
          {coin.name} / {coin.symbol}
        </li>
      ))}
    </ul>
  );
}

export default function Coins() {
  return (
    <div>
      <h1>Welcome to RSC</h1>
      <Suspense fallback='Rendering in the server...'>
        <List />
      </Suspense>
    </div>
  );
}
```

```tsx
import { Suspense } from 'react';

const cache: any = {};
function fetchData(url: string) {
  if (!cache[url]) {
    throw Promise.all([
      fetch(url)
        .then((r) => r.json())
        .then((json) => (cache[url] = json)),
      new Promise((resolve) =>
        setTimeout(resolve, Math.round(Math.random() * 10555))
      ),
    ]);
  }
  return cache[url];
}

function Coin({ id, name, symbol }: any) {
  const {
    quotes: {
      USD: { price },
    },
  } = fetchData(`https://api.coinpaprika.com/v1/tickers/${id}`);
  return (
    <span>
      {name} / {symbol}: ${price}
    </span>
  );
}

function List() {
  const coins = fetchData('https://api.coinpaprika.com/v1/coins');
  return (
    <div>
      <h4>List is done</h4>
      <ul>
        {coins.slice(0, 10).map((coin: any) => (
          <li key={coin.id}>
            <Suspense fallback={`Coin ${coin.name} is loading`}>
              <Coin {...coin} />
            </Suspense>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Coins() {
  return (
    <div>
      <h1>Welcome to RSC</h1>
      <Suspense fallback='Rendering in the server...'>
        <List />
      </Suspense>
    </div>
  );
}
```

## Deploy

### production branch

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a7b719a6-3beb-4eb2-84ac-8ffb505e3015/Untitled.png)

new branch (indexes)

`pscale connect carrot-market indexes`

db 변경을 main branch에 직접 변경하는 대신 indexes branch에 반영한다.

실 사용중인 db 보호, 준비가 되면 main branch에 merge하여 변경사항을 반영한다 (git과 유사)

### new branch (indexes)

`pscale connect carrot-market indexes`

db 변경을 main branch에 직접 변경하는 대신 indexes branch에 반영한다.

실 사용중인 db 보호, 준비가 되면 main branch에 merge하여 변경사항을 반영한다 (git과 유사)

### @@index([])

PlanetScale에서 foreign key로 구현되지 않기 때문에, column에 automatic index가 없다.

따라서 메뉴얼하게 index를 생성해주어야 한다
