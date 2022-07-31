import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { SWRConfig } from 'swr';
import { fetcher } from '@libs/client/utils';
import { useRouter } from 'next/router';
import useUser from '@libs/client/useUser';
import Script from 'next/script';

function MyApp({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter();
  useUser(pathname);

  return (
    <SWRConfig value={{ fetcher }}>
      <div className='w-full max-w-xl mx-auto'>
        <Component {...pageProps} />
      </div>
      <Script
        src='https://developers.kakao.com/sdk/js/kakao.js'
        strategy='lazyOnload'
      />
      {/* <Script
        src='https://connect.facebook.net/en_US/sdk.js'
        onLoad={() => {
          windows.fbAsyncInit = function () {
            FB.init({
              appId: 'your-app-id',
              autoLogAppEvents: true,
              xfbml: true,
              version: 'v13.0',
            });
          };
        }}
      /> */}
    </SWRConfig>
  );
}

export default MyApp;
