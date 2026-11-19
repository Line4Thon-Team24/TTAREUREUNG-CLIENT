import { X } from 'lucide-react';
import usePushPermission from '@/hooks/usePushPermission';

// 알림 권한을 아직 정하지 않았을 때 보여주는 '알림 켜기' 안내 띠
export default function PushPermissionBar() {
  const { isBarVisible, requestPermission, dismiss } = usePushPermission();
  if (!isBarVisible) return null;

  return (
    <div className="flex items-center gap-3 bg-[#E7F6EC] py-3 pr-3 pl-5">
      <p className="min-w-0 flex-1 text-[14px] font-medium text-text-body">
        복용 알림을 휴대폰으로 받아 보세요
      </p>
      <button
        type="button"
        onClick={requestPermission}
        className="shrink-0 rounded-full bg-[#01A16A] px-3 py-1.5 text-[13px] font-semibold text-white active:opacity-80"
      >
        알림 켜기
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="안내 닫기"
        className="shrink-0 p-1 text-text-sub"
      >
        <X size={18} aria-hidden />
      </button>
    </div>
  );
}
