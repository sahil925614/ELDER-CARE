import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';
import { defaultNewsletterContent } from './newsletterContent';

export const defaultDoctorsSections = {
  banner: {
    label: 'Care Experts', title: 'Professional care. A personal connection.',
    text: "Explore the types of professionals who may support your loved one's care. The right conversation starts with understanding the individual.",
    image_alt: 'Care and support from healthcare professionals', primary_label: 'Explore care disciplines', primary_url: '/doctors#care-disciplines',
    secondary_label: 'Discuss your care needs', secondary_url: '/contact?interest=Care%20professional',
  },
  introduction: {
    label: 'Care with understanding', title_line_1: 'More than a visit.', title_line_2: 'Someone who listens.',
    paragraph_1: "Good care leaves room for questions. Your loved one's preferences, daily routines, and concerns should be part of the conversation with their care professional.",
    paragraph_2: "Before arranging a visit, discuss the kind of support required and confirm the professional's qualifications, scope of care, and availability.",
    image_alt: 'A care professional speaking with an older person',
  },
  disciplines: {
    label: 'Explore the possibilities', title: 'Different expertise. A shared focus on care.', explore_label: 'Explore',
    loading_text: 'Loading care disciplines...', empty_text: 'No care disciplines are currently published.',
  },
  directory: {
    label: 'Professional directory', title: 'Meet the people behind the care.',
    text: "Explore professional profiles and discuss the right support for your family's needs.",
    badge_label: 'Care professionals', all_label: 'All professionals',
    loading_text: 'Loading care professionals...', empty_text: 'No professional profiles are currently published.',
    error_text: 'Care professionals could not be loaded. Please try again.',
    note_text: 'Confirm professional qualifications, scope of care, locations and visit availability with the care team before arranging a visit.',
    button_label: 'Discuss your care needs', button_url: '/contact?interest=Care%20professional',
  },
  preparation: {
    label: 'Prepare for your conversation', title: 'A few details can make a difference.',
    items: [
      { title: 'Share what matters', text: 'Describe the support you need, your location, and any preferences for the visit. Share medical details only through the agreed care process.' },
      { title: 'Confirm the arrangements', text: 'Check the date, visit format, fees, and what to prepare. A preferred appointment date is not a confirmed booking.' },
    ],
  },
  partnership: {
    label: 'For doctors', title: 'Bring your expertise to elder care.',
    text: 'Introduce your practice and explore a partnership built around thoughtful, personal care.',
    button_label: 'Become a Partner', button_url: '/become-a-partner',
  },
  faq: {
    label: 'A little clarity', title_line_1: 'Your questions,', title_line_2: 'thoughtfully answered.',
    button_label: 'Explore all FAQs', button_url: '/faqs',
    items: [
      { question: 'Can I choose a specific professional?', answer: 'Available choices and schedules can be confirmed with the care team as part of the booking process. A published profile does not guarantee appointment availability.' },
      { question: 'Are home visits available?', answer: 'Visit formats depend on the service and location. Confirm home-visit availability and any travel charges before booking.' },
    ],
  },
  newsletter: defaultNewsletterContent,
};
export type DoctorsSectionsContent = typeof defaultDoctorsSections;
export interface DoctorsPageContent {
  slug: 'doctors'; name: string; path: '/doctors'; seo: SeoSettings;
  sections: DoctorsSectionsContent; images: { banner: string; introduction: string };
}
export interface CareDiscipline {
  id: number; slug: string; title: string; text: string; icon: string; image_url: string; image_alt: string; url: string;
}
export interface PublicProfessional {
  id: number; type_id: number; name: string; role: string; specialty: string | null; location: string;
  image_url: string | null; image_alt: string;
}

export function useDoctorsPageContent(enabled: boolean) {
  const [page, setPage] = useState<DoctorsPageContent | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const result = await apiRequest<{ page: DoctorsPageContent }>('website/pages/doctors');
        if (active && current === revision) setPage(result?.page?.slug === 'doctors' ? result.page : null);
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

export function usePublicProfessionals() {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<{ types: CareDiscipline[]; providers: PublicProfessional[]; loading: boolean; error: boolean }>({
    types: [], providers: [], loading: true, error: false,
  });
  const retry = useCallback(() => setRevision(current => current + 1), []);
  useEffect(() => {
    let active = true;
    let requestRevision = 0;
    const refresh = async () => {
      const current = ++requestRevision;
      try {
        const response = await apiRequest<{ types: CareDiscipline[]; providers: PublicProfessional[] }>('website/providers');
        if (!Array.isArray(response?.types) || !Array.isArray(response?.providers)) throw new Error('Invalid care directory');
        if (active && current === requestRevision) setResult({ ...response, loading: false, error: false });
      } catch {
        if (active && current === requestRevision) setResult({ types: [], providers: [], loading: false, error: true });
      }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [revision]);
  return { ...result, retry };
}
