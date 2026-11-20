// 카드에 보여줄 약 정보
type TargetMedicineInfo = {
  imageUrl: string | null;
  displayName: string;
  appearance: string; // 외형 설명 (예: 파란색 원기둥)
};

type TargetMedicineCardProps = {
  label: string; // 예: 찾아야 할 약 / 다음 복용 약
  medicine: TargetMedicineInfo;
  showAppearance?: boolean; // 외형 설명 표시 여부 (예: 파란색 원기둥)
};

// 인식 화면 우측 상단의 약 안내 카드
const TargetMedicineCard = ({
  label,
  medicine,
  showAppearance = false,
}: TargetMedicineCardProps) => (
  <div className="flex w-35 shrink-0 flex-col items-center gap-3 rounded-2xl border-2 border-border-default bg-white p-3 text-center">
    <h2 className="text-[16px] font-bold text-text-main">{label}</h2>
    {medicine.imageUrl && (
      <img
        src={medicine.imageUrl}
        alt={medicine.displayName}
        className="h-21 w-full rounded-lg object-cover"
      />
    )}
    <div className="flex flex-col leading-tight">
      <span className="text-[16px] font-bold text-text-title">
        {medicine.displayName}
      </span>
      {showAppearance && medicine.appearance && (
        <span className="mt-1 text-[16px] text-text-body">
          {medicine.appearance}
        </span>
      )}
    </div>
  </div>
);

export default TargetMedicineCard;
