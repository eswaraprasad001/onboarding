'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, FileText, FolderOpen, ShieldCheck, Users } from 'lucide-react';
import {
  pcrJobAids,
  pcrKeyPrinciples,
  pcrOverviewBoundary,
  pcrOverviewIntro,
  pcrProcessSteps,
  pcrQualityGates,
  pcrRecognitionCriteria,
  pcrRoles,
  pcrSuccessMetrics,
  pcrTools,
  pcrTransitionSupport,
  pcrWhenToUse,
} from '@/data/pcrProcess';
import { getArticleHref } from '@/lib/knowledge';

export default function PcrWorkflowArticle() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Overview</h2>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{pcrOverviewIntro}</p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{pcrOverviewBoundary}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {pcrKeyPrinciples.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-600 dark:text-primary-400" />
              <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">When to Use This Process</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Common triggers</h3>
            <div className="mt-3 space-y-3">
              {pcrWhenToUse.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Treat it as a PCR when</h3>
            <div className="mt-3 space-y-3">
              {pcrRecognitionCriteria.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Workflow Steps</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Follow the workflow in order. The steps below are the core reading path for the process.
        </p>
        <div className="mt-5 space-y-4">
          {pcrProcessSteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.24) }}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{step.summary}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Roles and Responsibilities</h2>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {pcrRoles.map((role) => (
            <div
              key={role.id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{role.title}</h3>
              <div className="mt-3 space-y-3">
                {role.responsibilities.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Quality Gate</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pcrQualityGates.map((gate) => (
            <div
              key={gate.id}
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
            >
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{gate.title}</h3>
              <div className="mt-3 space-y-3">
                {gate.checks.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Required Artifacts and Tools</h2>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Click through only where a real supporting resource already exists in the app. Non-linked items are still required parts of the workflow.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pcrTools.map((tool) =>
            tool.articleId ? (
              <Link
                key={tool.id}
                href={getArticleHref(tool.articleId)}
                className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{tool.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-hover:text-primary-500" />
                </div>
              </Link>
            ) : (
              <div
                key={tool.id}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
              >
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{tool.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
              </div>
            )
          )}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Related Job Aids</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {pcrJobAids.map((jobAid) => (
            <Link
              key={jobAid.articleId}
              href={getArticleHref(jobAid.articleId)}
              className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{jobAid.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{jobAid.description}</p>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-hover:text-primary-500" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Support and Enablement</h2>
          <div className="mt-4 space-y-4">
            {pcrTransitionSupport.map((item) => (
              <div key={item.title}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                <div className="mt-2 space-y-2">
                  {item.details.map((detail) => (
                    <div key={detail} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Success Metrics</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {pcrSuccessMetrics.map((metric) => (
              <div
                key={metric}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
              >
                {metric}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
