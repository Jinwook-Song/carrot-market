import { cls } from '@libs/client/utils';

interface ButtonProps {
  large?: boolean;
  text: string;
  disabled?: boolean;
  [key: string]: any;
}

export default function Button({
  large = false,
  onClick,
  text,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cls(
        'w-full bg-orange-500  text-white  px-4 border border-transparent rounded-md shadow-sm font-medium focus:ring-2 focus:ring-offset-2  focus:outline-none',
        large ? 'py-3 text-base' : 'py-2 text-sm',
        disabled
          ? 'cursor-not-allowed hover:bg-gray-600 focus:ring-gray-500'
          : 'cursor-pointer hover:bg-orange-600 focus:ring-orange-500'
      )}
    >
      {text}
    </button>
  );
}
