import { useId, useState, type InputHTMLAttributes, type Ref } from 'react';
import eyeOffIcon from '@/assets/icons/eye-off.svg';
import eyeOnIcon from '@/assets/icons/eye-on.svg';

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  type?: 'text' | 'email' | 'password';
  error?: string;
  ref?: Ref<HTMLInputElement>;
};

export default function InputField({
  type = 'text',
  error,
  className = '',
  'aria-describedby': describedBy,
  ...props
}: InputFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const errorId = useId();
  const describedByIds =
    [describedBy, error ? errorId : undefined].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type={isPassword && visible ? 'text' : type}
          inputMode={type === 'email' ? 'email' : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds}
          className={`w-full rounded-xl border border-border-divider p-4 text-[16px] font-medium text-text-body transition-colors outline-none placeholder:text-text-placeholder focus:border-border-focus ${isPassword ? 'pr-14' : ''} ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            aria-label={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
            onClick={() => setVisible((prev) => !prev)}
            className="absolute top-1/2 right-5.5 flex -translate-y-1/2"
          >
            {visible ? (
              <img src={eyeOnIcon} alt="" width={20} height={20} />
            ) : (
              <img src={eyeOffIcon} alt="" width={20} height={20} />
            )}
          </button>
        )}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1 px-1 text-[12px] text-status-missed"
        >
          {error}
        </p>
      )}
    </div>
  );
}
