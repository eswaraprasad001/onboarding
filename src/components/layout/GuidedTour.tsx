'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_KEY = 'presidio-tour-completed';

interface TourStep {
  target: string;
  title: string;
  content: string;
}

const tourSteps: TourStep[] = [
  {
    target: '[data-tour="sidebar"]',
    title: 'Navigation',
    content: 'Use the sidebar to navigate between different sections of the platform.',
  },
  {
    target: '[data-tour="progress"]',
    title: 'Your Progress',
    content: 'Track your overall onboarding progress here. The ring fills as you complete steps.',
  },
  {
    target: '[data-tour="dashboard"]',
    title: 'Dashboard',
    content: 'The dashboard gives you a quick overview of your onboarding status, stats, and recent activity.',
  },
  {
    target: '[data-tour="search"]',
    title: 'Quick Search',
    content: 'Press Cmd+K to quickly search across steps, templates, articles, and more.',
  },
  {
    target: '[data-tour="dark-mode"]',
    title: 'Dark Mode',
    content: 'Toggle between light and dark mode for a comfortable viewing experience.',
  },
  {
    target: '[data-tour="xp"]',
    title: 'Experience Points',
    content: 'Earn XP by completing tasks, reading articles, and exploring the platform!',
  },
];

export default function GuidedTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      const timer = setTimeout(() => setActive(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const positionTooltip = useCallback(() => {
    if (!active) return;
    const currentStep = tourSteps[step];
    const el = document.querySelector(currentStep.target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const tooltipHeight = tooltipRef.current?.offsetHeight || 180;
    const tooltipWidth = tooltipRef.current?.offsetWidth || 320;

    let top = rect.bottom + 12;
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;

    // Keep within viewport
    if (top + tooltipHeight > window.innerHeight) {
      top = rect.top - tooltipHeight - 12;
    }
    left = Math.max(12, Math.min(left, window.innerWidth - tooltipWidth - 12));

    // Highlight the element
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTooltipPos({ top, left });
  }, [active, step]);

  useEffect(() => {
    positionTooltip();
    window.addEventListener('resize', positionTooltip);
    return () => window.removeEventListener('resize', positionTooltip);
  }, [positionTooltip]);

  const finish = useCallback(() => {
    setActive(false);
    localStorage.setItem(TOUR_KEY, 'true');
  }, []);

  const next = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!active) return null;

  const currentStep = tourSteps[step];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={finish} />

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          ref={tooltipRef}
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed z-[9999] w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{currentStep.title}</h4>
            <button
              onClick={finish}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{currentStep.content}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{step + 1} of {tourSteps.length}</span>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" /> Back
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {step === tourSteps.length - 1 ? 'Done' : 'Next'} <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
