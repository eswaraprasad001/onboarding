'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import RoleSelection from '@/components/layout/RoleSelection';

export default function App() {
  const router = useRouter();
  const { selectedRole, isHydrated } = useOnboarding();

  useEffect(() => {
    if (isHydrated && selectedRole) {
      router.replace('/app');
    }
  }, [isHydrated, router, selectedRole]);

  if (!isHydrated) {
    return null;
  }

  if (!selectedRole) {
    return <RoleSelection />;
  }

  return null;
}
