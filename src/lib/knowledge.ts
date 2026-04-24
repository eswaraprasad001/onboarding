import { Article } from '@/types';

export function getArticleHref(articleId?: string | null): string {
  if (!articleId) return '/app/knowledge';
  return `/app/knowledge?article=${encodeURIComponent(articleId)}`;
}

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function getSearchableText(article: Article): string {
  return normalize([
    article.title,
    article.description,
    article.author,
    article.category,
    article.tags.join(' '),
    article.content,
  ].join(' '));
}

function isListVisibleArticle(article: Article): boolean {
  return article.listVisibility !== 'supporting';
}

function getArticleSearchScore(article: Article, query: string): number {
  if (!query) return 0;

  const normalizedQuery = normalize(query);
  const title = normalize(article.title);
  const description = normalize(article.description);
  const author = normalize(article.author);
  const category = normalize(article.category);
  const tags = article.tags.map(normalize);
  const searchable = getSearchableText(article);

  let score = 0;

  if (title === normalizedQuery) score += 120;
  if (title.startsWith(normalizedQuery)) score += 80;
  if (title.includes(normalizedQuery)) score += 50;
  if (tags.some((tag) => tag === normalizedQuery)) score += 40;
  if (tags.some((tag) => tag.includes(normalizedQuery))) score += 25;
  if (category.includes(normalizedQuery)) score += 20;
  if (author.includes(normalizedQuery)) score += 15;
  if (description.includes(normalizedQuery)) score += 12;
  if (searchable.includes(normalizedQuery)) score += 6;

  return score;
}

export function filterKnowledgeArticles({
  articles,
  query,
  category,
  bookmarks,
  showBookmarksOnly,
}: {
  articles: Article[];
  query: string;
  category: string;
  bookmarks: Set<string>;
  showBookmarksOnly: boolean;
}): Article[] {
  const normalizedQuery = normalize(query);

  let result = articles.filter(isListVisibleArticle);

  if (showBookmarksOnly) {
    result = result.filter((article) => bookmarks.has(article.id));
  }

  if (category !== 'all') {
    result = result.filter((article) => article.category === category);
  }

  if (!normalizedQuery) {
    return [...result].sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.title.localeCompare(b.title);
    });
  }

  return result
    .map((article) => ({
      article,
      score: getArticleSearchScore(article, normalizedQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (!!a.article.featured !== !!b.article.featured) return a.article.featured ? -1 : 1;
      if (b.article.rating !== a.article.rating) return b.article.rating - a.article.rating;
      return a.article.title.localeCompare(b.article.title);
    })
    .map((entry) => entry.article);
}

export function getRelatedKnowledgeArticles(articles: Article[], article: Article | null): Article[] {
  if (!article?.relatedArticleIds) return [];
  return articles.filter((candidate) => article.relatedArticleIds?.includes(candidate.id));
}
