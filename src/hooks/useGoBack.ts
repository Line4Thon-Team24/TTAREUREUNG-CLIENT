import { useLocation, useNavigate } from 'react-router-dom';

// 이전 화면이 있으면 뒤로, 주소로 바로 들어왔으면 fallback 화면으로
export default function useGoBack() {
  const navigate = useNavigate();
  const location = useLocation();

  return (fallback: string) => {
    if (location.key !== 'default') navigate(-1);
    else navigate(fallback, { replace: true });
  };
}
