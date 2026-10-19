import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';
import { defaultNewsletterContent } from './newsletterContent';

export const defaultBlogSections = {
  banner: {
    label: 'Blog', title: 'Thoughts for a more connected care journey.',
    text: 'Read practical ideas about family conversations, care planning, and the everyday moments that matter.',
    image_alt: 'Care and connection for older people',
  },
  journal: {
    label: 'The Elder Care journal', title: 'Latest from the journal',
    text: 'Practical ideas for families navigating care, connection, and everyday life.',
    read_label: 'Read article', singular_label: 'article', plural_label: 'articles', featured_label: 'Featured',
    loading_text: 'Loading articles...', error_text: 'Articles could not be loaded. Please try again.',
    empty_title: 'No stories match your search.', empty_text: 'Try a different search term or browse all journal categories.',
    clear_label: 'Clear filters', retry_label: 'Try again', previous_label: 'Previous page', next_label: 'Next page', page_label: 'Page',
    image_alt: 'A caregiver spending time with an older person',
  },
  sidebar: {
    search_label: 'Search', search_placeholder: 'Search articles...', clear_label: 'Clear search',
    categories_label: 'Categories', all_label: 'All stories', recent_label: 'Recent posts', uncategorized_label: 'Uncategorized',
  },
  support: {
    label: 'Need support?', title: 'Every care journey starts with a conversation.',
    text: 'Tell us what your family is looking for and explore the next step together.', button_label: 'Talk to us', button_url: '/enquiry',
  },
  article: {
    back_label: 'Back to all articles', author_label: 'Elder Care editorial', journal_label: 'Care & family journal',
    loading_text: 'Loading article...', missing_title: 'Article not available',
    missing_text: 'This article may have moved or is no longer published. Explore the journal for more stories.',
    error_text: 'This article could not be loaded. Please try again.',
    support_title: 'Looking for support for your family?', support_text: 'Start a conversation about what your loved one needs.',
    button_label: 'Explore support', button_url: '/enquiry',
  },
  article_support: {
    label: 'Elder Care', title: 'Need help finding the right support?', text: "Start with a conversation about your family's needs.",
    button_label: 'Talk to us', button_url: '/enquiry',
  },
  newsletter: defaultNewsletterContent,
};
export type BlogSectionsContent = typeof defaultBlogSections;
export interface BlogPageContent {
  slug: 'blog'; name: string; path: '/blog'; seo: SeoSettings;
  sections: BlogSectionsContent; images: { banner: string; article_fallback: string };
}
export interface BlogCard {
  id: number; slug: string; title: string; excerpt: string; category: { slug: string; name: string } | null;
  image_url: string | null; image_alt: string; published_at: string; is_featured: boolean;
}
export interface BlogArticle extends BlogCard { content: string; public_author: string | null; seo: SeoSettings }
export interface BlogResult {
  posts?: BlogCard[]; post?: BlogArticle; pagination?: { page: number; pages: number; total: number };
  categories: { id: number; slug: string; name: string; count: number; seo_title?: string | null; seo_description?: string | null }[]; total: number; recent: BlogCard[];
}

export function useBlogPageContent(enabled: boolean) {
  const [page, setPage] = useState<BlogPageContent | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const result = await apiRequest<{ page: BlogPageContent }>('website/pages/blog');
        if (active && current === revision) setPage(result?.page?.slug === 'blog' ? result.page : null);
      } catch { if (active && current === revision) setPage(null); }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [enabled]);
  return enabled ? page : null;
}

export function useBlogJournal(enabled: boolean, article: string | null, search: string) {
  const params = new URLSearchParams(search);
  const filters = new URLSearchParams();
  for (const key of ['q', 'category', 'page']) {
    const value = params.get(key);
    if (value) filters.set(key, value);
  }
  const endpoint = article ? 'website/blog-posts/' + encodeURIComponent(article) : 'website/blog-posts?' + filters;
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ endpoint: string; data: BlogResult | null; loading: boolean; error: boolean; missing: boolean }>({
    endpoint: '', data: null, loading: true, error: false, missing: false,
  });
  const retry = useCallback(() => setRevision(current => current + 1), []);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let requestRevision = 0;
    const refresh = async () => {
      const current = ++requestRevision;
      try {
        const data = await apiRequest<BlogResult>(endpoint);
        if (!data || !Array.isArray(data.categories) || !Array.isArray(data.recent) || (article ? !data.post : !Array.isArray(data.posts))) throw new Error('Invalid journal response');
        if (active && current === requestRevision) setResult({ endpoint, data, loading: false, error: false, missing: false });
      } catch (error) {
        if (active && current === requestRevision) setResult({ endpoint, data: null, loading: false, error: true, missing: error instanceof ApiError && error.status === 404 });
      }
    };
    const timer = window.setTimeout(() => void refresh(), article ? 0 : 200);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.clearTimeout(timer); window.removeEventListener('focus', refresh); };
  }, [enabled, endpoint, article, revision]);
  return { ...(enabled && result.endpoint === endpoint ? result : { data: !article && !result.data?.post ? result.data : null, loading: true, error: false, missing: false }), retry };
}
export type BlogJournal = ReturnType<typeof useBlogJournal>;

export function blogSeo(page: BlogPageContent | null, journal: BlogJournal, article: string | null, search = ''): Partial<SeoSettings> {
  const fallback = page?.seo;
  if (!article) {
    const params = new URLSearchParams(search);
    const category = journal.data?.categories.find(category => category.slug === params.get('category'));
    const canonical = new URLSearchParams();
    if (category) canonical.set('category', category.slug);
    const pageNumber = Number(params.get('page'));
    if (Number.isInteger(pageNumber) && pageNumber > 1) canonical.set('page', String(pageNumber));
    return {
      ...fallback,
      ...(category?.seo_title ? { title: category.seo_title } : {}),
      ...(category?.seo_description ? { description: category.seo_description } : {}),
      ...(canonical.size ? { canonicalPath: '/blog?' + canonical } : {}),
      noIndex: Boolean(fallback?.noIndex || params.get('q') || (params.has('category') && !category) || journal.error || (journal.data?.pagination && pageNumber > journal.data.pagination.pages)),
    };
  }
  const post = journal.data?.post;
  if (!post) return { title: journal.missing ? 'Article Not Found | Elder Care' : 'Elder Care Journal | Elder Care', noIndex: true, noFollow: true };
  return {
    ...post.seo, keywords: post.seo.keywords.length ? post.seo.keywords : fallback?.keywords ?? [],
    image: post.seo.image || fallback?.image, imageAlt: post.seo.image ? post.seo.imageAlt : fallback?.imageAlt,
    noIndex: Boolean(post.seo.noIndex || fallback?.noIndex), noFollow: Boolean(post.seo.noFollow || fallback?.noFollow),
  };
}
