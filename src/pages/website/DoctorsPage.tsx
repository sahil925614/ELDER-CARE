import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { Activity, ArrowUpRight, CalendarDays, HeartHandshake, House, MapPin, MessageCircle, RotateCw, Stethoscope } from 'lucide-react';
import { defaultDoctorsSections, usePublicProfessionals, type DoctorsPageContent, type PublicProfessional } from '@/features/cms/doctorsPage';
import { CmsLink } from '@/features/cms/CmsLink';
import { ContentImage } from './components/ContentImage';
import { PageHero, PageCta, PageFaq } from './components/PageSections';
import bannerImage from '@/assets/Medicine delivery.jpg';
import careImage from '@/assets/elder-care.webp';
import './DoctorsPage.css';

const icons: Record<string, typeof HeartHandshake> = {
  'stethoscope': Stethoscope, 'activity': Activity, 'heart-handshake': HeartHandshake, 'house': House,
};

function ProfessionalPhoto({ professional }: { professional: PublicProfessional }) {
  const [failed, setFailed] = useState(false);
  const initials = professional.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
    {professional.image_url && !failed ? <img src={professional.image_url} alt={professional.image_alt} loading="lazy" decoding="async"
      onError={() => setFailed(true)} className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.025]" />
      : <div className="flex h-full items-center justify-center pb-16 text-4xl font-semibold text-primary" aria-hidden="true">{initials}</div>}
    <span className="absolute bottom-4 left-4 max-w-[calc(100%-2rem)] bg-white/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur-sm">{professional.role}</span>
  </div>;
}

