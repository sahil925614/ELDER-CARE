import { useOutletContext } from 'react-router-dom';
import { ArrowUpRight, Info } from 'lucide-react';
import { CmsLink } from '@/features/cms/CmsLink';
import { defaultPrivacySections, type PrivacyPageContent } from '@/features/cms/informationPages';
import { ExtraHero } from './components/WebsiteExtras';
import './InformationPages.css';

export function PrivacyPolicyPage() {
  const { privacyPage } = useOutletContext<{ privacyPage: PrivacyPageContent | null }>();
  const content = privacyPage?.sections ?? defaultPrivacySections;
  const sections = content.policy.items;
  return <>
    <ExtraHero label={content.banner.label} title={content.banner.title} text={content.banner.text} image={privacyPage?.images.banner} imageAlt={content.banner.image_alt} />
    <section className="privacy-content py-16 sm:py-20">
      <div className="grid gap-8 border-b border-brand-100 pb-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16">
        <div className="min-w-0"><p className="section-eyebrow">{content.introduction.label}</p><h2 className="section-title max-w-lg">{content.introduction.title}</h2></div>
        <p className="max-w-xl text-sm leading-7 text-slate-600 lg:justify-self-end">{content.introduction.text}</p>
      </div>
      {content.notice.visibility !== 'hidden' && <div className="my-9 flex items-start gap-4 border-y border-brand-100 bg-brand-50 px-5 py-5 sm:px-6" data-policy-notice>
        <Info size={20} strokeWidth={1.6} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" /><div className="min-w-0"><p className="text-sm font-semibold text-brand-900">{content.notice.title}</p><p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{content.notice.text}</p></div>
      </div>}
      {content.notice.effective_date && <p className="my-6 text-sm text-slate-500">{content.notice.effective_label}: <time dateTime={content.notice.effective_date}>{new Date(content.notice.effective_date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</time></p>}
      <div className={'grid items-start gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16 ' + (content.notice.visibility === 'hidden' && !content.notice.effective_date ? 'mt-9' : '')}>
        <aside className="min-w-0 lg:sticky lg:top-28"><p className="text-[10px] font-semibold uppercase text-slate-400">{content.navigation.label}</p>
          <nav aria-label={content.navigation.aria_label} className="mt-5 border-l border-brand-100"><ol>{sections.map((section, index) => <li key={index}>
            <a href={'#privacy-' + (index + 1)} className="group flex items-start gap-3 border-l-2 border-transparent py-2.5 pl-4 text-sm leading-5 text-slate-500 transition-colors hover:border-primary hover:text-primary"><span className="w-5 shrink-0 text-[10px] font-semibold text-brand-200 group-hover:text-primary">{String(index + 1).padStart(2, '0')}</span><span className="min-w-0">{section.heading}</span></a>
          </li>)}</ol></nav>
        </aside>
        <div className="min-w-0">{sections.map((section, index) => <section id={'privacy-' + (index + 1)} key={index} className="grid scroll-mt-32 gap-5 border-b border-brand-100 py-8 first:pt-0 sm:grid-cols-[52px_1fr] sm:gap-6">
          <span aria-hidden="true" className="text-sm font-semibold text-brand-200">{String(index + 1).padStart(2, '0')}</span>
          <div className="min-w-0"><h2 className="text-xl font-semibold leading-tight text-brand-900 sm:text-2xl">{section.heading}</h2><p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">{section.text}</p></div>
        </section>)}
          <div className="flex flex-col gap-5 pt-9 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-sm font-semibold text-brand-900">{content.contact.title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{content.contact.text}</p></div>
            <CmsLink to={content.contact.button_url} className="button-outline group shrink-0">{content.contact.button_label}<ArrowUpRight size={16} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></CmsLink>
          </div>
        </div>
      </div>
    </section>
  </>;
}
