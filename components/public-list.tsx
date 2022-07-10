import { Product } from 'prisma/prisma-client';
import useSWR from 'swr';
import Item from './item';

interface ProductListProps {
  kind: 'favs' | 'sales' | 'purchases';
}

interface IRecord {
  id: number;
  product: Product & {
    _count: {
      favs: number;
    };
  };
}

interface IProductListResponse {
  [key: string]: IRecord[];
}

export default function ProductList({ kind }: ProductListProps) {
  const { data } = useSWR<IProductListResponse>(`/api/users/me/${kind}`);
  return data ? (
    <>
      {data[kind]?.map((record) => (
        <Item
          id={record.product.id}
          key={record.id}
          title={record.product.name}
          price={record.product.price}
          hearts={record.product._count.favs}
        />
      ))}
    </>
  ) : null;
}
