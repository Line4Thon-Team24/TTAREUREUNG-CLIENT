import { FileText, Image } from 'lucide-react';
import type { RecognizedArea } from '@/types/medicine';

type PrescriptionViewerProps = {
  fileName: string;
  imageUrl: string | null;
  confidence: number;
  areas: RecognizedArea[];
};

// 업로드한 처방전 사진 + 글씨가 인식된 초록 영역 표시
export default function PrescriptionViewer({
  fileName,
  imageUrl,
  confidence,
  areas,
}: PrescriptionViewerProps) {
  return (
    <section
      aria-label="업로드한 처방전"
      className="relative h-60 w-full overflow-hidden rounded-2xl border border-[#E5E8EB] bg-[#F2F4F6] shadow-[0_4px_6px_0_rgba(0,0,0,0.1),0_2px_4px_0_rgba(0,0,0,0.1)]"
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt="업로드한 처방전 사진"
            className="size-full object-cover"
          />
          {/* API 연동 전에는 정해진 위치에 인식 영역을 표시 */}
          {areas.map((area, index) => (
            <div
              key={index}
              className="absolute rounded-sm border border-[#CDEBD8] bg-[rgba(36,199,88,0.2)] backdrop-blur-[0.5px]"
              style={{
                top: `${area.top}%`,
                right: `${area.right}%`,
                bottom: `${area.bottom}%`,
                left: `${area.left}%`,
              }}
            >
              <span className="absolute -top-4.5 -left-px rounded-[3px] bg-[#01A16A] px-1.25 py-px text-[10px] font-medium whitespace-nowrap text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)]">
                {area.label}
              </span>
            </div>
          ))}
        </>
      ) : (
        // PDF 등 미리보기가 없는 파일
        <div className="flex size-full flex-col items-center justify-center gap-2 text-[#6B7684]">
          <FileText size={40} strokeWidth={1.5} aria-hidden />
          <p className="text-[13px]">미리보기를 지원하지 않는 파일이에요</p>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-linear-to-b from-[rgba(0,0,0,0.7)] to-transparent px-3 py-2">
        <p className="flex min-w-0 items-center gap-1 text-[11px] text-white">
          <Image size={11} aria-hidden className="shrink-0" />
          <span className="truncate">{fileName}</span>
        </p>
        <span className="shrink-0 rounded-full bg-[#E7F6EC] px-2 py-1 text-[12px] font-medium text-[#01A16A]">
          신뢰도 {confidence}%
        </span>
      </div>
    </section>
  );
}
