'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, Bookmark, BookOpen, Clock, Star, ArrowLeft, X, Link2, Check, RotateCcw } from 'lucide-react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import { articles, categoryColors, categories } from '@/data/articles';
import { PCR_ARTICLE_IDS } from '@/data/pcrProcess';
import { useGame } from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import PcrWorkflowArticle from '@/components/knowledge/PcrWorkflowArticle';
import EmptyState from '@/components/ui/EmptyState';
import { Article } from '@/types';
import { filterKnowledgeArticles, getArticleHref, getRelatedKnowledgeArticles } from '@/lib/knowledge';

const BOOKMARKS_KEY = 'presidio-bookmarks';
const READ_KEY = 'presidio-articles-read';

export default function KnowledgeView() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [readArticles, setReadArticles] = useState<Set<string>>(new Set());
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { addXP, checkBadge } = useGame();
  const { addToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openedFromInAppRef = useRef(false);

  const requestedArticleId = searchParams.get('article');
  const activeArticle = useMemo(
    () => (requestedArticleId ? articles.find((article) => article.id === requestedArticleId) ?? null : null),
    [requestedArticleId]
  );

  // Load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
      if (savedBookmarks) setBookmarks(new Set(JSON.parse(savedBookmarks)));
      const savedRead = localStorage.getItem(READ_KEY);
      if (savedRead) setReadArticles(new Set(JSON.parse(savedRead)));
    } catch { /* ignore */ }
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    const next = new Set(bookmarks);
    if (next.has(id)) {
      next.delete(id);
      addToast('Bookmark removed', 'info');
    } else {
      next.add(id);
      addToast('Article bookmarked', 'success');
      if (next.size >= 3) checkBadge('bookworm');
    }
    setBookmarks(next);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(next)));
  }, [addToast, bookmarks, checkBadge]);

  const markAsRead = useCallback((id: string) => {
    let didMarkAsRead = false;
    let updatedReadCount = 0;

    setReadArticles((prev) => {
      if (prev.has(id)) return prev;

      const next = new Set(prev);
      next.add(id);
      didMarkAsRead = true;
      updatedReadCount = next.size;
      localStorage.setItem(READ_KEY, JSON.stringify(Array.from(next)));
      return next;
    });

    if (!didMarkAsRead) return;

    addXP(15, 'Read an article');
    addToast('Article marked as read +15 XP', 'success');

    if (updatedReadCount >= 3) checkBadge('knowledge-seeker');
  }, [addToast, addXP, checkBadge]);

  const markAsUnread = useCallback((id: string) => {
    let didMarkAsUnread = false;

    setReadArticles((prev) => {
      if (!prev.has(id)) return prev;

      const next = new Set(prev);
      next.delete(id);
      didMarkAsUnread = true;
      localStorage.setItem(READ_KEY, JSON.stringify(Array.from(next)));
      return next;
    });

    if (didMarkAsUnread) {
      addToast('Article marked as unread', 'info');
    }
  }, [addToast]);

  const setArticleParam = useCallback((articleId: string | null, historyMode: 'push' | 'replace') => {
    const params = new URLSearchParams(searchParams.toString());
    if (articleId) {
      params.set('article', articleId);
    } else {
      params.delete('article');
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    if (historyMode === 'push') {
      router.push(nextUrl, { scroll: false });
      return;
    }
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  const openArticle = useCallback((article: Article) => {
    openedFromInAppRef.current = true;
    setArticleParam(article.id, 'push');
  }, [setArticleParam]);

  const closeArticle = useCallback(() => {
    if (openedFromInAppRef.current) {
      openedFromInAppRef.current = false;
      router.back();
      return;
    }

    setArticleParam(null, 'replace');
  }, [router, setArticleParam]);

  useEffect(() => {
    if (!requestedArticleId) return;
    if (activeArticle) return;
    setArticleParam(null, 'replace');
  }, [activeArticle, requestedArticleId, setArticleParam]);

  useEffect(() => {
    if (!activeArticle) return;
    markAsRead(activeArticle.id);
  }, [activeArticle, markAsRead]);

  useEffect(() => {
    if (!copiedLink) return;
    const timer = window.setTimeout(() => setCopiedLink(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copiedLink]);

  const filtered = useMemo(() => {
    return filterKnowledgeArticles({
      articles,
      query: search,
      category: selectedCategory,
      bookmarks,
      showBookmarksOnly,
    });
  }, [search, selectedCategory, showBookmarksOnly, bookmarks]);

  const relatedArticles = useMemo(() => {
    return getRelatedKnowledgeArticles(articles, activeArticle);
  }, [activeArticle]);

  const relatedSectionTitle = useMemo(() => {
    if (!relatedArticles.length) return 'Related Articles';
    return relatedArticles.some((article) => article.listVisibility === 'supporting')
      ? 'Related Resources'
      : 'Related Articles';
  }, [relatedArticles]);

  const isPcrWorkflowArticle = activeArticle?.id === PCR_ARTICLE_IDS.primary;

  const copyArticleLink = useCallback(async (article: Article) => {
    if (typeof window === 'undefined') return;
    const fullUrl = `${window.location.origin}${getArticleHref(article.id)}`;

    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedLink(true);
      addToast('Article link copied', 'success');
    } catch {
      addToast('Unable to copy article link', 'error');
    }
  }, [addToast]);

  // Article reader view
  if (activeArticle) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <button
          onClick={closeArticle}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to articles
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeArticle.title}</h1>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>{activeArticle.author}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activeArticle.readTime}</span>
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> {activeArticle.rating}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[activeArticle.category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                    {activeArticle.category}
                  </span>
                  {activeArticle.featured && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      Featured
                    </span>
                  )}
                  {activeArticle.listVisibility === 'supporting' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      Resource
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyArticleLink(activeArticle)}
                  className={`p-2 rounded-lg transition-colors ${
                    copiedLink
                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label="Copy article link"
                  title="Copy article link"
                >
                  {copiedLink ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => (
                    readArticles.has(activeArticle.id)
                      ? markAsUnread(activeArticle.id)
                      : markAsRead(activeArticle.id)
                  )}
                  className={`p-2 rounded-lg transition-colors ${
                    readArticles.has(activeArticle.id)
                      ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                      : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label={readArticles.has(activeArticle.id) ? 'Mark article as unread' : 'Mark article as read'}
                  title={readArticles.has(activeArticle.id) ? 'Mark article as unread' : 'Mark article as read'}
                >
                  {readArticles.has(activeArticle.id) ? <RotateCcw className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => toggleBookmark(activeArticle.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    bookmarks.has(activeArticle.id)
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label={bookmarks.has(activeArticle.id) ? 'Remove bookmark' : 'Bookmark article'}
                  title={bookmarks.has(activeArticle.id) ? 'Remove bookmark' : 'Bookmark article'}
                >
                  <Bookmark className={`w-5 h-5 ${bookmarks.has(activeArticle.id) ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isPcrWorkflowArticle ? (
              <PcrWorkflowArticle />
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{activeArticle.content}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        {/* Related articles */}
        {relatedArticles.length > 0 && !isPcrWorkflowArticle && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{relatedSectionTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isBookmarked={bookmarks.has(article.id)}
                  isRead={readArticles.has(article.id)}
                  onToggleBookmark={toggleBookmark}
                  onClick={openArticle}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
            showBookmarksOnly
              ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${showBookmarksOnly ? 'fill-current' : ''}`} />
          Bookmarks
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{filtered.length} article{filtered.length !== 1 ? 's' : ''}</span>
        <span>{readArticles.size} read</span>
        <span>{bookmarks.size} bookmarked</span>
      </div>

      {/* Articles */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No articles found"
          description={showBookmarksOnly ? "You haven't bookmarked any articles yet." : 'Try adjusting your search or category filter.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <ArticleCard
                article={article}
                isBookmarked={bookmarks.has(article.id)}
                isRead={readArticles.has(article.id)}
                onToggleBookmark={toggleBookmark}
                onClick={openArticle}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ArticleCard({
  article,
  isBookmarked,
  isRead,
  onToggleBookmark,
  onClick,
}: {
  article: Article;
  isBookmarked: boolean;
  isRead: boolean;
  onToggleBookmark: (id: string) => void;
  onClick: (a: Article) => void;
}) {
  return (
    <div
      onClick={() => onClick(article)}
      className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm hover:shadow-md transition-all p-4 cursor-pointer group ${
        isRead
          ? 'border-green-200 dark:border-green-900/40'
          : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
              {article.title}
            </h4>
            {isRead && (
              <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                Read
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{article.description}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(article.id); }}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ml-2 ${
            isBookmarked ? 'text-primary-600 dark:text-primary-400' : 'text-gray-300 dark:text-gray-600 hover:text-primary-500'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span className={`px-2 py-0.5 rounded-full font-medium ${categoryColors[article.category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
          {article.category}
        </span>
        {article.featured && (
          <span className="px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            Featured
          </span>
        )}
        {article.listVisibility === 'supporting' && (
          <span className="px-2 py-0.5 rounded-full font-medium bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            Resource
          </span>
        )}
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-current" /> {article.rating}</span>
      </div>

      <div className="flex gap-1.5 mt-2 flex-wrap">
        {article.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
