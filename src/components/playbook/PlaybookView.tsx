'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Star, Target } from 'lucide-react';
import {
  getPlaybookPhaseHref,
  playbookCheckpointCount,
  playbookPhases,
  tableStakes,
} from '@/data/playbook';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import {
  getPlaybookViewEventId,
  markPlaybookView,
  PLAYBOOK_VIEW_XP,
} from '@/lib/playbookGamification';

export default function PlaybookView() {
  const { addXP } = useGame();
  const { addToast } = useToast();
  const [hasEarnedXP, setHasEarnedXP] = useState(false);

  useEffect(() => {
    const landingEventId = getPlaybookViewEventId('landing');
    const { awarded, viewedEvents } = markPlaybookView('landing');

    setHasEarnedXP(viewedEvents.has(landingEventId));

    if (!awarded) {
      return;
    }

    addXP(PLAYBOOK_VIEW_XP, 'Viewed Solution Owner Playbook');
    addToast(`Playbook viewed +${PLAYBOOK_VIEW_XP} XP`, 'success');
  }, [addToast, addXP]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex-shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Solution Owner Playbook
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-3xl">
              The framework is organized into five phases and {playbookCheckpointCount} checkpoints so Solution Owners can move from engagement setup through delivery governance with a clear operating rhythm.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
              Use this page to choose a phase, then open the dedicated phase view for checkpoint guidance, desired outcomes, artifacts, and Table Stakes reinforcement.
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                <Star className="w-3.5 h-3.5 fill-current" />
                {hasEarnedXP ? `${PLAYBOOK_VIEW_XP} XP earned` : `Read to earn ${PLAYBOOK_VIEW_XP} XP`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Framework Phases</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Open a phase to see the checkpoints, outcomes, required artifacts, and supporting artifacts that anchor the work.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {playbookPhases.map((phase) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: phase.order * 0.05 }}
            >
              <Link
                href={getPlaybookPhaseHref(phase.id)}
                className="group h-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 flex flex-col transition-colors hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                  Phase {phase.order}
                </div>
                <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {phase.title}
                </div>
                <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 line-clamp-4 flex-1">
                  {phase.tagline}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{phase.checkpointIds.length} checkpoints</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">SO Table Stakes</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            These seven baseline expectations show up across the full framework. The checkpoints on the phase pages call out where each one is reinforced.
          </p>
        </div>

        <div className="grid gap-4 mt-5 md:grid-cols-2 xl:grid-cols-3">
          {tableStakes.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.03 }}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.summary}</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {item.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
