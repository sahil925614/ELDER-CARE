import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw, Search, X } from 'lucide-react';
import DOMPurify from 'dompurify';
import { CmsLink } from '@/features/cms/CmsLink';
import { defaultBlogSections, type BlogCard, type BlogJournal, type BlogPageContent, type BlogSectionsContent } from '@/features/cms/blogPage';
import { ExtraHero, EditorialPhoto } from './components/WebsiteExtras';
import { PageCta } from './components/PageSections';
import './BlogPage.css';

type BlogContext = { blogPage: BlogPageContent | null; blogJournal: BlogJournal };
const articleUrl = (article: BlogCard) => '/blog/' + encodeURIComponent(article.slug);

export function BlogPage() {
  const { blogPage, blogJournal: journal } = useOutletContext<BlogContext>();
  const content = blogPage?.sections ?? defaultBlogSections;
  const [params, setParams] = useSearchParams();
  const { slug } = useParams();
  const navigate = useNavigate();
  const isArticle = Boolean(slug || params.get('article'));
  const post = journal.data?.post;
  useEffect(() => {
    if (post && (!slug || slug !== post.slug)) navigate(articleUrl(post), { replace: true });
  }, [post, slug, navigate]);

  function filter(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.delete('article');
    next.delete('page');
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: key === 'q' });
  }
  const categoryName = (article: BlogCard) => article.category?.name || content.sidebar.uncategorized_label;
  const photo = (article: BlogCard) => ({
    image: article.image_url || blogPage?.images.article_fallback,
    imageAlt: article.image_url ? article.image_alt : content.journal.image_alt,
  });
  const pagination = journal.data?.pagination;
  return <>
    <ExtraHero label={content.banner.label} title={content.banner.title} text={content.banner.text}
      image={blogPage?.images.banner} imageAlt={content.banner.image_alt} headingLevel={isArticle ? 'h2' : 'h1'} />
    <section className="blog-page py-14 sm:py-20">
      {isArticle ? <Link to="/blog" className="group mb-10 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-brand-900">
        <ArrowLeft size={17} aria-hidden="true" />{content.article.back_label}
      </Link> : <div className="mb-10 border-b border-brand-100 pb-8">
        <p className="section-eyebrow">{content.journal.label}</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="text-3xl font-semibold text-brand-900 sm:text-4xl">{content.journal.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">{content.journal.text}</p></div>
          <p role="status" className="shrink-0 text-sm text-slate-400">{journal.loading ? content.journal.loading_text : !journal.error && `${pagination?.total ?? 0} ${(pagination?.total ?? 0) === 1 ? content.journal.singular_label : content.journal.plural_label}`}</p>
        </div>
      </div>}
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_310px] lg:gap-14">
        <div className={isArticle ? 'min-w-0' : 'order-2 min-w-0 lg:order-1'} aria-busy={journal.loading}>
          {journal.loading ? <p role="status" className="border-y border-brand-100 py-14 text-slate-500">{isArticle ? content.article.loading_text : content.journal.loading_text}</p>
            : journal.error ? <div className="border-y border-brand-100 py-14">
              {journal.missing && <h1 className="text-3xl font-semibold text-brand-900">{content.article.missing_title}</h1>}
              <p role="alert" className="mt-3 leading-7 text-slate-600">{journal.missing ? content.article.missing_text : isArticle ? content.article.error_text : content.journal.error_text}</p>
              {!journal.missing && <button type="button" onClick={journal.retry} className="button-outline mt-6"><RefreshCw size={16} aria-hidden="true" />{content.journal.retry_label}</button>}
            </div> : isArticle && post ? <article>
              <p className="section-eyebrow">{categoryName(post)}</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.15] text-brand-900 sm:text-5xl">{post.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{post.excerpt}</p>
              <div className="mt-7 flex flex-wrap items-center gap-3 border-y border-brand-100 py-4">
                <span className="text-xs font-semibold text-brand-900">{post.public_author || content.article.author_label}</span>
                <span className="size-1 rounded-full bg-brand-200" aria-hidden="true" />
                <span className="text-xs text-slate-500">{content.article.journal_label}</span>
                {post.published_at && <time dateTime={post.published_at} className="text-xs text-slate-500">{new Date(post.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</time>}
              </div>
              <div className="mt-8 overflow-hidden rounded-[22px]"><div className="aspect-video"><EditorialPhoto className="h-full w-full" {...photo(post)} /></div></div>
              <ArticleBody content={post.content} />
              <div className="mt-12 border-y border-brand-100 py-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0"><p className="text-sm font-semibold text-brand-900">{content.article.support_title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{content.article.support_text}</p></div>
                <CmsLink to={content.article.button_url} className="button-outline shrink-0">{content.article.button_label}<ArrowUpRight size={16} aria-hidden="true" /></CmsLink>
              </div></div>
              <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt,
                datePublished: post.published_at, image: post.image_url || blogPage?.images.article_fallback,
                author: { '@type': 'Person', name: post.public_author || content.article.author_label },
              }).replace(/</g, '\\u003c') }} />
            </article> : (journal.data?.posts?.length ?? 0) > 0 ? <div className="divide-y divide-brand-100" data-blog-posts>
              {journal.data?.posts?.map(article => <article key={article.id} className="group py-8 first:pt-0 last:pb-0">
                <div className="grid gap-6 sm:grid-cols-[240px_1fr] lg:grid-cols-[270px_1fr]">
                  <Link to={articleUrl(article)} aria-label={content.journal.read_label + ': ' + article.title} className="block overflow-hidden rounded-[18px]">
                    <div className="aspect-[4/3] overflow-hidden"><EditorialPhoto {...photo(article)} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.025]" /></div>
                  </Link>
                  <div className="flex min-w-0 flex-col justify-center">
                    <p className="text-[11px] font-semibold uppercase text-primary">{categoryName(article)}{article.is_featured && <span className="ml-3 text-slate-500">{content.journal.featured_label}</span>}</p>
                    <h3 className="mt-3 text-2xl font-semibold leading-tight text-brand-900"><Link to={articleUrl(article)} className="hover:text-primary">{article.title}</Link></h3>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{article.excerpt}</p>
                    <Link to={articleUrl(article)} className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary hover:text-brand-900">{content.journal.read_label}<ArrowRight size={15} aria-hidden="true" /></Link>
                  </div>
                </div>
              </article>)}
            </div> : <div className="border-y border-brand-100 py-14 text-center">
              <Search size={29} strokeWidth={1.4} className="mx-auto text-brand-300" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-semibold text-brand-900">{content.journal.empty_title}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{content.journal.empty_text}</p>
              <button type="button" onClick={() => setParams({})} className="button-outline mt-6">{content.journal.clear_label}</button>
            </div>}
          {!isArticle && !journal.error && pagination && pagination.pages > 1 && <nav aria-label="Journal pagination" className="mt-10 flex items-center justify-between gap-4 border-t border-brand-100 pt-6">
            <button type="button" title={content.journal.previous_label} aria-label={content.journal.previous_label} disabled={journal.loading || pagination.page <= 1} className="button-outline size-11 shrink-0 !p-0 disabled:opacity-40" onClick={() => setParams(current => { current.set('page', String(pagination.page - 1)); return current; })}><ChevronLeft size={18} /></button>
            <span className="text-sm text-slate-500">{content.journal.page_label} {pagination.page} / {pagination.pages}</span>
            <button type="button" title={content.journal.next_label} aria-label={content.journal.next_label} disabled={journal.loading || pagination.page >= pagination.pages} className="button-outline size-11 shrink-0 !p-0 disabled:opacity-40" onClick={() => setParams(current => { current.set('page', String(pagination.page + 1)); return current; })}><ChevronRight size={18} /></button>
          </nav>}
        </div>
        <aside className={'min-w-0 self-start lg:sticky lg:top-28 ' + (isArticle ? '' : 'order-1 lg:order-2')}>
          <div className="space-y-9 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:border-l lg:border-brand-100 lg:pl-8 lg:pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {!isArticle && <div>
              <h2 className="text-lg font-semibold text-brand-900">{content.sidebar.search_label}</h2><div className="mt-4 h-px bg-brand-100" />
              <div className="relative mt-4"><Search size={18} className="pointer-events-none absolute left-0 top-3.5 text-slate-400" aria-hidden="true" />
                <label className="sr-only" htmlFor="journal-search">{content.sidebar.search_label}</label>
                <input id="journal-search" type="search" maxLength={200} value={params.get('q') || ''} onChange={event => filter('q', event.target.value)} placeholder={content.sidebar.search_placeholder} className="w-full border-0 border-b border-brand-100 bg-transparent py-3 pl-7 pr-8 text-sm outline-none focus:border-primary" />
                {params.get('q') && <button type="button" onClick={() => filter('q', '')} title={content.sidebar.clear_label} aria-label={content.sidebar.clear_label} className="absolute right-0 top-3 text-slate-400"><X size={18} /></button>}
              </div>
            </div>}
            {isArticle && <RecentPosts journal={journal} content={content} />}
            {(journal.data?.categories.length ?? 0) > 0 && <div>
              <h2 className="text-lg font-semibold text-brand-900">{content.sidebar.categories_label}</h2><div className="mt-4 h-px bg-brand-100" />
              <div className="mt-3">
                {!isArticle && <button type="button" aria-pressed={!params.get('category')} onClick={() => filter('category', '')} className={'flex w-full items-center justify-between gap-3 border-b border-brand-100 py-3.5 text-left text-sm ' + (!params.get('category') ? 'font-semibold text-primary' : 'text-slate-600')}><span>{content.sidebar.all_label}</span><span className="shrink-0 text-xs">{String(journal.data?.total ?? 0).padStart(2, '0')}</span></button>}
                {journal.data?.categories.map(category => isArticle ? <Link key={category.id} to={'/blog?category=' + encodeURIComponent(category.slug)} className="flex w-full items-center justify-between gap-3 border-b border-brand-100 py-3.5 text-sm text-slate-600 hover:text-primary">{category.name}<ArrowRight size={14} className="shrink-0" aria-hidden="true" /></Link>
                  : <button key={category.id} type="button" onClick={() => filter('category', category.slug)} aria-pressed={params.get('category') === category.slug} className={'flex w-full items-center justify-between gap-3 border-b border-brand-100 py-3.5 text-left text-sm hover:text-primary ' + (params.get('category') === category.slug ? 'font-semibold text-primary' : 'text-slate-600')}><span>{category.name}</span><span className="shrink-0 text-xs">{String(category.count).padStart(2, '0')}</span></button>)}
              </div>
            </div>}
            {!isArticle && <RecentPosts journal={journal} content={content} />}
            <SupportPanel content={isArticle ? content.article_support : content.support} />
          </div>
        </aside>
      </div>
    </section>
    <PageCta content={content.newsletter} />
  </>;
}

