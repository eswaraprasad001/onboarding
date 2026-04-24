'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { OnboardingStep } from '@/types';

interface StepProgressProps {
  steps: OnboardingStep[];
  onStepClick?: (stepId: string) => void;
}

export default function StepProgress({ steps, onStepClick }: StepProgressProps) {
  return (
    <div className="flex items-center justify-between overflow-x-auto py-4 px-2">
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed';
        const isInProgress = step.status === 'in_progress';
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-shrink-0">
            {/* Circle */}
            <button
              onClick={() => onStepClick?.(step.id)}
              className="relative"
              title={step.title}
            >
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isInProgress
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </motion.div>
            </button>

            {/* Line */}
            {!isLast && (
              <div className={`w-8 sm:w-12 lg:w-16 h-0.5 mx-1 ${
                isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
