import {
  MedicineOrderCard,
  StorageLocationCard,
} from '@/components/senior/IncomingCallInfo';
import callIcon from '@/assets/icons/call.svg';
import { mockIncomingCall } from '@/mocks/incomingCall';
import { formatCallTime, formatMedicineOrder } from '@/utils/call';

// 시니어 복약 알림 수신 화면
const SeniorIncomingCallPage = () => {
  const call = mockIncomingCall;

  const handleAccept = () => {
    // TODO: 약 인식 화면 구현 후 해당 경로로 이동
  };

  return (
    <div className="flex min-h-dvh flex-col bg-linear-to-b from-[#0F2419] from-0% to-[#2A563F] to-100% px-5 pt-10 pb-10">
      <header className="flex flex-col items-center gap-2 text-center leading-none">
        <h1 className="text-[28px] font-bold text-white">
          {formatCallTime(new Date(call.scheduledAt))}
        </h1>
        <p className="text-[14px] text-text-on-dark-green">
          정기 복용 시간입니다
        </p>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-6 py-8">
        <MedicineOrderCard
          title={formatMedicineOrder(call.medicineOrder)}
          remainingCount={call.remainingCount}
        />
        <img
          src={call.prescriptionImageUrl}
          alt="처방전"
          className="h-68 w-full rounded-2xl object-cover"
        />
        <StorageLocationCard guide={call.storageGuide} />
      </div>

      <div className="mt-auto flex flex-col items-center gap-2.5">
        <button
          type="button"
          onClick={handleAccept}
          aria-label="전화 받기"
          className="flex size-24 items-center justify-center rounded-full border-6 border-bg-secondary-pressed/80 bg-bg-primary active:bg-bg-primary-pressed"
        >
          <img src={callIcon} alt="" width={30} height={30} />
        </button>
        <span className="text-[22px] font-bold text-white">전화 받기</span>
      </div>
    </div>
  );
};

export default SeniorIncomingCallPage;