export function DoctorsPage() {
  const { doctorsPage } = useOutletContext<{ doctorsPage: DoctorsPageContent | null }>();
  const sections = doctorsPage?.sections ?? defaultDoctorsSections;
  const directory = usePublicProfessionals();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { hash } = useLocation();
  const requestedType = params.get('type');
  const type = directory.types.some(item => String(item.id) === requestedType) ? requestedType : null;
  const visible = directory.providers.filter(item => type === null || String(item.type_id) === type);
  useEffect(() => {
    if (!directory.loading && hash === '#professional-directory') document.getElementById('professional-directory')?.scrollIntoView({ behavior: 'instant' });
  }, [directory.loading, hash]);
  function filter(value: number | null) {
    const next = new URLSearchParams(params);
    if (value === null) next.delete('type'); else next.set('type', String(value));
    navigate({ pathname: '/doctors', search: next.toString(), hash: '#professional-directory' }, { replace: true });
  }

  return <>
    <PageHero image={doctorsPage?.images.banner || bannerImage} imageFallback={bannerImage} imageAlt={sections.banner.image_alt}
      label={sections.banner.label} title={sections.banner.title} text={sections.banner.text}>
      <a href={sections.banner.primary_url} className="button-primary">{sections.banner.primary_label} <ArrowUpRight size={18} aria-hidden="true" /></a>
      <CmsLink to={sections.banner.secondary_url} className="button-outline">{sections.banner.secondary_label}</CmsLink>
    </PageHero>
    <section className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
      <div className="overflow-hidden rounded-[28px]"><img src={doctorsPage?.images.introduction || careImage} alt={sections.introduction.image_alt}
        className="aspect-[5/4] w-full object-cover" loading="lazy" decoding="async" onError={event => {
          if (event.currentTarget.src !== new URL(careImage, location.href).href) event.currentTarget.src = careImage;
        }} /></div>
      <div><p className="section-eyebrow">{sections.introduction.label}</p><h2 className="section-title">{sections.introduction.title_line_1}<br />{sections.introduction.title_line_2}</h2>
        <p className="mt-5 leading-8 text-slate-600">{sections.introduction.paragraph_1}</p><p className="mt-4 leading-8 text-slate-600">{sections.introduction.paragraph_2}</p></div>
    </section>
    <section id="care-disciplines" className="scroll-mt-28" aria-busy={directory.loading}>
      <p className="section-eyebrow">{sections.disciplines.label}</p><h2 className="section-title">{sections.disciplines.title}</h2>
      {(directory.loading || directory.error || !directory.types.length) && <div role="status" className="flex items-center gap-3 py-6 text-sm text-slate-600">
        {directory.loading ? sections.disciplines.loading_text : directory.error ? sections.directory.error_text : sections.disciplines.empty_text}
      </div>}
      <div className="mt-9 grid gap-6 md:grid-cols-3">{directory.types.map(item => {
        const Icon = icons[item.icon] ?? HeartHandshake;
        return <article key={item.id} className="care-card"><Link to={item.url} aria-label={sections.disciplines.explore_label + ' ' + item.title.toLowerCase()}>
          <ContentImage key={item.image_url} name={item.title} src={item.image_url} alt={item.image_alt} className="content-photo--card" /></Link>
          <span className="icon-bubble"><Icon size={29} strokeWidth={1.5} aria-hidden="true" /></span>
          <h3 className="mt-6 text-2xl font-semibold text-brand-900">{item.title}</h3><p className="mt-4 text-sm leading-7 text-slate-600">{item.text}</p>
          <Link to={item.url} className="text-link mt-7">{sections.disciplines.explore_label} {item.title.toLowerCase()} <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </article>;
      })}</div>
    </section>
    <section id="professional-directory" className="my-16 scroll-mt-28 sm:my-20" aria-busy={directory.loading}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="section-eyebrow">{sections.directory.label}</p><h2 className="section-title max-w-xl">{sections.directory.title}</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">{sections.directory.text}</p></div>
        <span className="w-fit rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-xs font-semibold text-primary">{sections.directory.badge_label}</span>
      </div>
      {directory.types.length > 0 && <div role="group" aria-label="Filter care professionals" className="mt-8 flex flex-wrap gap-2">
        <button type="button" className="extra-chip" aria-pressed={type === null} onClick={() => filter(null)}>{sections.directory.all_label}</button>
        {directory.types.map(item => <button key={item.id} type="button" className="extra-chip" aria-pressed={String(item.id) === type} onClick={() => filter(item.id)}>{item.title}</button>)}
      </div>}
      <p className="sr-only" role="status">{visible.length} professionals shown</p>
      {(directory.loading || directory.error || !visible.length) && <div role="status" className="mt-9 flex min-h-[160px] items-center gap-3 text-sm text-slate-600">
        {directory.loading ? sections.directory.loading_text : directory.error ? sections.directory.error_text : sections.directory.empty_text}
        {directory.error && <button type="button" onClick={directory.retry} title="Retry loading care experts" aria-label="Retry loading care experts" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-white text-primary"><RotateCw size={18} aria-hidden="true" /></button>}
      </div>}
      <div className="mt-9 grid gap-6 md:grid-cols-3">{visible.map(professional => <article key={professional.id} className="group overflow-hidden border border-brand-100 bg-white">
        <ProfessionalPhoto key={professional.image_url ?? 'initials'} professional={professional} />
        <div className="p-6"><h3 className="text-xl font-semibold tracking-tight text-brand-900">{professional.name}</h3>
          {professional.specialty && <p className="mt-2 text-sm leading-6 text-slate-600">{professional.specialty}</p>}
          {professional.location && <div className="mt-5 flex items-center gap-2 border-t border-brand-100 pt-4 text-xs text-slate-500">
            <MapPin size={15} strokeWidth={1.6} className="shrink-0 text-primary" aria-hidden="true" /><span>{professional.location}</span></div>}
        </div>
      </article>)}</div>
      <div className="mt-7 flex flex-col gap-4 border-l-2 border-primary pl-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <p className="max-w-2xl text-sm leading-6 text-slate-600">{sections.directory.note_text}</p>
        <CmsLink to={sections.directory.button_url} className="text-link shrink-0">{sections.directory.button_label}<ArrowUpRight size={17} aria-hidden="true" /></CmsLink>
      </div>
    </section>
    <section><p className="section-eyebrow">{sections.preparation.label}</p><h2 className="section-title">{sections.preparation.title}</h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">{sections.preparation.items.map((item, index) => {
        const Icon = [MessageCircle, CalendarDays][index];
        return <div key={index} className="rounded-2xl border border-brand-100 p-7"><Icon className="text-primary" size={27} aria-hidden="true" />
          <h3 className="mt-5 text-xl font-semibold text-brand-900">{item.title}</h3><p className="mt-3 leading-7 text-slate-600">{item.text}</p></div>;
      })}</div>
    </section>
    <section className="my-12 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-brand-100 bg-brand-50 p-8 sm:p-10">
      <div className="max-w-xl"><p className="section-eyebrow">{sections.partnership.label}</p><h2 className="section-title">{sections.partnership.title}</h2><p className="mt-4 leading-7 text-slate-600">{sections.partnership.text}</p></div>
      <CmsLink to={sections.partnership.button_url} className="button-primary">{sections.partnership.button_label}<ArrowUpRight size={18} aria-hidden="true" /></CmsLink>
    </section>
    <PageFaq content={sections.faq} items={sections.faq.items.map(item => [item.question, item.answer] as const)} />
    <PageCta content={sections.newsletter} />
  </>;
}
