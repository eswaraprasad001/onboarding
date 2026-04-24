'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, FileText, FolderOpen, Star } from 'lucide-react';
import {
  getTableStake,
  PlaybookCheckpoint,
  PlaybookPhase,
} from '@/data/playbook';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import {
  getPlaybookViewEventId,
  markPlaybookView,
  PLAYBOOK_VIEW_XP,
} from '@/lib/playbookGamification';

interface PlaybookPhaseViewProps {
  phase: PlaybookPhase;
  checkpoints: PlaybookCheckpoint[];
}

export default function PlaybookPhaseView({ phase, checkpoints }: PlaybookPhaseViewProps) {
  const { addXP } = useGame();
  const { addToast } = useToast();
  const [hasEarnedXP, setHasEarnedXP] = useState(false);

  useEffect(() => {
    const phaseViewId = `phase:${phase.id}`;
    const phaseEventId = getPlaybookViewEventId(phaseViewId);
    const { awarded, viewedEvents } = markPlaybookView(phaseViewId);

    setHasEarnedXP(viewedEvents.has(phaseEventId));

    if (!awarded) {
      return;
    }

    addXP(PLAYBOOK_VIEW_XP, `Viewed ${phase.title}`);
    addToast(`${phase.title} viewed +${PLAYBOOK_VIEW_XP} XP`, 'success');
  }, [addToast, addXP, phase.id, phase.title]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/app/playbook"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Playbook</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
            Phase {phase.order} of 5
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300">
            <Star className="w-3.5 h-3.5 fill-current" />
            {hasEarnedXP ? `${PLAYBOOK_VIEW_XP} XP earned` : `Read to earn ${PLAYBOOK_VIEW_XP} XP`}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
              Phase {phase.order}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
              {phase.title}
            </h2>
            <p className="text-primary-600 dark:text-primary-400 text-sm font-medium mt-2">
              {phase.tagline}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 max-w-3xl">
              {phase.summary}
            </p>
          </div>

          <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
            {checkpoints.length} checkpoints
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {checkpoints.map((checkpoint, index) => (
          <motion.div
            key={checkpoint.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                  Checkpoint {checkpoint.id.replace('cp', '')}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-2">
                  {checkpoint.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                  {checkpoint.summary}
                </p>
              </div>
            </div>

            <div className="grid gap-4 mt-6 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Desired Outcomes</h4>
                </div>
                <div className="mt-3 space-y-3">
                  {checkpoint.desiredOutcomes.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Required Artifacts</h4>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {checkpoint.requiredArtifacts?.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {checkpoint.supportingArtifacts?.length ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Supporting Artifacts</h4>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {checkpoint.supportingArtifacts.map((item) => (
                        <span
                          key={item}
                          className="inline-flex items-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Table Stakes Reinforced</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {checkpoint.reinforcedTableStakeIds.map((tableStakeId) => {
                  const tableStake = getTableStake(tableStakeId);
                  if (!tableStake) {
                    return null;
                  }

                  return (
                    <span
                      key={tableStake.id}
                      className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 px-3 py-1 text-xs font-medium text-primary-700 dark:text-primary-300"
                    >
                      {tableStake.title}
                    </span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
