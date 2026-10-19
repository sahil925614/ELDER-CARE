import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';
import { defaultNewsletterContent } from './newsletterContent';

export const defaultServicesSections = {
  banner: {
    label: 'Services', title: 'Everyday support. Extraordinary meaning.',
    text: "Care looks different for every person. Explore services that can support your loved one's health, comfort, and independence.",
    image_alt: 'Elder care services', primary_label: 'Explore services', primary_url: '/services#service-catalogue',
    secondary_label: 'Discuss your needs', secondary_url: '/contact',
  },
  catalogue: {
    label: 'Find your support', title: 'Care around your life.',
    text: 'Services, prices, and visit arrangements are confirmed for your location and requirements.',
    all_label: 'All services', enquiry_label: 'Enquire about this service', enquiry_url: '/contact',
  },
  support: {
    label: 'Support, your way', title: 'Start with what your family needs today.',
    text: 'Some families need ongoing support. Others simply need a little extra help from time to time. Both can begin with a conversation.',
    items: [
      { label: 'Ongoing support', title: 'Build care around everyday life.',
        text: 'Explore subscription plans for families looking for more consistent, ongoing care and support.',
        button_label: 'Explore care plans', button_url: '/plans' },
      { label: 'A little extra help', title: 'Add support when you need it.',
        text: 'Explore individual services for additional needs without starting with an ongoing subscription.',
        button_label: 'Discover add-on services', button_url: '/add-ons' },
    ],
    reassurance: "Not sure which path is right? You can discuss your family's needs with us before choosing.",
  },
  faq: {
    label: 'A little clarity', title_line_1: 'Your questions,', title_line_2: 'thoughtfully answered.',
    button_label: 'Explore all FAQs', button_url: '/faqs',
    items: [
      { question: 'Are all services available everywhere?', answer: 'Availability depends on the service, location, and professional schedules. Please confirm these details before booking.' },
      { question: 'Can my family discuss care before choosing?', answer: 'Yes. Use the contact page to outline what you are looking for and the questions you would like to discuss.' },
      { question: 'Are services included in every plan?', answer: 'Inclusions vary by plan. Confirm the published features and any additional charges before subscribing.' },
    ],
  },
  newsletter: defaultNewsletterContent,
};
export type ServicesSectionsContent = typeof defaultServicesSections;
export interface ServicesPageContent {
  slug: 'services'; name: string; path: '/services'; seo: SeoSettings;
  sections: ServicesSectionsContent; images: { banner: string };
}
export interface WebsiteService {
  id: number; name: string; slug: string; category_id: number; category_name: string;
  text: string; image_url: string | null; image_alt: string; icon: string; highlights: string[];
}
export interface ServiceCatalogue {
  categories: { id: number; name: string; slug: string }[];
  services: WebsiteService[];
}

export function useServicesPageContent(enabled: boolean) {
  const [page, setPage] = useState<ServicesPageContent | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const result = await apiRequest<{ page: ServicesPageContent }>('website/pages/services');
        if (active && current === revision) setPage(result?.page?.slug === 'services' ? result.page : null);
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

export function useServiceCatalogue() {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<ServiceCatalogue & { loading: boolean; error: boolean }>({
    categories: [], services: [], loading: true, error: false,
  });
  const refresh = useCallback(() => setRevision(current => current + 1), []);
  useEffect(() => {
    let active = true;
    let requestRevision = 0;
    const fetchServices = async () => {
      const current = ++requestRevision;
      try {
        const response = await apiRequest<ServiceCatalogue>('website/services');
        if (!Array.isArray(response?.services) || !Array.isArray(response?.categories)) throw new Error('Invalid service catalogue');
        if (active && current === requestRevision) setResult({ ...response, loading: false, error: false });
      } catch {
        if (active && current === requestRevision) setResult({ categories: [], services: [], loading: false, error: true });
      }
    };
    void fetchServices();
    window.addEventListener('focus', fetchServices);
    return () => { active = false; window.removeEventListener('focus', fetchServices); };
  }, [revision]);
  return { ...result, refresh };
}
