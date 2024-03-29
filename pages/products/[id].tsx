import type { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Button from '@components/button';
import Layout from '@components/layout';
import { useRouter } from 'next/router';
import useSWR, { useSWRConfig } from 'swr';
import { Fav, Product, User } from 'prisma/prisma-client';
import Link from 'next/link';
import useMutation from '@libs/client/useMutation';
import { cls, prismaTranslate } from '@libs/client/utils';
import useUser from '@libs/client/useUser';
import Image from 'next/image';
import client from '@libs/server/client';

interface IProductWithUser extends Product {
  user: User;
}
interface IProductDetailResponse {
  ok: boolean;
  product: IProductWithUser;
  isLiked: boolean;
  relatedProducts: Product[];
}

const ItemDetail: NextPage<IProductDetailResponse> = ({
  product,
  relatedProducts,
  isLiked,
}) => {
  const { user, isLoading } = useUser();
  const {
    isFallback,
    query: { id },
  } = useRouter();
  const { data, mutate: boundMutate } = useSWR<IProductDetailResponse>(
    id ? `/api/products/${id}` : null
  );
  const { mutate: unboundMutate } = useSWRConfig();
  const [toggleFav] = useMutation(`/api/products/${id}/fav`);
  const onFavClick = () => {
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
    // unboundMutate(
    //   '/api/users/me',
    //   (prev: any) => ({ ok: !prev.ok }),
    //   false
    // );
    // Backend process
    toggleFav({});
  };

  if (isFallback) {
    return (
      <Layout title='Loaidng for youuuuuuu'>
        <span>I love you</span>
      </Layout>
    );
  }
  return (
    <Layout canGoBack>
      <div className='px-4  py-4'>
        <div className='mb-8'>
          <div className='relative py-40'>
            <Image
              layout='fill'
              src={`https://imagedelivery.net/0yNBnB1j4b45loBWzdicYQ/${product.image}/public`}
              className='bg-slate-300 object-cover'
              alt={product.name}
            />
          </div>

          <div className='flex cursor-pointer py-3 border-t border-b items-center space-x-3'>
            <Image
              width={48}
              height={48}
              src={`https://imagedelivery.net/0yNBnB1j4b45loBWzdicYQ/${product.user.avatar}/avatar`}
              className='w-12 h-12 rounded-full bg-slate-300'
              alt={product.user.name}
            />
            <div>
              <p className='text-sm font-medium text-gray-700'>
                {product?.user.name}
              </p>
              <Link href={`/users/profiles/${product?.userId}`}>
                <a className='text-xs font-medium text-gray-500'>
                  View profile &rarr;
                </a>
              </Link>
            </div>
          </div>
          <div className='mt-5'>
            <h1 className='text-3xl font-bold text-gray-900'>
              {product?.name}
            </h1>
            <span className='text-2xl block mt-3 text-gray-900'>
              ${product?.price}
            </span>
            <p className=' my-6 text-gray-700'>{product?.description}</p>
            <div className='flex items-center justify-between space-x-2'>
              <Button large text='Talk to seller' />
              <button
                onClick={onFavClick}
                className={cls(
                  'p-3 rounded-md flex items-center justify-center hover:bg-gray-100 ',
                  isLiked
                    ? 'text-red-500  hover:text-red-600'
                    : 'text-gray-400  hover:text-gray-500'
                )}
              >
                {isLiked ? (
                  <svg
                    className='w-6 h-6'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      fillRule='evenodd'
                      d='M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z'
                      clipRule='evenodd'
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className='h-6 w-6 '
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
                      d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <div>
          <h2 className='text-2xl font-bold text-gray-900'>Similar items</h2>
          <div className=' mt-6 grid grid-cols-2 gap-4'>
            {relatedProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`}>
                <a>
                  <div className='h-56 w-full mb-4 bg-slate-300' />
                  <h3 className='text-gray-700 -mb-1'>{product.name}</h3>
                  <span className='text-sm font-medium text-gray-900'>
                    ${product.price}
                  </span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  if (!ctx.params?.id) {
    return {
      props: {},
    };
  }
  const id = ctx.params?.id;
  const product = await client.product.findUnique({
    where: {
      id: +id?.toString()!,
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
  const isLiked = false;
  return {
    props: {
      product: prismaTranslate(product),
      relatedProducts: prismaTranslate(relatedProducts),
      isLiked: prismaTranslate(isLiked),
    },
  };
};

export default ItemDetail;
