'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Check } from 'lucide-react';
import { SubTask as SubTaskType } from '@/types';

interface SubTaskProps {
  subTask: SubTaskType;
  stepId: string;
  onToggle: (stepId: string, subTaskId: string) => void;
}

export default function SubTask({ subTask, stepId, onToggle }: SubTaskProps) {
  return (
    <div className="flex items-center gap-3 py-2 group">
      <button
        onClick={() => onToggle(stepId, subTask.id)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          subTask.completed
            ? 'bg-primary-600 border-primary-600 dark:bg-primary-500 dark:border-primary-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
        }`}
      >
        {subTask.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Check className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </button>

      <span
        className={`flex-1 text-sm transition-all ${
          subTask.completed
            ? 'line-through text-gray-400 dark:text-gray-500'
            : 'text-gray-700 dark:text-gray-300'
        }`}
      >
        {subTask.title}
      </span>

      {subTask.link && (
        <a
          href={subTask.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Open resource"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}
