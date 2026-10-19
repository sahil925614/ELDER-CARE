import bannerImage from '@/assets/contactus.jpg';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Clock, HeartHandshake, ListChecks, Mail, MapPin, Phone, UserRound } from 'lucide-react';
import { defaultContactSections, type ContactPageContent } from '@/features/cms/contactPage';
import { CmsLink } from '@/features/cms/CmsLink';
import { WebsiteEnquiryForm } from '@/features/enquiries/WebsiteEnquiryForm';
import { PageHero, PageFaq } from './components/PageSections';
import './ContactPage.css';

const topicIcons = [HeartHandshake, ListChecks, UserRound];

export function ContactPage() {
  const { contactPage } = useOutletContext<{ contactPage: ContactPageContent | null }>();
  const content = contactPage?.sections ?? defaultContactSections;
  const [params] = useSearchParams();
  const interest = (params.get('interest') || '').slice(0, 200);
  const information = content.contact_information;
  const hasInformation = information.phone || information.email || information.address || information.hours;
  return <>
    <PageHero image={contactPage?.images.banner || bannerImage} imageFallback={bannerImage} imageAlt={content.banner.image_alt}
      label={content.banner.label} title={content.banner.title} text={content.banner.text} />
    <section className="grid items-start gap-10 py-16 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div className="min-w-0">
        <p className="section-eyebrow">{content.introduction.label}</p>
        <h2 className="section-title">{content.introduction.title_line_1}<br />{content.introduction.title_line_2}</h2>
        <p className="mt-5 leading-8 text-slate-600">{content.introduction.text}</p>
        <div className="mt-8 space-y-5">{content.introduction.items.map((item, index) => {
          const Icon = topicIcons[index];
          return <div key={index} className="flex gap-4"><span className="icon-bubble shrink-0"><Icon size={24} strokeWidth={1.5} aria-hidden="true" /></span><div className="min-w-0"><h3 className="font-semibold text-brand-900">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p></div></div>;
        })}</div>
        <div className="mt-9 rounded-2xl border border-brand-100 bg-brand-50 p-6">
          <h3 className="font-semibold text-brand-900">{information.title}</h3>
          {hasInformation ? <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
            {information.phone && <p className="flex items-start gap-3"><Phone size={18} className="mt-1 shrink-0 text-primary" aria-hidden="true" /><a className="min-w-0 hover:text-primary" href={'tel:' + information.phone.replace(/[^+0-9]/g, '')}>{information.phone}</a></p>}
            {information.email && <p className="flex items-start gap-3"><Mail size={18} className="mt-1 shrink-0 text-primary" aria-hidden="true" /><a className="min-w-0 hover:text-primary" href={'mailto:' + information.email}>{information.email}</a></p>}
            {information.address && <p className="flex items-start gap-3"><MapPin size={18} className="mt-1 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 whitespace-pre-line">{information.address}</span></p>}
            {information.hours && <p className="flex items-start gap-3"><Clock size={18} className="mt-1 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 whitespace-pre-line">{information.hours}</span></p>}
          </div> : <p className="mt-3 text-sm leading-7 text-slate-600">{information.text}</p>}
          <CmsLink to={information.account_url} className="text-link mt-4">{information.account_label}<ArrowUpRight size={17} className="shrink-0" aria-hidden="true" /></CmsLink>
        </div>
      </div>
      <WebsiteEnquiryForm key={interest} source="contact" content={content.form} interest={interest} />
    </section>
    <section className="border-y border-brand-100 py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div className="min-w-0"><p className="section-eyebrow">{content.explore.label}</p><h2 className="mt-3 text-2xl font-semibold text-brand-900 sm:text-[28px]">{content.explore.title}</h2></div><p className="max-w-sm text-sm leading-7 text-slate-500">{content.explore.text}</p></div>
      <div className="mt-9 grid border-t border-brand-100 md:grid-cols-3">{content.explore.items.map((item, index) => <CmsLink key={index} to={item.button_url} className={'group relative min-w-0 border-b border-brand-100 px-0 py-7 md:border-b-0 md:px-7 md:py-8 ' + (index ? 'md:border-l md:border-brand-100 ' : 'md:pl-0 ') + (index === 2 ? 'md:pr-0' : '')}>
        <div className="flex items-center justify-between"><span className="text-[10px] font-semibold text-primary">{String(index + 1).padStart(2, '0')}</span><ArrowUpRight size={17} className="shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" /></div>
        <h3 className="mt-7 text-lg font-semibold text-brand-900 group-hover:text-primary">{item.title}</h3><p className="mt-2 max-w-[250px] text-xs leading-6 text-slate-500">{item.text}</p><span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all group-hover:w-full" aria-hidden="true" />
      </CmsLink>)}</div>
    </section>
    <PageFaq content={content.faq} items={content.faq.items.map(item => [item.question, item.answer] as const)} />
  </>;
}

