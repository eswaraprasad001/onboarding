'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { OnboardingProvider } from '@/context/OnboardingContext';
import { GameProvider } from '@/context/GameContext';
import { ToastProvider } from '@/context/ToastContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <OnboardingProvider>
        <GameProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </GameProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}
