'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileSignature, ArrowRight } from 'lucide-react';

interface AppCard {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  badge?: string;
}

const apps: AppCard[] = [
  {
    id: 'pcr-writer',
    label: 'PCR Writer',
    description: 'AI-assisted Project Change Request drafting.',
    icon: FileSignature,
    href: '/app/pcr-writer',
    color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    badge: 'Beta',
  },
];

export default function AppsSection() {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Apps</h3>
        <span className="text-xs text-gray-400 dark:text-gray-500">Tools to accelerate your delivery workflow</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {apps.map((app, i) => {
          const Icon = app.icon;
          return (
            <motion.button
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(app.href)}
              className="relative flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow text-left group w-full"
            >
              {app.badge && (
                <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 uppercase tracking-wide border border-amber-200 dark:border-amber-700/50">
                  {app.badge}
                </span>
              )}
              <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center ${app.color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col min-w-0 pr-8">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{app.label}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{app.description}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0 ml-auto" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
