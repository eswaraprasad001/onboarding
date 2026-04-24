'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, Shield, BookOpen, Target, Award, Settings } from 'lucide-react';
import { OnboardingStep } from '@/types';
import { categoryColors } from '@/data/onboardingSteps';
import SubTask from './SubTask';
import StatusBadge from '@/components/ui/StatusBadge';

const iconMap: Record<string, typeof Shield> = {
  Shield, BookOpen, Target, Award, Settings,
};

interface StepCardProps {
  step: OnboardingStep;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleSubTask: (stepId: string, subTaskId: string) => void;
}

export default function StepCard({ step, isExpanded, onToggleExpand, onToggleSubTask }: StepCardProps) {
  const completedCount = step.subTasks.filter(t => t.completed).length;
  const totalCount = step.subTasks.length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const CategoryIcon = iconMap[
    step.category === 'access' ? 'Shield' :
    step.category === 'learning' ? 'BookOpen' :
    step.category === 'practice' ? 'Target' :
    step.category === 'assessment' ? 'Award' : 'Settings'
  ] || Shield;

  const statusVariant = step.status === 'completed' ? 'success' : step.status === 'in_progress' ? 'warning' : 'default';
  const statusLabel = step.status === 'completed' ? 'Completed' : step.status === 'in_progress' ? 'In Progress' : 'Not Started';

  const borderColor = step.status === 'completed' ? 'border-l-green-500' : step.status === 'in_progress' ? 'border-l-amber-500' : 'border-l-transparent';

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 border-l-4 ${borderColor} overflow-hidden`}
    >
      {/* Header */}
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${categoryColors[step.category]}`}>
          <CategoryIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
            <StatusBadge variant={statusVariant} size="sm">{statusLabel}</StatusBadge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{step.description}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {step.duration}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Sub-task progress bar */}
      <div className="px-5 pb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>{completedCount}/{totalCount} tasks completed</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Expandable Sub-tasks */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-3">
              <div className="space-y-0.5">
                {step.subTasks.map(subTask => (
                  <SubTask
                    key={subTask.id}
                    subTask={subTask}
                    stepId={step.id}
                    onToggle={onToggleSubTask}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
