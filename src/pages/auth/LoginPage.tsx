import { useState, type SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '@/components/auth/InputField';
import Button from '@/components/auth/Button';
import type { LoginForm, LoginErrors } from '@/types/auth';
import { validateLogin } from '@/utils/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<LoginErrors>({});

  const hasError = Boolean(errors.email || errors.password);
  const canSubmit = form.email !== '' && form.password !== '' && !hasError;

  // 입력 수정하면 에러 상태 해제
  const handleChange = (key: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors({});
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    const nextErrors = validateLogin(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    navigate('/schedule', { replace: true });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex min-h-dvh flex-col px-5 pb-10"
    >
      <div className="flex flex-1 flex-col justify-center pt-20 pb-10 text-center">
        <h1 className="text-[24px] font-extrabold text-text-title">따르릉</h1>
        <p className="text-[12px] text-text-sub">
          시니어 안심 복약 케어 서비스
        </p>
      </div>

      <div className="flex flex-col">
        <InputField
          type="email"
          autoComplete="email"
          aria-label="이메일"
          placeholder="이메일"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
        />

        <div className="mt-4">
          <InputField
            type="password"
            autoComplete="current-password"
            aria-label="비밀번호"
            placeholder="비밀번호"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
          />
        </div>

        <Button type="submit" disabled={!canSubmit} className="mt-8">
          로그인하기
        </Button>

        <div className="mt-2 flex items-center justify-center gap-4 text-[12px] text-text-sub">
          {/* TODO: /find-email 라우트 연결 */}
          <Link to="/login">이메일 찾기</Link>
          <span aria-hidden className="h-3 w-px bg-text-placeholder" />
          {/* TODO: /find-password 라우트 연결 */}
          <Link to="/login">비밀번호 찾기</Link>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-end gap-1 text-[12px]">
        <p className="text-text-sub">아직 회원이 아니신가요?</p>
        <Link
          to="/signup"
          className="text-[14px] font-bold text-text-body underline underline-offset-2"
        >
          회원가입 하기
        </Link>
      </div>
    </form>
  );
};

export default LoginPage;
