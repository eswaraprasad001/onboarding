'use client';

import { motion } from 'framer-motion';
import { useOnboarding } from '@/context/OnboardingContext';

export default function StickyProgressBar() {
  const { progressPercentage } = useOnboarding();

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-50">
      <motion.div
        className="h-full bg-gradient-to-r from-primary-500 to-primary-600"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      />
    </div>
  );
}
