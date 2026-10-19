import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';
import { defaultContactSections } from './contactPage';

export const defaultEnquirySections = {
  banner: {
    label: 'Enquiry', title: 'Tell us about someone who matters to you.',
    text: 'You do not need all the answers to begin. Share the kind of support you are exploring and the questions on your mind.',
    image_alt: 'Care and connection for older people',
  },
  introduction: {
    label: 'Begin with a conversation', title: 'We can start with what matters most.',
    text: 'Tell us about everyday needs and preferences. Please leave medical records, identity documents, and other sensitive details out of this general enquiry.',
    image_alt: 'A caregiver spending time with an older person',
    items: [
      { text: 'Explore care before choosing a plan' },
      { text: 'Discuss your location and preferred support' },
      { text: 'Confirm services and costs before booking' },
    ],
    button_label: 'Find answers in our FAQs', button_url: '/faqs',
  },
  form: {
    ...defaultContactSections.form,
    title: 'Your care enquiry', text: 'Send your enquiry to our care team. An enquiry does not confirm an appointment.',
    city_label: 'City / location', care_for_label: 'Who is the care for?', care_for_placeholder: 'Select an option',
    care_options: { myself: 'Myself', parent: 'A parent', family: 'A family member', other: 'Someone else' },
    interest_label: 'What are you interested in?', interest_placeholder: 'Choose or type your interest',
    interest_options: [
      { label: 'Care plans' }, { label: 'Doctor visit' }, { label: 'Home care' }, { label: 'Physiotherapy' },
      { label: 'Nursing support' }, { label: 'Lab tests' }, { label: 'Medicine delivery' }, { label: 'General enquiry' },
    ],
    message_label: 'Tell us a little more', message_placeholder: 'What support are you exploring? Please avoid sensitive medical details.',
  },
};
export type EnquirySectionsContent = typeof defaultEnquirySections;
export interface EnquiryPageContent {
  slug: 'enquiry'; name: string; path: '/enquiry'; seo: SeoSettings;
  sections: EnquirySectionsContent; images: { banner: string; introduction: string };
}

export function useEnquiryPageContent(enabled: boolean) {
  const [page, setPage] = useState<EnquiryPageContent | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const response = await apiRequest<{ page: EnquiryPageContent }>('website/pages/enquiry');
        if (active && current === revision) setPage(response?.page?.slug === 'enquiry' ? response.page : null);
      } catch { if (active && current === revision) setPage(null); }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [enabled]);
  return enabled ? page : null;
}
