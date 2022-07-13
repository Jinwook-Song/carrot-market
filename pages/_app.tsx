import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { fetcher } from '@libs/client/utils';
import { useRouter } from 'next/router';
import useUser from '@libs/client/useUser';

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
