import { FileText, RefreshCw } from 'lucide-react';
import type { Prescription } from '@/types/medicine';

type PrescriptionSummaryProps = {
  prescription: Prescription | null;
  onReRegister: () => void;
};

const TILE_CLASS =
  'flex h-30 w-28.5 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#E5E8EB] bg-[#F2F4F6]';

// 약 세부 정보 수정 상단: 등록할 때 올린 처방전 + 다시 등록하기
export default function PrescriptionSummary({
  prescription,
  onReRegister,
}: PrescriptionSummaryProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-bold text-[#191F28]">등록한 정보</h2>
        <button
          type="button"
          onClick={onReRegister}
          className="flex items-center gap-1 rounded-lg border border-[#E5E8EB] px-3.25 py-1.75 text-[12px] font-semibold text-[#191F28] active:bg-[#F2F4F6]"
        >
          <RefreshCw size={14} strokeWidth={1.75} aria-hidden />
          다시 등록하기
        </button>
      </div>

      {prescription ? (
        <div className="flex gap-3">
          <div className={`${TILE_CLASS} flex-col gap-2 p-2.25`}>
            <span
              className="flex size-10 items-center justify-center rounded-xl bg-white text-[#01A16A]"
              aria-hidden
            >
              <FileText size={20} strokeWidth={1.75} />
            </span>
            <span className="flex flex-col gap-1 text-center">
              <span className="text-[12px] font-semibold text-[#333D4B]">
                처방전 원본
              </span>
              <span className="text-[11px] text-[#6B7684]">업로드 파일 1</span>
            </span>
          </div>
          {prescription.imageUrl && (
            // 누르면 새 창에서 원본 크기로 보기
            <a
              href={prescription.imageUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="처방전 사진 크게 보기"
              className={TILE_CLASS}
            >
              <img
                src={prescription.imageUrl}
                alt={prescription.fileName}
                className="size-full object-cover"
              />
            </a>
          )}
        </div>
      ) : (
        <p className="rounded-2xl border border-[#E5E8EB] bg-[#FAFAFA] p-4 text-[13px] text-[#6B7684]">
          직접 입력으로 등록한 약이라 등록한 처방전이 없어요.
        </p>
      )}
    </section>
  );
}
