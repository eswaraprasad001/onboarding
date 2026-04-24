'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Award, BookOpen, FileText, Star } from 'lucide-react';
import { ActivityItem } from '@/types';

const typeIcons: Record<string, typeof CheckCircle> = {
  step_complete: CheckCircle,
  subtask_complete: CheckCircle,
  badge_earned: Award,
  article_read: BookOpen,
  template_viewed: FileText,
  xp_earned: Star,
};

function getRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('presidio-activity');
      if (raw) setActivities(JSON.parse(raw).slice(0, 10));
    } catch { /* ignore */ }
  }, []);

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
        <div className="text-center py-6">
          <Clock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity yet</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start completing tasks to see your progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map(item => {
          const Icon = typeIcons[item.type] || CheckCircle;
          return (
            <div key={item.id} className="flex items-start gap-3">
              <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{getRelativeTime(item.timestamp)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
