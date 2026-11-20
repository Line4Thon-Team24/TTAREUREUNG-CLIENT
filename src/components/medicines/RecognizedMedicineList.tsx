import type { RecognizedMedicine } from '@/types/medicine';

type RecognizedMedicineListProps = {
  medicines: RecognizedMedicine[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

// AI가 감지한 약 목록 (여러 개 선택 가능, 선택한 항목은 초록색으로 강조)
export default function RecognizedMedicineList({
  medicines,
  selectedIds,
  onToggle,
}: RecognizedMedicineListProps) {
  return (
    <section className="flex w-full flex-col items-center gap-3 rounded-2xl border border-[#E5E8EB] bg-white p-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
      <div className="flex w-full flex-col gap-3">
        <h2 className="flex items-center gap-3 text-[12px] leading-4 font-bold text-[#191F28]">
          감지된 핵심 처방 내역
          <span className="rounded-sm bg-[#E7F6EC] px-1.5 py-0.5 text-[11px] text-[#01A16A]">
            {medicines.length}건
          </span>
        </h2>

        <ul className="flex flex-col gap-2">
          {medicines.map(({ id, form, accuracy }, index) => {
            const selected = selectedIds.includes(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onToggle(id)}
                  className={`flex w-full items-center justify-between rounded-xl border p-2.75 text-left transition-colors ${selected ? 'border-[#CDEBD8] bg-[#F5FEF8]' : 'border-[#E5E8EB] bg-[#FAFAFA]'}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${selected ? 'bg-[#01A16A] text-white' : 'bg-[#E5E8EB] text-[#191F28]'}`}
                    >
                      {index + 1}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[12px] leading-4 font-bold text-[#191F28]">
                        {form.name}
                      </span>
                      <span
                        className={`text-[11px] ${selected ? 'text-[#6B7684]' : 'text-[#333D4B]'}`}
                      >
                        {form.category} · 1일 {form.timesPerDay}회 복용
                      </span>
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-sm px-2 py-0.5 text-[10px] font-semibold ${selected ? 'bg-[#E7F6EC] text-[#01A16A]' : 'text-[#333D4B]'}`}
                  >
                    정확도 {accuracy}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-center text-[11px] text-[#6B7684]">
        다음 버튼을 누르면 부모님의 상세 복용 일정을 설정할 수 있습니다.
      </p>
    </section>
  );
}
