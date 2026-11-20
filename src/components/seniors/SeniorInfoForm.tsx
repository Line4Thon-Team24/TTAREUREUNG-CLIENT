import BirthDateField from '@/components/common/BirthDateField';
import FormField from '@/components/common/FormField';
import SelectField from '@/components/common/SelectField';
import TextField from '@/components/common/TextField';
import { GENDER_OPTIONS } from '@/constants/senior';
import type { Gender } from '@/types/senior';
import { formatPhoneNumber } from '@/utils/formatPhoneNumber';
import type { SeniorFormValue } from '@/utils/seniorForm';

type SeniorInfoFormProps = {
  value: SeniorFormValue;
  onChange: (value: SeniorFormValue) => void;
  onSubmit: () => void;
};

// 시니어 정보 입력 (이름·생년월일·성별·전화번호) - 시니어 추가 / 정보 수정
export default function SeniorInfoForm({
  value,
  onChange,
  onSubmit,
}: SeniorInfoFormProps) {
  const update = (next: Partial<SeniorFormValue>) =>
    onChange({ ...value, ...next });

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <FormField label="이름" htmlFor="senior-name">
        <TextField
          id="senior-name"
          placeholder="이름을 입력해주세요."
          value={value.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      </FormField>
      <FormField label="생년월일" htmlFor="senior-birth-date">
        <BirthDateField
          id="senior-birth-date"
          value={value.birthDate}
          onChange={(birthDate) => update({ birthDate })}
        />
      </FormField>
      <FormField label="성별" htmlFor="senior-gender">
        <SelectField
          id="senior-gender"
          placeholder="성별을 입력해주세요."
          options={GENDER_OPTIONS}
          value={value.gender}
          onChange={(e) => update({ gender: e.target.value as Gender })}
        />
      </FormField>
      <FormField label="전화번호" htmlFor="senior-phone">
        <TextField
          id="senior-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="전화번호를 입력해주세요."
          value={value.phoneNumber}
          onChange={(e) =>
            update({ phoneNumber: formatPhoneNumber(e.target.value) })
          }
        />
      </FormField>
    </form>
  );
}
