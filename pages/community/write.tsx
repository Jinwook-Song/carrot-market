import type { NextPage } from 'next';
import Button from '@components/button';
import Layout from '@components/layout';
import TextArea from '@components/textarea';
import { useForm } from 'react-hook-form';
import useMutation from '@libs/client/useMutation';
import { useEffect } from 'react';
import { Post } from 'prisma/prisma-client';
import { useRouter } from 'next/router';
import useCoords from '@libs/client/useCoords';

interface IWriteForm {
  question: string;
}

interface IPostResponse {
  ok: boolean;
  post: Post;
}

const Write: NextPage = () => {
  const { latitude, longitude } = useCoords();
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<IWriteForm>();
  const [post, { loading, data }] = useMutation<IPostResponse>('/api/posts');
  const onValid = (data: IWriteForm) => {
    if (loading) return;
    post({ ...data, latitude, longitude });
    reset();
  };
  useEffect(() => {
    if (data && data.ok) {
      router.push(`/community/${data.post.id}`);
    }
  }, [data, router]);
  return (
    <Layout canGoBack title='Write Post'>
      <form onSubmit={handleSubmit(onValid)} className='p-4 space-y-4'>
        <TextArea
          register={register('question', { required: true, minLength: 5 })}
          required
          placeholder='Ask a question!'
        />
        <Button disabled={loading} text={loading ? 'Loading...' : 'Submit'} />
      </form>
    </Layout>
  );
};

export default Write;
