import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';
import { fetchPlanCatalog, type PlanCatalogItem } from '@/features/plans/planCatalog';
import { defaultNewsletterContent } from './newsletterContent';

export const defaultPlansSections = {
  banner: {
    label: 'Care Plans', title: 'A thoughtful next chapter starts with a plan.',
    text: "Explore Basic, Standard, and Premium care options. Start with your loved one's needs, then confirm the services and terms that fit your family.",
    image_alt: 'Planning care for your loved ones', button_label: 'Explore the plans', button_url: '/plans#care-plans',
  },
  introduction: {
    label: 'Your care, your conversation', title: 'Start with what your family needs.',
    text: 'Explore three levels of ongoing support. Your final services, pricing, duration, and applicable terms will be confirmed before you subscribe.',
    duration_label: 'Preferred duration', months_label: 'months',
    help_text: 'This helps us understand what you would like to discuss. It does not create a subscription.',
  },
  catalogue: {
    popular_label: 'Most popular', price_label: 'Plan price', price_pending_label: 'Price pending',
    select_duration_label: 'Select a duration', converted_rate_label: 'live converted rate',
    services_label: 'Included services', unlimited_label: 'Unlimited', included_label: 'included',
    addons_label: 'Optional add-ons - extra charge', quote_label: 'Quote required', benefits_label: 'Plan benefits',
    duration_label: 'Preferred duration', duration_pending_label: 'Duration pending', choose_label: 'Choose',
    international_text: 'International price is converted from INR and will use PayPal checkout.',
    loading_text: 'Loading current plans...', error_text: 'Plans could not be loaded. Please try again.',
    empty_text: 'No active subscription plans are available right now.',
    text: 'Exact plan inclusions, visit frequency, pricing, taxes, offers, and available durations will be confirmed before you subscribe.',
  },
  story: {
    label: 'Built around your family', title: 'A care plan should begin with a person, not a package.',
    text: 'Before thinking about a plan name, start with everyday life. What support would make things easier? Which routines matter? Where would your loved one prefer to receive care?',
    image_alt: 'Planning care for a loved one', photo_title: 'The plan follows the person.',
    photo_text: 'Start with their needs, routines, preferences, and family.',
    questions: ['What support is needed today?', 'Which routines matter most?', 'How would your family like to stay involved?'],
    button_label: 'Talk through your options', button_url: '/contact?interest=Care%20planning',
  },
  checklist: {
    label: 'Before you choose', title: 'Clarity is part of good care.',
    text: 'Before subscribing, make sure your family understands exactly what the plan includes and how it works.',
    button_label: 'Ask us a question', button_url: '/contact',
    items: [
      { title: 'What is included?', text: 'Confirm the services, visit limits, care arrangements, and any separately charged add-ons.' },
      { title: 'How long is the plan?', text: 'Check available durations and minimum subscription periods. A six-month minimum may apply.' },
      { title: 'What are the terms?', text: 'Ask about taxes, renewal, cancellation, and any offer conditions before making a payment.' },
    ],
  },
  reassurance: {
    items: [
      { title: 'Understand first', text: 'Review the plan before making a decision.' },
      { title: 'Ask questions', text: 'Discuss anything that is unclear.' },
      { title: 'Confirm the details', text: 'Check inclusions, pricing, and terms.' },
    ],
  },
  faq: {
    label: 'A little clarity', title_line_1: 'Your questions,', title_line_2: 'thoughtfully answered.',
    button_label: 'Explore all FAQs', button_url: '/faqs',
    items: [
      { question: 'Can I add more services later?', answer: 'Additional services may be purchased separately, subject to availability and the applicable price. Explore our add-on services for more information.' },
      { question: 'Are promotional months included?', answer: 'Only published, applicable offers form part of a subscription. Confirm eligibility and the paid and free periods before subscribing.' },
      { question: 'Can I compare exact benefits and prices?', answer: 'The final plan catalogue is not published yet. Use the contact page to indicate which plan and duration you would like to discuss.' },
    ],
  },
  newsletter: defaultNewsletterContent,
};
export type PlansSectionsContent = typeof defaultPlansSections;
export interface PlansPageContent {
  slug: 'plans'; name: string; path: '/plans'; seo: SeoSettings;
  sections: PlansSectionsContent; images: { banner: string; story: string };
}

export function usePlansPageContent(enabled: boolean) {
  const [page, setPage] = useState<PlansPageContent | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const result = await apiRequest<{ page: PlansPageContent }>('website/pages/plans');
        if (active && current === revision) setPage(result?.page?.slug === 'plans' ? result.page : null);
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

export function usePlansCatalogue(currency: string) {
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
        if (!Array.isArray(response.plans)) throw new Error('Invalid plans catalogue');
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
