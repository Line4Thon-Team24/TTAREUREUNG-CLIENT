import { CircleAlert } from 'lucide-react';

type UploadErrorMessageProps = {
  message: string;
};

// 업로드한 사진을 인식할 수 없을 때 다시 선택하라는 안내
export default function UploadErrorMessage({
  message,
}: UploadErrorMessageProps) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-[#FAD4D5] bg-[#FFF5F5] p-3.75 text-[13px] leading-4.5 text-[#E5484D]"
    >
      <CircleAlert size={16} aria-hidden className="mt-px shrink-0" />
      {message}
    </p>
  );
}
