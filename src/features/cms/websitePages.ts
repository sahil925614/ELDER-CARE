import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';
import type { HomeSectionsContent } from './homeSections';

export interface HomePageContent {
  slug: 'home';
  name: string;
  path: '/';
  seo: SeoSettings;
  sections: HomeSectionsContent;
  banner: {
    heading_line_1: string;
    heading_line_2: string | null;
    description: string;
    image_url: string;
    image_alt: string;
    primary_label: string;
    primary_url: string;
    secondary_label: string | null;
    secondary_url: string | null;
    benefits: Array<{ title: string; description: string }>;
  };
}

export const defaultHomeBanner: HomePageContent['banner'] = {
  heading_line_1: 'Exceptional Care,',
  heading_line_2: 'Unmatched Dignity',
  description: 'Dedicated to enhancing the quality of life for seniors, Elder Care offers compassionate services tailored to their unique needs and preferences.',
  image_url: '',
  image_alt: 'An older woman sharing a warm moment with her caregiver',
  primary_label: 'Take a Tour',
  primary_url: '/how-it-works',
  secondary_label: 'Learn more',
  secondary_url: '/about',
  benefits: [
    { title: 'Compassionate Care', description: 'Offering love, understanding, and support always.' },
    { title: 'Dignified Living', description: 'Ensuring respect and independence in every interaction.' },
  ],
};

export function useHomePageContent(enabled: boolean) {
  const [page, setPage] = useState<HomePageContent | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = () => {
      const requestRevision = ++revision;
      void apiRequest<{ page: HomePageContent }>('website/pages/home')
        .then((response) => { if (active && requestRevision === revision) setPage(response?.page ?? null); })
        .catch(() => { if (active && requestRevision === revision) setPage(null); });
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [enabled]);
  return enabled ? page : null;
}
