import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';

export const defaultContactSections = {
  banner: {
    label: 'Contact', title: "Let's talk about someone who matters to you.",
    text: 'Have a question about care, a plan, or where to begin? Start with what your family needs. We are building a simpler way to take that next step.',
    image_alt: 'Connect with Elder Care',
  },
  introduction: {
    label: 'Start a conversation', title_line_1: 'A little clarity.', title_line_2: 'A more confident next step.',
    text: 'Whether you are exploring options for a parent, a partner, or yourself, these details help shape a useful care conversation.',
    items: [
      { title: 'Care for a loved one', text: 'Explore the services and kind of support you are looking for.' },
      { title: 'Plans and service questions', text: 'Ask about inclusions, durations, availability, and what happens next.' },
      { title: 'Your customer account', text: 'Find your profile and care information through customer login.' },
    ],
  },
  contact_information: {
    title: 'Contact information', text: 'Our phone number, email address, office location, and support hours will appear here once confirmed.',
    phone: '', email: '', address: '', hours: '', account_label: 'Customer login', account_url: '/login',
  },
  form: {
    title: 'How can we help?', text: 'Send your question to our care team. An enquiry does not confirm an appointment.',
    name_label: 'Full name', name_placeholder: 'Your name', email_label: 'Email address', email_placeholder: 'you@example.com',
    phone_label: 'Phone', phone_placeholder: 'Your contact number', city_label: 'City', city_placeholder: 'Your city', optional_label: '(optional)',
    interest_label: 'What would you like to discuss?', interest_placeholder: 'A service, care plan, or general question',
    message_label: 'Your message', message_placeholder: 'Tell us a little about the support you are looking for.',
    privacy_text: 'Please leave out medical records and sensitive health details.', privacy_label: 'Privacy Policy', privacy_url: '/privacy-policy',
    consent_label: 'I agree to be contacted about this enquiry.', button_label: 'Send enquiry', sending_label: 'Sending enquiry...',
    success_text: 'Thank you. Your enquiry has been received. Please keep your reference for any follow-up.',
    error_text: 'Your enquiry could not be sent. Please try again. Your details are still here.', validation_text: 'Please check the highlighted fields.',
    rate_limit_text: 'Too many enquiries have been submitted. Please wait a few minutes before trying again.', reference_label: 'Reference',
  },
  explore: {
    label: 'While you explore', title: 'Find a helpful place to start.', text: 'Explore your options before starting an enquiry.',
    items: [
      { button_url: '/services', title: 'Explore services', text: 'Discover the care and support available.' },
      { button_url: '/plans', title: 'Compare care options', text: 'Find a care plan that suits your needs.' },
      { button_url: '/how-it-works', title: 'How it works', text: 'Understand the journey from enquiry to care.' },
    ],
  },
  faq: {
    label: 'A little clarity', title_line_1: 'Your questions,', title_line_2: 'thoughtfully answered.', button_label: 'Explore all FAQs', button_url: '/faqs',
    items: [
      { question: 'What should I include in an enquiry?', answer: 'Start with the type of support you need, your location, and any questions about services or plans. Avoid sharing sensitive medical information in a general enquiry.' },
      { question: 'Does an enquiry confirm an appointment?', answer: 'No. An appointment is only confirmed once availability and arrangements have been agreed.' },
      { question: 'Where can I manage my subscriptions?', answer: 'Customer account pages are intended to bring your profile, subscriptions, services, appointments, and payments together after login.' },
    ],
  },
};
export type ContactSectionsContent = typeof defaultContactSections;
export interface ContactPageContent {
  slug: 'contact'; name: string; path: '/contact'; seo: SeoSettings; sections: ContactSectionsContent; images: { banner: string };
}

export function useContactPageContent(enabled: boolean) {
  const [page, setPage] = useState<ContactPageContent | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const response = await apiRequest<{ page: ContactPageContent }>('website/pages/contact');
        if (active && current === revision) setPage(response?.page?.slug === 'contact' ? response.page : null);
      } catch { if (active && current === revision) setPage(null); }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [enabled]);
  return enabled ? page : null;
}
