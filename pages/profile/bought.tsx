import type { NextPage } from 'next';
import Layout from '@components/layout';
import ProductList from '@components/public-list';

const Bought: NextPage = () => {
  return (
    <Layout title='구매내역' canGoBack>
      <ProductList kind='purchases' />
    </Layout>
  );
};

export default Bought;
