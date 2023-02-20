import { useRouter } from 'next/router';
import { User } from 'prisma/prisma-client';
import { useEffect } from 'react';
import useSWR from 'swr';

interface IResponseUser {
  ok: boolean;
  profile: User;
  error: any;
}

export default function useUser(pathname?: string) {
  const router = useRouter();
  const url = typeof window === 'undefined' ? null : '/api/users/me';
  const { data, error } = useSWR<IResponseUser>(
    pathname?.includes('/enter') ? null : url
  );

  useEffect(() => {
    if (data && !data.ok) {
      router.replace('/enter');
    }
  }, [data, router]);

  return { user: data?.profile, isLoading: !data && !error };
}
