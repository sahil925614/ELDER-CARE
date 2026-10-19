import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';
import { defaultNewsletterContent } from './newsletterContent';

export const defaultTestimonialsSections = {
  ...{
  "banner": {
    "label": "Testimonials",
    "title": "Every family has a story worth hearing.",
    "text": "A space for families to share the moments, conversations, and support that made a difference.",
    "image_alt": "Care and connection for older people"
  },
  "introduction": {
    "label": "Family voices",
    "title": "Real experiences. Real moments of care.",
    "text": "Hear from families about the conversations, connections, and everyday support that made a difference to them.",
    "image_alt": "A caregiver spending time with an older person",
    "quote": "Care is personal. Every experience deserves to be heard.",
    "permission_text": "Customer stories are published only with appropriate permission."
  },
  "stories": {
    "label": "What families say",
    "title": "Stories shared from the heart.",
    "default_tag": "Family story",
    loading_text: 'Loading family stories...', error_text: 'Family stories are temporarily unavailable.', empty_text: 'Family stories will appear here soon.',
    retry_label: 'Retry testimonials', previous_label: 'Previous testimonials', next_label: 'Next testimonials', pause_label: 'Pause slideshow', play_label: 'Play slideshow',
    slider_label: 'Family testimonials', group_label: 'Go to testimonial group', sample_label: 'Illustrative sample',
  },
  "share": {
    "label": "Your experience",
    "title": "Have a story you would like to share?",
    "text": "We'd be glad to hear about the moments that made a difference to your family.",
    "button_label": "Share your story",
    "button_url": "/enquiry?interest=Share%20a%20story"
  }
},
  newsletter: defaultNewsletterContent,
};
export type TestimonialsSectionsContent = typeof defaultTestimonialsSections;
export interface TestimonialsPageContent {
  slug: 'testimonials';
  name: string;
  path: '/testimonials';
  seo: SeoSettings;
  sections: TestimonialsSectionsContent;
  images: { banner: string; introduction: string };
}
export interface PublishedTestimonial {
  id: number;
  name: string;
  relation: string | null;
  quote: string;
  tag: string | null;
  image_url: string | null;
  is_sample: boolean;
}

export function useTestimonialsPageContent(enabled: boolean) {
  const [page, setPage] = useState<TestimonialsPageContent | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const result = await apiRequest<{ page: TestimonialsPageContent }>('website/pages/testimonials');
        if (active && current === revision) setPage(result?.page?.slug === 'testimonials' ? result.page : null);
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

export function usePublishedTestimonials() {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ items: PublishedTestimonial[]; loading: boolean; error: boolean }>({
    items: [], loading: true, error: false,
  });
  const refresh = useCallback(() => setRevision(current => current + 1), []);
  useEffect(() => {
    let active = true;
    let requestRevision = 0;
    const fetchStories = async () => {
      const current = ++requestRevision;
      try {
        const response = await apiRequest<{ testimonials: PublishedTestimonial[] }>('website/testimonials');
        if (!Array.isArray(response?.testimonials)) throw new Error('Invalid testimonials response');
        if (active && current === requestRevision) setResult({ items: response.testimonials, loading: false, error: false });
      } catch {
        if (active && current === requestRevision) setResult({ items: [], loading: false, error: true });
      }
    };
    void fetchStories();
    window.addEventListener('focus', fetchStories);
    return () => { active = false; window.removeEventListener('focus', fetchStories); };
  }, [revision]);
  return { ...result, refresh };
}

