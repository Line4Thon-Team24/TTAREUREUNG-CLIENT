import { useNavigate } from 'react-router-dom';
import { getHistoryIndex } from '@/utils/history';

// 앱 안에 이전 화면이 있으면 뒤로, 주소로 바로 들어왔으면 fallback 화면으로
export default function useGoBack() {
  const navigate = useNavigate();

  return (fallback: string) => {
    if (getHistoryIndex() > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  };
}
