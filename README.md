# Carrot Market

| 프로젝트 기간 | 22.06.04 ~         |
| ------------- | ------------------ |
| 프로젝트 목적 | NextJS, Serverless |
| Github        | ‣                  |

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
