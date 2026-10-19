import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';
import { fetchPlanCatalog, type PlanCatalogItem } from '@/features/plans/planCatalog';
import { defaultNewsletterContent } from './newsletterContent';

export const defaultAddonsSections = {
  banner: {
    label: 'Add-on Services', title: 'A little extra support, when it matters.',
    text: "Explore additional care alongside your plan, or discuss a specific need with us. Choose support around your loved one's routine.",
    image_alt: 'Care and connection for older people',
  },
  introduction: {
    label: 'Care beyond the everyday', title: 'Make your care a little more personal.',
    text: 'Optional services are charged separately and are available with an active, paid subscription for your elder. Visit times are confirmed by the care team.',
  },
  catalogue: {
    all_label: 'All services', default_category: 'Service', available_label: 'Available with:',
    quote_required_label: 'Quote required', hour_label: 'per hour', visit_label: 'per visit',
    unit_label: 'per unit', tax_label: 'tax', quote_label: 'Request quote', quote_url: '/enquiry',
    purchase_label: 'View eligible services', purchase_url: '/customer/add-ons',
    loading_text: 'Loading services...', error_text: 'Services could not be loaded. Please try again.',
    empty_text: 'No add-ons available for this selection.', image_alt: 'A caregiver spending time with an older person',
  },
  newsletter: defaultNewsletterContent,
};
export type AddonsSectionsContent = typeof defaultAddonsSections;
export interface AddonsPageContent {
  slug: 'add-ons'; name: string; path: '/add-ons'; seo: SeoSettings;
  sections: AddonsSectionsContent; images: { banner: string; card_fallback: string };
}

export function useAddonsPageContent(enabled: boolean) {
  const [page, setPage] = useState<AddonsPageContent | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const result = await apiRequest<{ page: AddonsPageContent }>('website/pages/add-ons');
        if (active && current === revision) setPage(result?.page?.slug === 'add-ons' ? result.page : null);
      } catch {
        if (active && current === revision) setPage(null);
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [enabled]);
  return enabled ? page : null;
}

export function useAddonsCatalogue(currency: string) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ plans: PlanCatalogItem[]; currency: string; revision: number; error: boolean } | null>(null);
  const retry = useCallback(() => setRevision(current => current + 1), []);
  useEffect(() => {
    let active = true;
    let requestRevision = 0;
    const refresh = async () => {
      const current = ++requestRevision;
      try {
        const response = await fetchPlanCatalog(currency);
        if (!Array.isArray(response.plans)) throw new Error('Invalid add-on catalogue');
        if (active && current === requestRevision) setResult({ plans: response.plans, currency, revision, error: false });
      } catch {
        if (active && current === requestRevision) setResult({ plans: [], currency, revision, error: true });
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [currency, revision]);
  const pending = !result || result.currency !== currency || result.revision !== revision;
  return { plans: pending ? [] : result.plans, loading: pending, error: !pending && result.error, retry };
}
