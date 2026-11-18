import { useState, type SubmitEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackHeader from '@/components/common/BackHeader';
import FormField from '@/components/common/FormField';
import InputField from '@/components/auth/InputField';
import Button from '@/components/auth/Button';
import { SIGNUP_MESSAGE } from '@/constants/auth';
import { useKeyboardViewportStyle } from '@/hooks/useKeyboardViewportStyle';
import { useSignupForm } from '@/hooks/useSignupForm';
import { isValidEmail } from '@/utils/auth';

const SignupEmailPage = () => {
  const navigate = useNavigate();
  const serverError = (useLocation().state as { emailError?: string } | null)
    ?.emailError;
  const { account, setAccount } = useSignupForm();
  const keyboardStyle = useKeyboardViewportStyle();
  const [email, setEmail] = useState(account.email);
  const [touched, setTouched] = useState(false);
  const [showServerError, setShowServerError] = useState(!!serverError);

  const trimmed = email.trim();
  const isValid = isValidEmail(trimmed);

  const error =
    touched && trimmed !== '' && !isValid
      ? SIGNUP_MESSAGE.email
      : showServerError
        ? serverError
        : '';

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) {
      setTouched(true);
      return;
    }

    setAccount({ ...account, email: trimmed });
    navigate('/signup/password');
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex min-h-dvh flex-col"
      style={keyboardStyle}
    >
      <BackHeader onBack={() => navigate('/login')} />

      <div className="flex flex-1 flex-col px-5 pt-8">
        <h1 className="text-[22px] leading-tight font-bold text-text-title">
          로그인에 사용할
          <br />
          이메일을 입력해주세요.
        </h1>

        <div className="mt-20">
          <FormField label="이메일" htmlFor="signup-email">
            <InputField
              id="signup-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="이메일을 입력해주세요."
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setShowServerError(false);
              }}
              onBlur={() => setTouched(true)}
              error={error}
            />
          </FormField>
        </div>
      </div>

      <div className="sticky bottom-0 px-5 pt-4 pb-10">
        <Button type="submit" disabled={!isValid}>
          확인
        </Button>
      </div>
    </form>
  );
};

export default SignupEmailPage;
