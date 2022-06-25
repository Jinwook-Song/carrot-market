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
