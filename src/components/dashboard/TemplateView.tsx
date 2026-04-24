'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Download, Star, SlidersHorizontal, FileText, X, ChevronDown, ExternalLink, FolderOpen, Info, ListChecks, ArrowRight, RefreshCw } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { templates, categoryColors, formatColors, categories, formats } from '@/data/templates';
import { useOnboarding } from '@/context/OnboardingContext';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { Template, TemplatePreviewResource } from '@/types';

type SortOption = 'popular' | 'rated' | 'recent' | 'alphabetical';

const FAVORITES_KEY = 'presidio-template-favorites';

interface TemplateRefreshSummary {
  mode: 'session-only' | 'local-json';
  detected: number;
  added: number;
  updated: number;
  removed: number;
  skipped: number;
  message: string;
  refreshedAt: string;
}

interface TemplateRefreshHelp {
  message: string;
  link: string;
  label: string;
}

export default function TemplateView() {
  const [catalog, setCatalog] = useState(templates);
  const [newFromSharePoint, setNewFromSharePoint] = useState<Template[]>([]);
  const [isCatalogLoaded, setIsCatalogLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSummary, setRefreshSummary] = useState<TemplateRefreshSummary | null>(null);
  const [refreshHelp, setRefreshHelp] = useState<TemplateRefreshHelp | null>(null);

  const { currentStep } = useOnboarding();
  const { addXP, checkBadge } = useGame();
  const { addToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openedFromInAppRef = useRef(false);

  const requestedTemplateId = searchParams.get('template');
  const previewTemplate = useMemo(
    () => (requestedTemplateId ? catalog.find((template) => template.id === requestedTemplateId) ?? null : null),
    [catalog, requestedTemplateId]
  );
  const previewMetadata = previewTemplate?.preview;

  // Load favorites
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) setFavorites(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadPersistedCatalog() {
      try {
        const response = await fetch('/api/templates/catalog', { cache: 'no-store' });
        if (!response.ok) return;

        const payload = await response.json();
        if (isCancelled) return;

        if (Array.isArray(payload.templates)) {
          setCatalog(payload.templates);
        }
        if (Array.isArray(payload.newTemplates)) {
          setNewFromSharePoint(payload.newTemplates);
        }
        if (payload.summary) {
          setRefreshSummary(payload.summary);
        }
      } catch {
        // Fall back to seed catalog silently.
      } finally {
        if (!isCancelled) {
          setIsCatalogLoaded(true);
        }
      }
    }

    loadPersistedCatalog();

    return () => {
      isCancelled = true;
    };
  }, []);

  const saveFavorites = (newFavs: Set<string>) => {
    setFavorites(newFavs);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newFavs)));
  };

  const toggleFavorite = (id: string) => {
    const next = new Set(favorites);
    if (next.has(id)) {
      next.delete(id);
      addToast('Removed from favorites', 'info');
    } else {
      next.add(id);
      addToast('Added to favorites', 'success');
    }
    saveFavorites(next);
  };

  const handleDownload = (template: Template) => {
    if (!template.resourceUrl) {
      addToast('No source artifact mapped for this template yet', 'warning');
      return;
    }

    const popup = window.open(template.resourceUrl, '_blank', 'noopener,noreferrer');
    if (popup) {
      popup.opener = null;
    }

    addXP(20, `${template.cardType === 'collection' ? 'Browsed' : 'Downloaded'} ${template.title}`);
    addToast(
      template.cardType === 'collection'
        ? `Opened collection: ${template.title}`
        : template.resourceType === 'folder'
        ? `Opened source: ${template.title}`
        : `Opened source file: ${template.title}`,
      'success'
    );

    // Track for badge
    const viewedCount = parseInt(localStorage.getItem('presidio-templates-viewed') || '0', 10) + 1;
    localStorage.setItem('presidio-templates-viewed', String(viewedCount));
    if (viewedCount >= 5) checkBadge('template-explorer');
  };

  const openExternalResource = useCallback((url?: string | null) => {
    if (!url) return;

    const popup = window.open(url, '_blank', 'noopener,noreferrer');
    if (popup) {
      popup.opener = null;
    }
  }, []);

  const handleOpenSource = useCallback((template: Template) => {
    const sourceUrl = template.preview?.sourceUrl ?? template.resourceUrl;
    if (!sourceUrl) {
      addToast('No source artifact mapped for this template yet', 'warning');
      return;
    }

    openExternalResource(sourceUrl);
  }, [addToast, openExternalResource]);

  const setTemplateParam = useCallback((templateId: string | null, historyMode: 'push' | 'replace') => {
    const params = new URLSearchParams(searchParams.toString());
    if (templateId) {
      params.set('template', templateId);
    } else {
      params.delete('template');
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    if (historyMode === 'push') {
      router.push(nextUrl, { scroll: false });
      return;
    }
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  const handlePreview = useCallback((template: Template) => {
    if (template.preview?.hasPreview === false) {
      addToast('Preview metadata is not available for this artifact yet', 'info');
      return;
    }
    openedFromInAppRef.current = true;
    setTemplateParam(template.id, 'push');
  }, [addToast, setTemplateParam]);

  const closePreview = useCallback(() => {
    if (openedFromInAppRef.current) {
      openedFromInAppRef.current = false;
      router.back();
      return;
    }

    setTemplateParam(null, 'replace');
  }, [router, setTemplateParam]);

  useEffect(() => {
    if (!requestedTemplateId) return;
    if (previewTemplate) return;
    setTemplateParam(null, 'replace');
  }, [previewTemplate, requestedTemplateId, setTemplateParam]);

  useEffect(() => {
    if (!previewTemplate) return;
    const viewedCount = parseInt(localStorage.getItem('presidio-templates-viewed') || '0', 10) + 1;
    localStorage.setItem('presidio-templates-viewed', String(viewedCount));
    if (viewedCount >= 5) checkBadge('template-explorer');
  }, [checkBadge, previewTemplate]);

  const onboardingRecommended = useMemo(() => (
    catalog
      .filter((template) => template.featuredForOnboarding)
      .sort((a, b) => (a.onboardingPriority ?? Number.MAX_SAFE_INTEGER) - (b.onboardingPriority ?? Number.MAX_SAFE_INTEGER))
  ), [catalog]);

  // Recommended templates for current step
  const recommended = useMemo(() => {
    if (!currentStep) return [];
    const onboardingIds = new Set(onboardingRecommended.map((template) => template.id));
    return catalog.filter((template) => (
      template.recommendedForSteps?.includes(currentStep.id) &&
      !onboardingIds.has(template.id)
    ));
  }, [catalog, currentStep, onboardingRecommended]);

  const filtered = useMemo(() => {
    let result = catalog;

    if (showFavoritesOnly) {
      result = result.filter((t) => favorites.has(t.id));
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.includes(q))
      );
    }
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }
    if (selectedFormat !== 'all') {
      result = result.filter((t) => t.format === selectedFormat);
    }

    switch (sortBy) {
      case 'popular': result = [...result].sort((a, b) => b.downloads - a.downloads); break;
      case 'rated': result = [...result].sort((a, b) => b.rating - a.rating); break;
      case 'recent': result = [...result].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)); break;
      case 'alphabetical': result = [...result].sort((a, b) => a.title.localeCompare(b.title)); break;
    }

    return result;
  }, [catalog, favorites, search, selectedCategory, selectedFormat, showFavoritesOnly, sortBy]);

  const handleRefreshFromSharePoint = useCallback(async () => {
    if (!isCatalogLoaded) {
      return;
    }

    setIsRefreshing(true);

    try {
      const response = await fetch('/api/templates/refresh', { method: 'POST' });
      const payload = await response.json();

      if (!response.ok) {
        if (payload.code === 'missing-sync-mirror' && payload.helpLink && payload.helpLabel) {
          const help = {
            message: payload.error as string,
            link: payload.helpLink as string,
            label: payload.helpLabel as string,
          };
          setRefreshHelp(help);
          addToast(help.message, 'warning');
          return;
        }

        throw new Error(payload.error || 'Unable to refresh the Template Library right now.');
      }

      setCatalog(payload.templates);
      setNewFromSharePoint(payload.newTemplates ?? []);
      setRefreshSummary(payload.summary);
      setRefreshHelp(null);
      addToast(payload.summary.message, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to refresh the Template Library right now.';
      addToast(message, 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [addToast, isCatalogLoaded]);

  const handleRelatedResource = useCallback((resource: TemplatePreviewResource) => {
    if (!resource.href) return;

    if (resource.external) {
      openExternalResource(resource.href);
      return;
    }

    if (resource.kind === 'template') {
      openedFromInAppRef.current = true;
      router.push(resource.href, { scroll: false });
      return;
    }

    router.push(resource.href);
    closePreview();
  }, [closePreview, openExternalResource, router]);

  if (!isCatalogLoaded) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading Template Library...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {refreshHelp && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Sync your Solution Ownership folder to OneDrive first
              </h3>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                The Template Library refresh reads from your locally synced OneDrive copy of the Solution Ownership Teams folder. Follow the steps below to set that up, then come back and click Refresh from SharePoint again.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRefreshHelp(null)}
              className="self-start p-1 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <ol className="space-y-3">
            {[
              {
                step: 1,
                heading: 'Open the Solution Ownership folder in SharePoint',
                detail: 'Click the button below to open the shared Solution Ownership folder in your browser. Sign in with your Presidio Microsoft account if prompted.',
                action: (
                  <button
                    type="button"
                    onClick={() => openExternalResource('https://presidio.sharepoint.com/:f:/r/teams/365-team-digital-delivery/Shared%20Documents/Solution%20Ownership?csf=1&web=1&e=bqvEpb')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white/80 dark:bg-amber-950/30 px-3 py-1.5 text-xs font-medium text-amber-900 dark:text-amber-200 hover:bg-white dark:hover:bg-amber-950/40 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Solution Ownership in SharePoint
                  </button>
                ),
              },
              {
                step: 2,
                heading: 'Click "Add shortcut to OneDrive" in SharePoint',
                detail: 'In the SharePoint toolbar at the top of the page, click "Add shortcut to OneDrive". This will add the Solution Ownership folder to your OneDrive and sync it to your computer.',
              },
              {
                step: 3,
                heading: 'Complete the OneDrive sync setup',
                detail: 'If prompted, sign in to OneDrive with your Presidio account. OneDrive will add the Solution Ownership folder to your computer. You can confirm it is syncing by looking for it in File Explorer (Windows) or Finder (Mac) under your OneDrive folder.',
              },
              {
                step: 4,
                heading: 'Return here and refresh',
                detail: 'Once the folder appears locally, come back to this page and click Refresh from SharePoint. The Template Library will scan your synced folder and surface any new templates automatically.',
              },
            ].map(({ step, heading, detail, action }) => (
              <li key={step} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-center">
                  {step}
                </span>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{heading}</p>
                  <p className="text-xs text-amber-800 dark:text-amber-300">{detail}</p>
                  {action}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {onboardingRecommended.length > 0 && !showFavoritesOnly && !search && (
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Recommended for onboarding
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Start with a small set of kickoff, planning, governance, and closeout resources. Use Preview to learn when each artifact fits before you open the source material.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onboardingRecommended.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isFavorite={favorites.has(template.id)}
                onToggleFavorite={toggleFavorite}
                onPreview={handlePreview}
                onDownload={handleDownload}
                highlighted
              />
            ))}
          </div>
        </div>
      )}

      {newFromSharePoint.length > 0 && !showFavoritesOnly && !search && (
        <div>
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              New from SharePoint
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              These artifacts were newly detected in the latest refresh from your synced Solution Ownership folder.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newFromSharePoint.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isFavorite={favorites.has(template.id)}
                onToggleFavorite={toggleFavorite}
                onPreview={handlePreview}
                onDownload={handleDownload}
                highlighted
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommended section */}
      {recommended.length > 0 && !showFavoritesOnly && !search && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Recommended for your current step
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.slice(0, 3).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isFavorite={favorites.has(template.id)}
                onToggleFavorite={toggleFavorite}
                onPreview={handlePreview}
                onDownload={handleDownload}
                highlighted
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                showFavoritesOnly
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                showFilters
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Category</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Format</label>
                  <div className="relative">
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value)}
                      className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                    >
                      {formats.map((f) => (
                        <option key={f} value={f}>{f === 'all' ? 'All Formats' : f}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Sort by</label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rated">Highest Rated</option>
                      <option value="recent">Most Recent</option>
                      <option value="alphabetical">A-Z</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filtered.length} template{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates found"
          description={showFavoritesOnly ? "You haven't favorited any templates yet." : 'Try adjusting your search or filters.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <TemplateCard
                template={template}
                isFavorite={favorites.has(template.id)}
                onToggleFavorite={toggleFavorite}
                onPreview={handlePreview}
                onDownload={handleDownload}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewTemplate}
        onClose={closePreview}
        title={previewTemplate?.title || ''}
        size="lg"
      >
        {previewTemplate && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[previewTemplate.category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                {previewTemplate.category}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${formatColors[previewTemplate.format] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                {previewTemplate.format}
              </span>
              {previewMetadata?.artifactType && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                  {previewMetadata.artifactType}
                </span>
              )}
              <span className="flex items-center gap-1 text-sm text-amber-600">
                <Star className="w-3.5 h-3.5 fill-current" /> {previewTemplate.rating}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Download className="w-3.5 h-3.5" /> {previewTemplate.downloads}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {previewMetadata?.summary ?? previewTemplate.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {previewMetadata?.whenToUse && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <Info className="w-3.5 h-3.5" />
                    When To Use
                  </div>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{previewMetadata.whenToUse}</p>
                </div>
              )}
              {previewMetadata?.workflowContext && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    <FolderOpen className="w-3.5 h-3.5" />
                    Workflow Context
                  </div>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{previewMetadata.workflowContext}</p>
                </div>
              )}
            </div>

            {previewMetadata?.keyContents && previewMetadata.keyContents.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <ListChecks className="w-3.5 h-3.5" />
                  What It Typically Contains
                </div>
                <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {previewMetadata.keyContents.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {previewMetadata?.relatedResources && previewMetadata.relatedResources.length > 0 && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Related Resources
                </div>
                <div className="mt-3 space-y-2">
                  {previewMetadata.relatedResources.map((resource) => {
                    const isClickable = !!resource.href;
                    return (
                      <button
                        key={resource.id}
                        type="button"
                        disabled={!isClickable}
                        onClick={() => isClickable && handleRelatedResource(resource)}
                        className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                          isClickable
                            ? 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                            : 'border-gray-200/70 dark:border-gray-700/70 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{resource.label}</div>
                            {resource.description && (
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{resource.description}</div>
                            )}
                          </div>
                          {isClickable && <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!previewMetadata && (
              <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                Preview metadata is not available for this artifact yet. Use the source action below to review the original resource.
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {previewMetadata?.sourceUrl && (
                <button
                  onClick={() => handleOpenSource(previewTemplate)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Open Source
                </button>
              )}
              <button
                onClick={() => { handleDownload(previewTemplate); closePreview(); }}
                disabled={!previewTemplate.resourceUrl}
                className={`flex-1 flex items-center justify-center gap-2 ${
                  previewTemplate.resourceUrl
                    ? 'btn-primary'
                    : 'px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" /> {previewTemplate.resourceLabel ?? 'Download'}
              </button>
              {previewMetadata?.relatedArticleUrl && (
                <button
                  onClick={() => {
                    router.push(previewMetadata.relatedArticleUrl!);
                    closePreview();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <FileText className="w-4 h-4" /> Related Workflow
                </button>
              )}
              <button
                onClick={() => toggleFavorite(previewTemplate.id)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  favorites.has(previewTemplate.id)
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Heart className={`w-4 h-4 ${favorites.has(previewTemplate.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// TemplateCard sub-component
function TemplateCard({
  template,
  isFavorite,
  onToggleFavorite,
  onPreview,
  onDownload,
  highlighted,
}: {
  template: Template;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPreview: (t: Template) => void;
  onDownload: (t: Template) => void;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3 ${
        highlighted
          ? 'border-primary-200 dark:border-primary-800 ring-1 ring-primary-100 dark:ring-primary-900/30'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{template.title}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{template.description}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(template.id); }}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
            isFavorite ? 'text-red-500' : 'text-gray-300 dark:text-gray-600 hover:text-red-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryColors[template.category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
          {template.category}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${formatColors[template.format] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
          {template.format}
        </span>
        {template.featured && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            Featured
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3 text-amber-500 fill-current" /> {template.rating}
        </span>
        <span className="flex items-center gap-1">
          <Download className="w-3 h-3" /> {template.downloads}
        </span>
        <span>{template.author}</span>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onPreview(template)}
          className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Preview
        </button>
        <button
          onClick={() => onDownload(template)}
          disabled={!template.resourceUrl}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            template.resourceUrl
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {template.resourceLabel ?? 'Download'}
        </button>
      </div>
    </div>
  );
}
