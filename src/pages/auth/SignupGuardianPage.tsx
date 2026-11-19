import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BackHeader from '@/components/common/BackHeader';
import BirthDateField from '@/components/common/BirthDateField';
import BrandBadge from '@/components/common/BrandBadge';
import FormField from '@/components/common/FormField';
import SelectField from '@/components/common/SelectField';
import TextField from '@/components/common/TextField';
import Button from '@/components/auth/Button';
import { login, signup } from '@/apis/auth';
import { createGuardian } from '@/apis/guardian';
import {
  AUTH_ERROR_CODE,
  GENDER_OPTIONS,
  SIGNUP_MESSAGE,
} from '@/constants/auth';
import { useSignupForm } from '@/hooks/useSignupForm';
import type { ApiError } from '@/types/api';
import type { Gender } from '@/types/senior';
import { isValidBirthDate } from '@/utils/birthDate';
import { toSeniorForm } from '@/utils/seniorForm';
import {
  formatPhoneNumber,
  isValidPhoneNumber,
} from '@/utils/formatPhoneNumber';

// 입력 단계: 이름 → 생년월일 → 성별 → 전화번호
const STEP = { NAME: 1, BIRTH_DATE: 2, GENDER: 3, PHONE: 4 } as const;

const SignupGuardianPage = () => {
  const navigate = useNavigate();
  const { account, guardian, setGuardian, createdAccount, setCreatedAccount } =
    useSignupForm();
  // 저장된 입력값이 있으면 그 단계까지 입력칸을 미리 표시
  const [step, setStep] = useState<number>(() => {
    if (guardian.gender !== '') return STEP.PHONE;
    if (isValidBirthDate(guardian.birthDate)) return STEP.GENDER;
    if (guardian.name.trim() !== '') return STEP.BIRTH_DATE;
    return STEP.NAME;
  });
  const [name, setName] = useState(guardian.name);
  const [birthDate, setBirthDate] = useState(guardian.birthDate);
  const [gender, setGender] = useState<Gender | ''>(guardian.gender);
  const [phoneNumber, setPhoneNumber] = useState(guardian.phoneNumber);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const nameRef = useRef<HTMLInputElement>(null);
  const birthDateRef = useRef<HTMLSelectElement>(null);
  const genderRef = useRef<HTMLSelectElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  // 새 입력칸이 나타나면 해당 칸으로 포커스 이동
  useEffect(() => {
    const refs = {
      [STEP.NAME]: nameRef,
      [STEP.BIRTH_DATE]: birthDateRef,
      [STEP.GENDER]: genderRef,
      [STEP.PHONE]: phoneRef,
    };
    refs[step as keyof typeof refs]?.current?.focus();
  }, [step]);

  // 이전 단계로 돌아갔다 와도 입력이 유지되도록 입력값 저장
  useEffect(() => {
    setGuardian({ name, birthDate, gender, phoneNumber });
  }, [name, birthDate, gender, phoneNumber, setGuardian]);

  // 계정 정보 없이 주소로 바로 들어온 경우 첫 단계로 이동
  if (!account.email || !account.password) {
    return <Navigate to="/signup" replace />;
  }

  const goNext = (from: number) => {
    setStep((prev) => (prev === from ? from + 1 : prev));
  };

  const isValid =
    name.trim() !== '' &&
    isValidBirthDate(birthDate) &&
    gender !== '' &&
    isValidPhoneNumber(phoneNumber);

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    setGuardian({ name: name.trim(), birthDate, gender, phoneNumber });
    setIsSubmitting(true);
    setSubmitError('');
    try {
      // 프로필 생성에 Access Token이 필요하므로 가입 직후 로그인
      if (createdAccount?.email === account.email) {
        // 이미 가입된 이메일이면 가입을 건너뛰고 로그인부터 재시도
        await login(createdAccount);
      } else {
        try {
          await signup(account);
          setCreatedAccount(account);
          await login(account);
        } catch (error) {
          if ((error as ApiError).code !== AUTH_ERROR_CODE.emailDuplicate) {
            throw error;
          }
          // 응답 유실로 이미 가입됐을 수 있으므로 같은 계정으로 로그인 시도
          // 실패하면 다른 사람의 이메일이므로 중복 오류로 처리
          await login(account).catch(() => {
            throw error;
          });
          setCreatedAccount(account);
        }
      }
      await createGuardian(
        toSeniorForm({ name, birthDate, gender, phoneNumber })
      );
      navigate('/signup/complete', { replace: true });
    } catch (error) {
      const { code } = error as ApiError;
      if (code === AUTH_ERROR_CODE.emailDuplicate) {
        // 이메일을 다시 입력하도록 첫 단계로 이동
        navigate('/signup', {
          replace: true,
          state: { emailError: SIGNUP_MESSAGE.emailDuplicate },
        });
        return;
      }
      setSubmitError(SIGNUP_MESSAGE.failed);
      setIsSubmitting(false);
    }
  };

  // 단계 순서대로 정의하고, 화면에는 최신 입력칸이 위로 오도록 역순 표시
  const fields: { step: number; node: ReactNode }[] = [
    {
      step: STEP.NAME,
      node: (
        <FormField label="이름" htmlFor="guardian-name">
          <TextField
            id="guardian-name"
            ref={nameRef}
            placeholder="이름을 입력해주세요."
            value={name}
            enterKeyHint="next"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              // 한글 조합 중 Enter 무시
              if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
              e.preventDefault();
              if (name.trim()) goNext(STEP.NAME);
            }}
            onBlur={() => name.trim() && goNext(STEP.NAME)}
          />
        </FormField>
      ),
    },
    {
      step: STEP.BIRTH_DATE,
      node: (
        <FormField label="생년월일" htmlFor="guardian-birth-date">
          <BirthDateField
            id="guardian-birth-date"
            ref={birthDateRef}
            value={birthDate}
            onChange={(next) => {
              setBirthDate(next);
              if (next.year && next.month && next.day) {
                goNext(STEP.BIRTH_DATE);
              }
            }}
          />
        </FormField>
      ),
    },
    {
      step: STEP.GENDER,
      node: (
        <FormField label="성별" htmlFor="guardian-gender">
          <SelectField
            id="guardian-gender"
            ref={genderRef}
            placeholder="성별을 입력해주세요."
            options={GENDER_OPTIONS}
            value={gender}
            onChange={(e) => {
              setGender(e.target.value as Gender);
              goNext(STEP.GENDER);
            }}
          />
        </FormField>
      ),
    },
    {
      step: STEP.PHONE,
      node: (
        <FormField label="전화번호" htmlFor="guardian-phone">
          <div>
            <div className="flex gap-3">
              <TextField
                id="guardian-phone"
                ref={phoneRef}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="전화번호를 입력해주세요."
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(formatPhoneNumber(e.target.value))
                }
              />
              <button
                type="button"
                // 전화번호 형식이 맞을 때만 활성화
                disabled={!isValidPhoneNumber(phoneNumber)}
                className="shrink-0 rounded-2xl border border-bg-secondary-pressed bg-bg-secondary px-4 text-[14px] font-medium whitespace-nowrap text-border-focus transition-colors active:bg-bg-secondary-pressed disabled:border-border-divider disabled:bg-bg-section disabled:text-text-placeholder"
              >
                인증번호 받기
              </button>
            </div>
          </div>
        </FormField>
      ),
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <BackHeader />

      <div className="flex flex-1 flex-col gap-8 pt-8">
        <section className="flex flex-col items-start gap-2 px-5">
          <BrandBadge label="따르릉 보호자" />
          <h1 className="text-[22px] leading-tight font-bold text-text-title">
            보호자 본인의 정보를
            <br />
            입력해주세요
          </h1>
          <p className="text-[14px] text-text-body">
            다음 단계에서 시니어의 정보를 기입할 예정이에요.
          </p>
        </section>

        <form
          className="flex flex-col gap-6 px-5 pt-6 pb-10"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {fields
            .filter((field) => field.step <= step)
            .reverse()
            .map((field) => (
              <div
                key={field.step}
                className="transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none starting:-translate-y-2 starting:opacity-0"
              >
                {field.node}
              </div>
            ))}
        </form>
      </div>

      <div className="sticky bottom-0 bg-white px-5 pt-4 pb-10">
        {submitError && (
          <p role="alert" className="mb-2 text-center text-[13px] text-red-500">
            {submitError}
          </p>
        )}
        <Button disabled={!isValid || isSubmitting} onClick={handleSubmit}>
          회원가입
        </Button>
      </div>
    </div>
  );
};

export default SignupGuardianPage;
