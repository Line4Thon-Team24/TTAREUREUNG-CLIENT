import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import BackHeader from '@/components/common/BackHeader';
import BirthDateField, {
  type BirthDate,
} from '@/components/common/BirthDateField';
import Button from '@/components/common/Button';
import FormField from '@/components/common/FormField';
import SelectField from '@/components/common/SelectField';
import TextField from '@/components/common/TextField';
import BrandBadge from '@/components/common/BrandBadge';
import { addSenior } from '@/mocks/seniors';
import type { Gender } from '@/types/senior';
import { isValidBirthDate } from '@/utils/birthDate';
import {
  formatPhoneNumber,
  isValidPhoneNumber,
} from '@/utils/formatPhoneNumber';

const GENDER_OPTIONS = [
  { label: '여성', value: 'female' },
  { label: '남성', value: 'male' },
];

// 입력 단계: 이름 → 생년월일 → 성별 → 전화번호
const STEP = { NAME: 1, BIRTH_DATE: 2, GENDER: 3, PHONE: 4 } as const;

const pad = (value: string) => value.padStart(2, '0');

const SeniorRegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(STEP.NAME);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<BirthDate>({
    year: '',
    month: '',
    day: '',
  });
  const [gender, setGender] = useState<Gender | ''>('');
  const [phoneNumber, setPhoneNumber] = useState('');

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

  // 현재 단계의 입력을 마치면 다음 단계로 이동 (이미 지난 단계는 유지)
  const goNext = (from: number) => {
    setStep((prev) => (prev === from ? from + 1 : prev));
  };

  const isValid =
    name.trim() !== '' &&
    isValidBirthDate(birthDate) &&
    gender !== '' &&
    isValidPhoneNumber(phoneNumber);

  const handleSubmit = () => {
    if (!isValid) return;

    const senior = addSenior({
      name: name.trim(),
      birthDate: `${birthDate.year}-${pad(birthDate.month)}-${pad(birthDate.day)}`,
      gender,
      phoneNumber,
    });
    // 완료 화면은 등록을 거쳐 온 경우에만 보이도록 state 전달 (약 등록에 시니어 id 사용)
    navigate('/seniors/register/complete', {
      replace: true,
      state: { seniorId: senior.id },
    });
  };

  // 단계 순서대로 정의하고, 화면에는 최신 입력칸이 위로 오도록 역순 표시
  const fields: { step: number; node: ReactNode }[] = [
    {
      step: STEP.NAME,
      node: (
        <FormField label="이름" htmlFor="senior-name">
          <TextField
            id="senior-name"
            ref={nameRef}
            placeholder="이름을 입력해주세요."
            value={name}
            enterKeyHint="next"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              // 한글 조합 중 Enter는 무시
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
        <FormField label="생년월일" htmlFor="senior-birth-date">
          <BirthDateField
            id="senior-birth-date"
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
        <FormField label="성별" htmlFor="senior-gender">
          <SelectField
            id="senior-gender"
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
        <FormField label="전화번호" htmlFor="senior-phone">
          <TextField
            id="senior-phone"
            ref={phoneRef}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="전화번호를 입력해주세요."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            onKeyDown={(e) => {
              // 마지막 입력칸에서 Enter 시 등록 (한글 조합 중 제외)
              if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
              e.preventDefault();
              handleSubmit();
            }}
          />
        </FormField>
      ),
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 주소로 바로 들어온 경우에도 안전하게 복용 일정으로 이동 */}
      <BackHeader onBack={() => navigate('/schedule', { replace: true })} />

      <div className="flex flex-1 flex-col gap-8 pt-8">
        <section className="flex flex-col items-start gap-2 px-5">
          <BrandBadge label="따르릉 약 챙김 대상자" />
          <h1 className="text-[22px] font-bold text-[#191F28]">
            시니어의 정보를
            <br />
            입력해주세요
          </h1>
          <p className="text-[14px] text-[#333D4B]">
            다음 단계에서 시니어의 약 정보를 기입할 예정이에요.
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
              // 새 입력칸이 위에서 살짝 내려오며 나타나는 효과
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
        <Button disabled={!isValid} onClick={handleSubmit}>
          시니어 등록하기
        </Button>
      </div>
    </div>
  );
};

export default SeniorRegisterPage;
