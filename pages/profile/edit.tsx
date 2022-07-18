import type { NextPage } from 'next';
import Button from '@components/button';
import Input from '@components/input';
import Layout from '@components/layout';
import useUser from '@libs/client/useUser';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { EMAIL_VALIDATION_CHECK } from '@libs/client/utils';
import useMutation from '@libs/client/useMutation';
import { useRouter } from 'next/router';

interface IEditProfileForm {
  avatar?: FileList;
  name?: string;
  email?: string;
  phone?: string;
  formErrors?: string;
}

interface IEditProfileResponse {
  ok: boolean;
  error?: string;
}

const EditProfile: NextPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [isEmailLogin, setIsEmailLogin] = useState(true);

  const {
    register,
    setValue,
    handleSubmit,
    getValues,
    setError,
    watch,
    formState: { errors },
    clearErrors,
  } = useForm<IEditProfileForm>();

  useEffect(() => {
    if (user?.email) {
      setValue('email', user.email);
      setIsEmailLogin(true);
    }
    if (user?.phone) {
      setValue('phone', user.phone);
      setIsEmailLogin(false);
    }
    if (user?.name) {
      setValue('name', user.name);
    }
  }, [user, setValue]);

  const [updateProfile, { data, loading }] =
    useMutation<IEditProfileResponse>('/api/users/me');

  const onValid = async () => {
    if (loading) return;
    const { name, email, phone, avatar } = getValues();

    if (avatar && avatar.length > 0 && user) {
      const { id, uploadURL } = await (await fetch('/api/files')).json();
      const form = new FormData();
      form.append('file', avatar[0], String(user?.id));
      await fetch(uploadURL, {
        method: 'POST',
        body: form,
      });

      return;
    } else {
      updateProfile({ name, email, phone });
    }
  };

  useEffect(() => {
    if (data && !data.ok && data.error) {
      setError('formErrors', { message: data.error });
      setInterval(() => {
        clearErrors();
      }, 5000);
    }
    if (data && data.ok) {
      router.replace(`/profile`);
    }
  }, [data, setError, router, clearErrors]);

  const [previewAvatar, setPreviewAvatar] = useState<string>();
  const avatar = watch('avatar');
  useEffect(() => {
    if (avatar && avatar.length > 0) {
      // 유저가 파일을 선택하게 되면 브라우저의 메모리에 캐쉬된다.
      const file = avatar[0];
      setPreviewAvatar(URL.createObjectURL(file));
    }
  }, [avatar]);

  return (
    <Layout canGoBack title='Edit Profile'>
      <form onSubmit={handleSubmit(onValid)} className='py-10 px-4 space-y-4'>
        <div className='flex items-center space-x-3'>
          <img
            src={previewAvatar}
            className='w-14 h-14 rounded-full bg-slate-500'
          />
          <label
            htmlFor='picture'
            className='cursor-pointer py-2 px-3 border hover:bg-gray-50 border-gray-300 rounded-md shadow-sm text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 text-gray-700'
          >
            Change
            <input
              {...register('avatar')}
              id='picture'
              type='file'
              className='hidden'
              accept='image/*'
            />
          </label>
        </div>
        <Input
          register={register('name', {
            required: 'Name is required.',
          })}
          required
          label='Name'
          name='name'
          type='text'
        />
        {isEmailLogin ? (
          <Input
            register={register('email', {
              required: 'Email is required.',
              pattern: {
                value: EMAIL_VALIDATION_CHECK,
                message: 'Please enter a valid email.',
              },
            })}
            required
            label='Email address'
            name='email'
            type='email'
          />
        ) : (
          <Input
            register={register('phone', {
              required: 'Phone number is required.',
            })}
            required
            label='Phone number'
            name='phone'
            type='text'
            kind='phone'
          />
        )}

        {errors.name ? (
          <span className='my-2 text-red-500 font-medium text-center block'>
            {errors.name.message}
          </span>
        ) : errors.email ? (
          <span className='my-2 text-red-500 font-medium text-center block'>
            {errors.email.message}
          </span>
        ) : errors.phone ? (
          <span className='my-2 text-red-500 font-medium text-center block'>
            {errors.phone.message}
          </span>
        ) : errors.formErrors ? (
          <span className='my-2 text-red-500 font-medium text-center block'>
            {errors.formErrors.message}
          </span>
        ) : null}

        <Button text={loading ? 'Loading...' : 'Update profile'} />
      </form>
    </Layout>
  );
};

export default EditProfile;
