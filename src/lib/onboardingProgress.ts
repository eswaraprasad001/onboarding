import { getStepsForRole } from '@/data/onboardingSteps';
import { OnboardingStep, Role, StepStatus } from '@/types';

export interface SavedStepState {
  status?: StepStatus;
  subTaskCompletions: Record<string, boolean>;
}

export interface SavedOnboardingState {
  role: Role;
  steps: Record<string, SavedStepState>;
}

export function computeStepStatus(subTasks: { completed: boolean }[]): StepStatus {
  if (subTasks.length === 0) return 'not_started';
  const completedCount = subTasks.filter((t) => t.completed).length;
  if (completedCount === subTasks.length) return 'completed';
  if (completedCount > 0) return 'in_progress';
  return 'not_started';
}

export function parseDurationMinutes(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function formatTimeRemaining(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 minutes';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

export function serializeOnboardingState(role: Role, steps: OnboardingStep[]): SavedOnboardingState {
  const stepsData: Record<string, SavedStepState> = {};

  for (const step of steps) {
    const subTaskCompletions: Record<string, boolean> = {};
    for (const sub of step.subTasks) {
      subTaskCompletions[sub.id] = sub.completed;
    }

    stepsData[step.id] = { subTaskCompletions };
  }

  return { role, steps: stepsData };
}

export function restoreSteps(role: Role, saved: SavedOnboardingState): OnboardingStep[] {
  const freshSteps = getStepsForRole(role);

  return freshSteps.map((step) => {
    const savedStep = saved.steps[step.id];
    if (!savedStep) return step;

    const restoredSubTasks = step.subTasks.map((sub) => ({
      ...sub,
      completed: savedStep.subTaskCompletions[sub.id] ?? sub.completed,
    }));

    return {
      ...step,
      subTasks: restoredSubTasks,
      status: computeStepStatus(restoredSubTasks),
    };
  });
}

export function getCurrentIncompleteStep(steps: OnboardingStep[]): OnboardingStep | null {
  return steps.find((step) => step.status !== 'completed') ?? null;
}

export function getOnboardingStepHref(stepId?: string | null): string {
  if (!stepId) return '/app/onboarding';
  return `/app/onboarding?step=${encodeURIComponent(stepId)}`;
}
