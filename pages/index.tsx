import type { GetServerSideProps, NextPage } from 'next';
import FloatingButton from '@components/floating-button';
import Item from '@components/item';
import Layout from '@components/layout';
import useUser from '@libs/client/useUser';
import Head from 'next/head';
import useSWR, { SWRConfig } from 'swr';
import { Product, User } from 'prisma/prisma-client';
import Image from 'next/image';
import client from '@libs/server/client';

type ProductWithCount = Product & {
  _count: {
    favs: number;
  };
};
interface IProductResponse {
  ok: boolean;
  products: ProductWithCount[];
}
const Home: NextPage = () => {
  const { user, isLoading } = useUser();
  const { data } = useSWR<IProductResponse>('/api/products');
  return (
    <Layout title='홈' hasTabBar>
      <Head>
        <title>Home</title>
      </Head>
      <div className='flex flex-col space-y-5 divide-y'>
        {data
          ? data?.products?.map(({ id, name, price, _count }) => (
              <Item
                id={id}
                key={id}
                title={name}
                price={price}
                hearts={_count?.favs || 0}
              />
            ))
          : 'Loading...'}
        <FloatingButton href='/products/upload'>
          <svg
            className='h-6 w-6'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M12 6v6m0 0v6m0-6h6m-6 0H6'
            />
          </svg>
        </FloatingButton>
      </div>
    </Layout>
  );
};

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

export const getServerSideProps: GetServerSideProps = async () => {
  console.log('SSR');
  const products = await client.product.findMany({});
  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
};
export default Page;