function RecentPosts({ journal, content }: { journal: BlogJournal; content: BlogSectionsContent }) {
  if (!journal.data?.recent.length) return null;
  return <div><h2 className="text-lg font-semibold text-brand-900">{content.sidebar.recent_label}</h2><div className="mt-4 h-px bg-brand-100" />
    <div className="mt-1 divide-y divide-brand-100">{journal.data?.recent.map((post, index) => <Link key={post.id} to={articleUrl(post)} className="group flex gap-4 py-5">
      <span className="shrink-0 pt-0.5 text-xs font-semibold text-brand-300">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0"><p className="text-[10px] font-semibold uppercase text-primary">{post.category?.name || content.sidebar.uncategorized_label}</p><h3 className="mt-1.5 text-sm font-semibold leading-5 text-brand-900 group-hover:text-primary">{post.title}</h3></div>
    </Link>)}</div>
  </div>;
}

function SupportPanel({ content }: { content: BlogSectionsContent['support'] }) {
  return <div className="bg-brand-50 p-6"><p className="section-eyebrow">{content.label}</p>
    <h2 className="mt-3 text-xl font-semibold leading-7 text-brand-900">{content.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{content.text}</p>
    <CmsLink to={content.button_url} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-brand-900">{content.button_label}<ArrowUpRight size={16} className="shrink-0" aria-hidden="true" /></CmsLink>
  </div>;
}

function ArticleBody({ content }: { content: string }) {
  const html = useMemo(() => DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'pre', 'code', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'width', 'height', 'colspan', 'rowspan'], ALLOW_DATA_ATTR: false,
  }), [content]);
  return <div className="blog-content mt-9 max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />;
}
