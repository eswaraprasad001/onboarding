'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, CheckCircle } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';

export default function ContinueCard() {
  const router = useRouter();
  const { currentStep, currentStepHref, completedSteps, totalSteps } = useOnboarding();

  if (completedSteps === totalSteps && totalSteps > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800 p-8 text-center"
      >
        <Trophy className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
          Congratulations!
        </h2>
        <p className="text-green-600 dark:text-green-400">
          You&apos;ve completed all onboarding steps. Great job!
        </p>
      </motion.div>
    );
  }

  if (!currentStep) return null;

  const completedSubTasks = currentStep.subTasks.filter(t => t.completed).length;
  const totalSubTasks = currentStep.subTasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">
            Continue where you left off
          </p>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{currentStep.title}</h3>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle className="w-4 h-4" />
            <span>{completedSubTasks}/{totalSubTasks} tasks completed</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push(currentStepHref)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}
