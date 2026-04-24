'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Role, ViewId, OnboardingStep, StepStatus } from '@/types';
import { getStepsForRole } from '@/data/onboardingSteps';
import { getCurrentViewFromPathname } from '@/lib/internalRoutes';
import {
  computeStepStatus,
  formatTimeRemaining,
  getCurrentIncompleteStep,
  getOnboardingStepHref,
  parseDurationMinutes,
  restoreSteps,
  SavedOnboardingState,
  serializeOnboardingState,
} from '@/lib/onboardingProgress';

interface OnboardingContextValue {
  selectedRole: Role | null;
  steps: OnboardingStep[];
  currentView: ViewId;
  isHydrated: boolean;
  completedSteps: number;
  totalSteps: number;
  progressPercentage: number;
  totalSubTasks: number;
  completedSubTasks: number;
  currentStep: OnboardingStep | null;
  currentStepHref: string;
  estimatedTimeRemaining: string;
  setRole: (role: Role) => void;
  toggleSubTask: (stepId: string, subTaskId: string) => void;
  resetRole: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const STORAGE_KEY = 'presidio-onboarding';

function saveToLocalStorage(role: Role, steps: OnboardingStep[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeOnboardingState(role, steps)));
}

function loadFromLocalStorage(): SavedOnboardingState | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedOnboardingState;
  } catch {
    return null;
  }
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved && saved.role) {
      const restoredSteps = restoreSteps(saved.role, saved);
      setSelectedRole(saved.role);
      setSteps(restoredSteps);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (selectedRole && steps.length > 0) {
      saveToLocalStorage(selectedRole, steps);
    }
  }, [selectedRole, steps]);

  const setRole = useCallback((role: Role) => {
    const newSteps = getStepsForRole(role);
    setSelectedRole(role);
    setSteps(newSteps);
  }, []);

  const toggleSubTask = useCallback((stepId: string, subTaskId: string) => {
    setSteps((prev) =>
      prev.map((step) => {
        if (step.id !== stepId) return step;

        const updatedSubTasks = step.subTasks.map((sub) =>
          sub.id === subTaskId ? { ...sub, completed: !sub.completed } : sub
        );

        return {
          ...step,
          subTasks: updatedSubTasks,
          status: computeStepStatus(updatedSubTasks),
        };
      })
    );
  }, []);

  const resetRole = useCallback(() => {
    setSelectedRole(null);
    setSteps([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const derived = useMemo(() => {
    const totalSteps = steps.length;
    const completedSteps = steps.filter((s) => s.status === 'completed').length;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const totalSubTasks = steps.reduce((acc, s) => acc + s.subTasks.length, 0);
    const completedSubTasks = steps.reduce(
      (acc, s) => acc + s.subTasks.filter((t) => t.completed).length,
      0
    );
    const currentStep = getCurrentIncompleteStep(steps);
    const currentStepHref = getOnboardingStepHref(currentStep?.id);

    const remainingMinutes = steps
      .filter((s) => s.status !== 'completed')
      .reduce((acc, s) => acc + parseDurationMinutes(s.duration), 0);
    const estimatedTimeRemaining = formatTimeRemaining(remainingMinutes);

    return {
      completedSteps,
      totalSteps,
      progressPercentage,
      totalSubTasks,
      completedSubTasks,
      currentStep,
      currentStepHref,
      estimatedTimeRemaining,
    };
  }, [steps]);

  const currentView = useMemo(() => getCurrentViewFromPathname(pathname), [pathname]);

  return (
    <OnboardingContext.Provider
      value={{
        selectedRole,
        steps,
        currentView,
        isHydrated,
        ...derived,
        setRole,
        toggleSubTask,
        resetRole,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
