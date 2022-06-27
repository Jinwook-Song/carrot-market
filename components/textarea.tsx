import { UseFormRegisterReturn } from 'react-hook-form';

interface TextAreaProps {
  label?: string;
  name?: string;
  required: boolean;
  register: UseFormRegisterReturn;
  placeholder?: string;
}

export default function TextArea({
  label,
  name,
  required,
  register,
  placeholder,
}: TextAreaProps) {
  return (
    <div>
      {label ? (
        <label
          htmlFor={name}
          className='mb-1 block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
      ) : null}
      <textarea
        id={name}
        {...register}
        required={required}
        placeholder={placeholder}
        className='mt-1 shadow-sm w-full focus:ring-orange-500 rounded-md border-gray-300 focus:border-orange-500 '
        rows={4}
      />
    </div>
  );
}
