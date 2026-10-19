import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, ArrowUpRight, Check, FlaskConical, HeartHandshake, House, Pill, RotateCw, Stethoscope } from 'lucide-react';
import { CmsLink } from '@/features/cms/CmsLink';
import { defaultServicesSections, useServiceCatalogue, type ServicesPageContent } from '@/features/cms/servicesPage';
import { ContentImage } from './components/ContentImage';
import { PageHero, PageCta, PageFaq } from './components/PageSections';
import bannerImage from '@/assets/service.jpg';
import './ServicesPage.css';

const serviceIcons: Record<string, typeof HeartHandshake> = {
  'stethoscope': Stethoscope, 'activity': Activity, 'heart-handshake': HeartHandshake,
  'house': House, 'flask-conical': FlaskConical, 'pill': Pill,
};

function enquiryUrl(url: string, service: string) {
  const target = new URL(url, window.location.origin);
  target.searchParams.set('interest', service);
  return url.startsWith('/') ? target.pathname + target.search + target.hash : target.href;
}

export function ServicesPage() {
  const { servicesPage } = useOutletContext<{ servicesPage: ServicesPageContent | null }>();
  const sections = servicesPage?.sections ?? defaultServicesSections;
  const catalogue = useServiceCatalogue();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const filter = catalogue.categories.some(category => category.id === selectedCategory) ? selectedCategory : null;
  const visible = catalogue.services.filter(service => filter === null || service.category_id === filter);
  const filters = [{ id: null, name: sections.catalogue.all_label }, ...catalogue.categories];

  return <>
    <PageHero image={servicesPage?.images.banner || bannerImage} imageFallback={bannerImage}
      imageAlt={sections.banner.image_alt} label={sections.banner.label} title={sections.banner.title} text={sections.banner.text}>
      <a href={sections.banner.primary_url} className="button-primary">{sections.banner.primary_label} <ArrowUpRight size={18} /></a>
      <CmsLink to={sections.banner.secondary_url} className="button-outline">{sections.banner.secondary_label}</CmsLink>
    </PageHero>
    <section id="service-catalogue" className="scroll-mt-28 py-16 sm:py-20" aria-busy={catalogue.loading}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div><p className="section-eyebrow">{sections.catalogue.label}</p><h2 className="section-title">{sections.catalogue.title}</h2></div>
        <p className="max-w-md text-sm leading-7 text-slate-600">{sections.catalogue.text}</p>
      </div>
      <div className="my-8 flex flex-wrap gap-2" role="group" aria-label="Filter services">
        {filters.map(category => <button key={category.id ?? 'all'} type="button" aria-pressed={filter === category.id}
          onClick={() => setSelectedCategory(category.id)}
          className={'rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ' +
            (filter === category.id ? 'border-primary bg-primary text-white' : 'border-brand-100 bg-white text-primary hover:bg-brand-50')}>
          {category.name}
        </button>)}
      </div>
      <p className="sr-only" role="status">{visible.length} services shown</p>
      {catalogue.loading || catalogue.error || !visible.length ? <div className="flex min-h-[290px] items-center justify-center gap-3 text-sm text-slate-600" role="status">
        {catalogue.loading ? 'Loading services...' : catalogue.error ? 'Services could not be loaded.' : 'No services are available right now.'}
        {catalogue.error && <button type="button" onClick={catalogue.refresh} title="Retry loading services" aria-label="Retry loading services" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-white text-primary hover:bg-brand-50"><RotateCw size={18} aria-hidden="true" /></button>}
      </div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map(service => {
          const Icon = serviceIcons[service.icon] ?? HeartHandshake;
          return <article key={service.id} className="care-card flex flex-col">
            <ContentImage key={service.image_url ?? service.name} name={service.name} src={service.image_url} alt={service.image_alt} className="content-photo--card" />
            <span className="icon-bubble"><Icon size={27} strokeWidth={1.5} aria-hidden="true" /></span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-primary">{service.category_name}</p>
            <h3 className="mt-2 text-2xl font-semibold text-brand-900">{service.name}</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">{service.text}</p>
            <ul className="my-6 space-y-3">{service.highlights.map((point, index) => <li key={index} className="flex gap-2 text-sm leading-6 text-slate-600">
              <Check size={17} className="mt-1 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0">{point}</span>
            </li>)}</ul>
            <CmsLink to={enquiryUrl(sections.catalogue.enquiry_url, service.name)} className="text-link mt-auto">
              {sections.catalogue.enquiry_label}<span className="sr-only">: {service.name}</span><ArrowUpRight size={17} aria-hidden="true" />
            </CmsLink>
          </article>;
        })}
      </div>}
    </section>
    <section className="relative inner-page-full-width overflow-hidden border-y border-brand-100 bg-brand-50/55">
      <div className="page-container py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">{sections.support.label}</p><h2 className="section-title">{sections.support.title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600">{sections.support.text}</p>
        </div>
        <div className="relative mx-auto mt-10 hidden h-12 max-w-4xl sm:block" aria-hidden="true">
          <span className="absolute left-1/2 top-0 h-6 w-px -translate-x-1/2 bg-brand-200" />
          <span className="absolute left-1/4 right-1/4 top-6 h-px bg-brand-200" />
          <span className="absolute left-1/4 top-6 h-6 w-px bg-brand-200" />
          <span className="absolute right-1/4 top-6 h-6 w-px bg-brand-200" />
        </div>
        <div className="mx-auto grid max-w-5xl gap-px overflow-hidden border border-brand-100 bg-brand-100 sm:grid-cols-2">
          {sections.support.items.map((item, index) => <CmsLink key={index} to={item.button_url}
            className={'group relative flex min-h-[300px] flex-col p-7 transition-colors duration-300 sm:p-9 lg:p-10 ' +
              (index === 0 ? 'bg-white hover:bg-brand-50' : 'bg-primary text-white hover:bg-brand-900')}>
            <div className="flex items-start justify-between gap-5">
              <span className={'text-xs font-semibold uppercase tracking-[0.16em] ' + (index === 0 ? 'text-primary' : 'text-white/75')}>{item.label}</span>
              <ArrowUpRight size={20} strokeWidth={1.5} className={'shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ' + (index === 0 ? 'text-primary' : 'text-white')} aria-hidden="true" />
            </div>
            <div className="my-auto py-8">
              <h3 className={'max-w-sm text-2xl font-semibold leading-tight tracking-tight sm:text-3xl ' + (index === 0 ? 'text-brand-900' : 'text-white')}>{item.title}</h3>
              <p className={'mt-4 max-w-md text-sm leading-7 ' + (index === 0 ? 'text-slate-600' : 'text-white/75')}>{item.text}</p>
            </div>
            <div className={'flex items-center border-t pt-5 text-sm font-semibold ' + (index === 0 ? 'border-brand-100 text-primary' : 'border-white/20 text-white')}>{item.button_label}</div>
          </CmsLink>)}
        </div>
        <p className="mx-auto mt-7 max-w-2xl text-center text-xs leading-6 text-slate-500">{sections.support.reassurance}</p>
      </div>
    </section>
    <PageFaq content={sections.faq} items={sections.faq.items.map(item => [item.question, item.answer] as const)} />
    <PageCta content={sections.newsletter} />
  </>;
}
