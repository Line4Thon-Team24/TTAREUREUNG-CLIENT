import { useState, type SubmitEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import BackHeader from '@/components/common/BackHeader';
import FormField from '@/components/common/FormField';
import InputField from '@/components/auth/InputField';
import Button from '@/components/auth/Button';
import { PASSWORD_RULE_LABEL, SIGNUP_MESSAGE } from '@/constants/auth';
import { useKeyboardViewportStyle } from '@/hooks/useKeyboardViewportStyle';
import { useSignupForm } from '@/hooks/useSignupForm';
import { getPasswordRules, isValidSignupPassword } from '@/utils/auth';

const SignupPasswordPage = () => {
  const navigate = useNavigate();
  const { account, setAccount } = useSignupForm();
  const keyboardStyle = useKeyboardViewportStyle();
  const [password, setPassword] = useState(account.password);
  const [confirm, setConfirm] = useState(account.password);

  // 이메일 입력 없이 주소로 바로 들어온 경우 첫 단계로 이동
  if (!account.email) return <Navigate to="/signup" replace />;

  const rules = getPasswordRules(password);
  const isMatch = confirm !== '' && password === confirm;
  const canSubmit = isValidSignupPassword(password) && isMatch;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setAccount({ ...account, password });
    navigate('/signup/guardian');
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex min-h-dvh flex-col"
      style={keyboardStyle}
    >
      <BackHeader />

      <div className="flex flex-1 flex-col px-5 pt-8">
        <h1 className="text-[22px] leading-tight font-bold text-text-title">
          특수문자 포함 8자 이상의
          <br />
          비밀번호를 입력해주세요.
        </h1>

        <div className="mt-20 flex flex-col gap-6">
          <FormField label="비밀번호" htmlFor="signup-password">
            <div>
              <InputField
                id="signup-password"
                type="password"
                autoComplete="new-password"
                autoFocus
                placeholder="비밀번호를 입력해주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <ul className="mt-1 flex gap-2 px-1 text-[12px]">
                {(['length', 'charset'] as const).map((key) => (
                  <li
                    key={key}
                    className={`flex items-center gap-1 ${rules[key] ? 'text-border-focus' : 'text-text-sub'}`}
                  >
                    <Check size={14} strokeWidth={3} aria-hidden />
                    {PASSWORD_RULE_LABEL[key]}
                  </li>
                ))}
              </ul>
            </div>
          </FormField>

          <FormField label="비밀번호 확인" htmlFor="signup-password-confirm">
            <div>
              <InputField
                id="signup-password-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="비밀번호를 입력해주세요"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={
                  confirm !== '' && !isMatch
                    ? SIGNUP_MESSAGE.passwordMismatch
                    : undefined
                }
              />
              {isMatch && (
                <p className="mt-1 px-1 text-[12px] text-border-focus">
                  {SIGNUP_MESSAGE.passwordMatch}
                </p>
              )}
            </div>
          </FormField>
        </div>
      </div>

      <div className="sticky bottom-0 px-5 pt-4 pb-10">
        <Button type="submit" disabled={!canSubmit}>
          확인
        </Button>
      </div>
    </form>
  );
};

export default SignupPasswordPage;
