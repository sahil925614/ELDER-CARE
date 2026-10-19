import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronDown, RefreshCw, Search, X } from 'lucide-react';
import { useFaqCatalog } from '@/features/cms/faqCatalog';
import { defaultFaqSections, type FaqPageContent } from '@/features/cms/informationPages';
import { ExtraHero } from './components/WebsiteExtras';
import { PageCta } from './components/PageSections';
import './InformationPages.css';

export function FaqsPage() {
  const { faqsPage } = useOutletContext<{ faqsPage: FaqPageContent | null }>();
  const content = faqsPage?.sections ?? defaultFaqSections;
  const catalog = useFaqCatalog();
  const [selectedCategory, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const categories = catalog.data.categories.map(item => item.name);
  const category = categories.includes(selectedCategory) ? selectedCategory : '';
  const visible = catalog.data.faqs.map(item => ({ ...item, index: item.id }))
    .filter(item => (!category || item.category === category) && (item.question + ' ' + item.answer).toLowerCase().includes(query.trim().toLowerCase()));
  function clearFilters() { setQuery(''); setCategory(''); setOpenFaq(null); }
  return <>
    <ExtraHero label={content.banner.label} title={content.banner.title} text={content.banner.text} image={faqsPage?.images.banner} imageAlt={content.banner.image_alt} />
    <section className="faq-content py-16 sm:py-20">
      <div className="grid gap-8 border-b border-brand-100 pb-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
        <div className="min-w-0"><p className="section-eyebrow">{content.introduction.label}</p><h2 className="section-title max-w-md">{content.introduction.title}</h2></div>
        <p className="max-w-xl text-sm leading-7 text-slate-600 lg:justify-self-end">{content.introduction.text}</p>
      </div>
      <div className="py-8">
        <div className="relative max-w-2xl">
          <Search size={19} strokeWidth={1.6} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input type="search" maxLength={200} value={query} onChange={event => { setQuery(event.target.value); setOpenFaq(null); }} placeholder={content.display.search_placeholder} aria-label={content.display.search_label}
            className="h-14 w-full rounded-full border border-brand-100 bg-white pl-13 pr-12 text-sm text-brand-900 outline-none transition-colors placeholder:text-slate-400 focus:border-primary" />
          {query && <button type="button" onClick={() => { setQuery(''); setOpenFaq(null); }} title={content.display.clear_search_label} aria-label={content.display.clear_search_label} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-brand-50 hover:text-primary"><X size={16} aria-hidden="true" /></button>}
        </div>
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label={content.display.category_label}>
          {['', ...categories].map(value => <button key={value} type="button" aria-pressed={value === category} onClick={() => { setCategory(value); setOpenFaq(null); }}
            className={'max-w-full rounded-full border px-4 py-2 text-xs font-semibold transition-colors ' + (value === category ? 'border-primary bg-primary text-white' : 'border-brand-100 bg-white text-slate-500 hover:border-brand-200 hover:bg-brand-50 hover:text-primary')}>{value || content.display.all_label}</button>)}
        </div>
      </div>
      {catalog.status !== 'ready' && <div className="py-12 text-center" role={catalog.status === 'error' ? 'alert' : 'status'}>
        <p className="text-sm text-slate-600">{catalog.status === 'error' ? content.display.error_text : content.display.loading_text}</p>
        {catalog.status === 'error' && <button type="button" className="button-outline mt-5" onClick={catalog.retry}><RefreshCw size={16} aria-hidden="true" />{content.display.retry_label}</button>}
      </div>}
      {catalog.status === 'ready' && <><div className="flex items-center justify-between gap-5 border-b border-brand-100 pb-4">
        <p className="text-xs font-medium text-slate-400" role="status">{visible.length} {visible.length === 1 ? content.display.singular_label : content.display.plural_label} {content.display.found_label}</p>
        {(query || category) && <button type="button" onClick={clearFilters} className="text-xs font-semibold text-primary hover:underline">{content.display.clear_filters_label}</button>}
      </div>
      {visible.length > 0 ? <div className="border-b border-brand-100" data-faq-list>
        {visible.map((item, index) => {
          const key = item.index + ':' + item.question + ':' + item.answer;
          const isOpen = openFaq === key;
          const id = 'faq-answer-' + item.index;
          return <div key={item.index} className="border-b border-brand-100 last:border-b-0">
            <button type="button" aria-expanded={isOpen} aria-controls={id} id={'faq-question-' + item.index} onClick={() => setOpenFaq(current => current === key ? null : key)} className="group flex w-full items-start gap-4 py-6 text-left sm:gap-5 sm:py-7">
              <span className={'mt-1 w-7 shrink-0 text-[10px] font-semibold transition-colors ' + (isOpen ? 'text-primary' : 'text-brand-200')}>{String(index + 1).padStart(2, '0')}</span>
              <span className="min-w-0 flex-1"><span className={'block text-[10px] font-semibold uppercase transition-colors ' + (isOpen ? 'text-primary' : 'text-slate-400')}>{item.category}</span><span className="mt-2 block text-base font-semibold leading-6 text-brand-900 sm:text-[17px]">{item.question}</span></span>
              <span className={'grid size-9 shrink-0 place-items-center rounded-full border transition-all ' + (isOpen ? 'border-primary bg-primary text-white' : 'border-brand-100 text-primary group-hover:bg-brand-50')}><ChevronDown size={17} strokeWidth={1.8} className={'transition-transform ' + (isOpen ? 'rotate-180' : '')} aria-hidden="true" /></span>
            </button>
            <div id={id} role="region" aria-labelledby={'faq-question-' + item.index} hidden={!isOpen}>
              <div className="pb-7 pl-11 pr-4 sm:pl-12 sm:pr-16"><div className="max-w-3xl border-l-2 border-brand-100 pl-5"><p className="whitespace-pre-line text-sm leading-7 text-slate-600">{item.answer}</p></div></div>
            </div>
          </div>;
        })}
      </div> : <div className="py-14 text-center sm:py-16"><div className="mx-auto max-w-md"><p className="text-lg font-semibold text-brand-900">{content.display.empty_title}</p><p className="mt-2 text-sm leading-7 text-slate-500">{content.display.empty_text}</p><button type="button" className="button-outline mt-6" onClick={clearFilters}>{content.display.clear_filters_label}</button></div></div>}</>}
    </section>
    <PageCta content={content.newsletter} />
    {visible.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: visible.map(item => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })),
    }).replace(/</g, '\\u003c') }} />}
  </>;
}
