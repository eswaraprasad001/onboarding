'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useOnboarding } from '@/context/OnboardingContext';
import { useToast } from '@/context/ToastContext';
import { useGame } from '@/context/GameContext';
import StepCard from './StepCard';
import StepProgress from './StepProgress';
import ProgressRing from '@/components/ui/ProgressRing';
import { ActivityItem } from '@/types';

function logActivity(description: string, type: ActivityItem['type']) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('presidio-activity');
    const activities: ActivityItem[] = raw ? JSON.parse(raw) : [];
    activities.unshift({
      id: Date.now().toString(36),
      type,
      description,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('presidio-activity', JSON.stringify(activities.slice(0, 50)));
  } catch { /* ignore */ }
}

export default function OnboardingView() {
  const { steps, toggleSubTask, progressPercentage, completedSteps, totalSteps, completedSubTasks, totalSubTasks, estimatedTimeRemaining } = useOnboarding();
  const { addToast } = useToast();
  const { addXP, checkBadge } = useGame();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedStepId = searchParams.get('step');
  const expandedStepId = useMemo(
    () => (requestedStepId && steps.some((step) => step.id === requestedStepId) ? requestedStepId : null),
    [requestedStepId, steps]
  );

  const updateExpandedStep = useCallback((stepId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (stepId) {
      params.set('step', stepId);
    } else {
      params.delete('step');
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (!requestedStepId) return;
    if (steps.some((step) => step.id === requestedStepId)) return;
    updateExpandedStep(null);
  }, [requestedStepId, steps, updateExpandedStep]);

  const handleStepToggle = useCallback((stepId: string) => {
    updateExpandedStep(expandedStepId === stepId ? null : stepId);
  }, [expandedStepId, updateExpandedStep]);

  const handleToggleSubTask = useCallback((stepId: string, subTaskId: string) => {
    const step = steps.find(s => s.id === stepId);
    const subTask = step?.subTasks.find(t => t.id === subTaskId);
    const wasCompleted = subTask?.completed;

    toggleSubTask(stepId, subTaskId);

    if (!wasCompleted) {
      addToast('Sub-task completed! +10 XP', 'success');
      addXP(10, 'subtask');
      checkBadge('first-steps');
      logActivity(`Completed: ${subTask?.title}`, 'subtask_complete');

      // Check if step became completed (all subtasks now done after this toggle)
      if (step) {
        const remainingIncomplete = step.subTasks.filter(t => !t.completed && t.id !== subTaskId).length;
        if (remainingIncomplete === 0) {
          setTimeout(() => {
            addToast(`Step completed: ${step.title}! +50 XP`, 'success');
            addXP(50, 'step');
            checkBadge('getting-started');
            logActivity(`Completed step: ${step.title}`, 'step_complete');

            // Check milestones
            const newCompleted = steps.filter(s => s.id === stepId ? true : s.status === 'completed').length;
            if (newCompleted >= Math.ceil(steps.length / 2)) checkBadge('halfway');
            if (newCompleted >= 3) checkBadge('speed-runner');
            if (newCompleted >= steps.length) checkBadge('completionist');
          }, 300);
        }
      }
    } else {
      addToast('Sub-task unchecked', 'info');
    }
  }, [steps, toggleSubTask, addToast, addXP, checkBadge]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Progress Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-6">
          <ProgressRing progress={progressPercentage} size={80} strokeWidth={6} />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Progress</h2>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-gray-100">{completedSteps}/{totalSteps}</strong> steps
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-gray-100">{completedSubTasks}/{totalSubTasks}</strong> tasks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <strong className="text-gray-900 dark:text-gray-100">{estimatedTimeRemaining}</strong> left
                </span>
              </div>
            </div>
          </div>
        </div>

        <StepProgress steps={steps} onStepClick={handleStepToggle} />
      </div>

      {/* Step Cards */}
      <div className="space-y-4">
        {steps.map(step => (
          <StepCard
            key={step.id}
            step={step}
            isExpanded={expandedStepId === step.id}
            onToggleExpand={() => handleStepToggle(step.id)}
            onToggleSubTask={handleToggleSubTask}
          />
        ))}
      </div>
    </motion.div>
  );
}
