'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, ClipboardList, FileText, BookOpen, Settings, X } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { useTheme } from '@/context/ThemeContext';
import { templates } from '@/data/templates';
import { articles } from '@/data/articles';
import { INTERNAL_ROUTES } from '@/lib/internalRoutes';

interface SearchItem {
  id: string;
  title: string;
  type: 'page' | 'step' | 'template' | 'article' | 'action';
  action: () => void;
}

const typeIcons = {
  page: LayoutDashboard,
  step: ClipboardList,
  template: FileText,
  article: BookOpen,
  action: Settings,
};

const typeLabels = {
  page: 'Page',
  step: 'Step',
  template: 'Template',
  article: 'Article',
  action: 'Action',
};

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { steps, resetRole } = useOnboarding();
  const { toggleTheme } = useTheme();

  const navigateTo = useCallback((href: string) => {
    router.push(href);
    setIsOpen(false);
  }, [router]);

  const allItems: SearchItem[] = [
    ...INTERNAL_ROUTES.map((route) => ({
      id: `page-${route.id}`,
      title: route.title,
      type: 'page' as const,
      action: () => navigateTo(route.href),
    })),
    ...steps.map(s => ({
      id: `step-${s.id}`,
      title: s.title,
      type: 'step' as const,
      action: () => navigateTo('/app/onboarding'),
    })),
    ...templates.map(t => ({
      id: `template-${t.id}`,
      title: t.title,
      type: 'template' as const,
      action: () => navigateTo('/app/templates'),
    })),
    ...articles.map(a => ({
      id: `article-${a.id}`,
      title: a.title,
      type: 'article' as const,
      action: () => navigateTo('/app/knowledge'),
    })),
    { id: 'action-theme', title: 'Toggle Dark Mode', type: 'action', action: () => { toggleTheme(); setIsOpen(false); } },
    { id: 'action-role', title: 'Change Role', type: 'action', action: () => { resetRole(); setIsOpen(false); } },
  ];

  const filtered = query
    ? allItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : allItems.slice(0, 8);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handleCustom = () => open();
    window.addEventListener('open-command-palette', handleCustom);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-command-palette', handleCustom);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, open]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 border-b border-gray-200 dark:border-gray-700">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, steps, templates, articles..."
                className="flex-1 py-3.5 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none text-sm"
              />
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[320px] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No results found
                </div>
              ) : (
                filtered.map((item, index) => {
                  const Icon = typeIcons[item.type];
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                        index === selectedIndex
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 opacity-60" />
                      <span className="flex-1 truncate">{item.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        {typeLabels[item.type]}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-400">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
