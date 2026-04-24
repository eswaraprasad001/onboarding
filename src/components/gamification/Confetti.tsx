'use client';

import { useEffect } from 'react';

export function triggerConfetti() {
  if (typeof window === 'undefined') return;

  import('canvas-confetti').then((confettiModule) => {
    const confetti = confettiModule.default;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'],
    });
  });
}

export function triggerBadgeConfetti() {
  if (typeof window === 'undefined') return;

  import('canvas-confetti').then((confettiModule) => {
    const confetti = confettiModule.default;
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
      shapes: ['star'],
    });
  });
}

// Optional: React component that fires confetti on mount
export default function Confetti({ type = 'default' }: { type?: 'default' | 'badge' }) {
  useEffect(() => {
    if (type === 'badge') {
      triggerBadgeConfetti();
    } else {
      triggerConfetti();
    }
  }, [type]);

  return null;
}
