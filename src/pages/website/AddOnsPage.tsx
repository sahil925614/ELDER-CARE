import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowUpRight, Check, RotateCw } from 'lucide-react';
import { ExtraHero, EditorialPhoto, Intro } from './components/WebsiteExtras';
import { PageCta } from './components/PageSections';
import { CmsLink } from '@/features/cms/CmsLink';
import { defaultAddonsSections, useAddonsCatalogue, type AddonsPageContent } from '@/features/cms/addonsPage';
import { getCurrencyPreference } from '@/features/plans/currencyPreference';
import type { PlanCatalogItem } from '@/features/plans/planCatalog';
import './AddOnsPage.css';

type AddonService = PlanCatalogItem['addon_services'][number];

function categoryKey(service: AddonService) {
  return service.category_id != null ? 'id:' + service.category_id : service.category ? 'name:' + service.category : 'uncategorized';
}

function quoteUrl(url: string, name: string) {
  const target = new URL(url, window.location.origin);
  target.searchParams.set('interest', name);
  return url.startsWith('/') ? target.pathname + target.search + target.hash : target.href;
}

function AddonPhoto({ service, page }: { service: AddonService; page: AddonsPageContent | null }) {
  const [failed, setFailed] = useState(false);
  if (!service.image_url || failed) return <EditorialPhoto className="mb-6" image={page?.images.card_fallback}
    imageAlt={page?.sections.catalogue.image_alt ?? defaultAddonsSections.catalogue.image_alt} />;
  return <img src={service.image_url} alt={service.image_alt || service.name} loading="lazy" decoding="async"
    onError={() => setFailed(true)} className="mb-6 aspect-[4/3] w-full rounded-lg object-cover" />;
}

export function AddOnsPage() {
  const { addonsPage } = useOutletContext<{ addonsPage: AddonsPageContent | null }>();
  const sections = addonsPage?.sections ?? defaultAddonsSections;
  const [category, setCategory] = useState('all');
  const [currency, setCurrency] = useState(getCurrencyPreference);
  const catalogue = useAddonsCatalogue(currency);
  useEffect(() => {
    const sync = () => setCurrency(getCurrencyPreference());
    window.addEventListener('elder-care-currency-changed', sync);
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('elder-care-currency-changed', sync);
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);
  const items = Array.from(new Map(catalogue.plans.flatMap(plan => (plan.addon_services ?? []).map(service => [service.id, service] as const))).values());
  const categories = Array.from(new Map(items.map(service => [categoryKey(service), service.category || sections.catalogue.default_category])).entries());
  const filter = categories.some(([key]) => key === category) ? category : 'all';
  const visible = items.filter(item => filter === 'all' || categoryKey(item) === filter);

  return <>
    <ExtraHero label={sections.banner.label} title={sections.banner.title} text={sections.banner.text}
      image={addonsPage?.images.banner} imageAlt={sections.banner.image_alt} />
    <section className="py-16 sm:py-20" aria-busy={catalogue.loading}>
      <Intro eyebrow={sections.introduction.label} title={sections.introduction.title}>{sections.introduction.text}</Intro>
      <div className="mb-8 flex flex-wrap gap-3" role="group" aria-label="Filter add-on services">
        {[['all', sections.catalogue.all_label], ...categories].map(([key, label]) => <button type="button" key={key}
          className="extra-chip" aria-pressed={filter === key} onClick={() => setCategory(key)}>{label}</button>)}
      </div>
      <p className="sr-only" role="status">{visible.length} services shown</p>
      {(catalogue.loading || catalogue.error || !visible.length) && <div role="status" className="flex items-center gap-3 py-6 text-sm text-slate-600">
        <span>{catalogue.loading ? sections.catalogue.loading_text : catalogue.error ? sections.catalogue.error_text : sections.catalogue.empty_text}</span>
        {catalogue.error && <button type="button" onClick={catalogue.retry} title="Retry loading add-ons" aria-label="Retry loading add-ons"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-brand-200 bg-white text-primary hover:bg-brand-50"><RotateCw size={18} aria-hidden="true" /></button>}
      </div>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!catalogue.loading && !catalogue.error && visible.map(service => <article key={service.id} className="care-card flex flex-col">
          <AddonPhoto key={service.image_url ?? 'fallback'} service={service} page={addonsPage} />
          <p className="section-eyebrow">{service.category || sections.catalogue.default_category}</p>
          <h3 className="mt-3 text-2xl font-semibold text-brand-900">{service.name}</h3>
          <p className="my-4 text-sm leading-7 text-slate-600">{service.description}</p>
          <p className="mb-3 text-xs text-slate-500">{sections.catalogue.available_label}{' '}
            {catalogue.plans.filter(plan => plan.addon_services?.some(item => item.id === service.id)).map(plan => plan.name).join(', ')}
          </p>
          <p className="mb-6 flex items-center gap-2 text-sm text-primary"><Check size={17} className="shrink-0" aria-hidden="true" /><span className="min-w-0">
            {service.pricing_type === 'custom' ? sections.catalogue.quote_required_label :
              `${service.formatted_price} ${service.pricing_type === 'hourly' ? sections.catalogue.hour_label : service.pricing_type === 'per_visit' ? sections.catalogue.visit_label : sections.catalogue.unit_label} + ${service.tax_percentage}% ${sections.catalogue.tax_label}`}
          </span></p>
          <CmsLink to={service.pricing_type === 'custom' ? quoteUrl(sections.catalogue.quote_url, service.name) : sections.catalogue.purchase_url} className="text-link mt-auto">
            {service.pricing_type === 'custom' ? sections.catalogue.quote_label : sections.catalogue.purchase_label} <ArrowUpRight size={17} aria-hidden="true" />
          </CmsLink>
        </article>)}
      </div>
    </section>
    <PageCta content={sections.newsletter} />
  </>;
}
