import { useOutletContext } from 'react-router-dom';
import type { SignupContextValue } from '@/types/auth';

export const useSignupForm = () => useOutletContext<SignupContextValue>();
