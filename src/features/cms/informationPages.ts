import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';
import { defaultNewsletterContent } from './newsletterContent';

export const defaultFaqSections = {
  banner: { label: 'FAQs', title: 'A little clarity goes a long way.', text: 'Find answers about getting started, choosing care, and staying connected through your customer account.', image_alt: 'Care and connection for older people' },
  introduction: { label: 'Here to help', title: 'What would you like to know?', text: 'Explore common questions about care, subscriptions, appointments and your customer account. Search for something specific or browse by topic.' },
  display: {
    search_placeholder: 'Search plans, appointments, payments...', search_label: 'Search FAQ questions', clear_search_label: 'Clear search',
    category_label: 'FAQ category', all_label: 'All questions', singular_label: 'answer', plural_label: 'answers', found_label: 'found', clear_filters_label: 'Clear filters',
    empty_title: 'No matching questions found.', empty_text: 'Try a different search phrase or explore all of our frequently asked questions.',
    loading_text: 'Loading answers...', error_text: 'Answers could not be loaded. Please try again.', retry_label: 'Try again',
  },
  newsletter: defaultNewsletterContent,
};
export const defaultPrivacySections = {
  banner: { label: 'Privacy Policy', title: 'Clarity for every step of your care journey.', text: 'A place to understand the platform and the details to consider before sharing information or choosing care.', image_alt: 'Care and connection for older people' },
  introduction: { label: 'Privacy & information', title: 'How information will be handled.', text: 'This page outlines the areas the final Elder Care privacy policy is expected to cover. The approved policy will provide the complete details before the live service begins collecting personal information.' },
  notice: { visibility: 'visible', title: 'Draft for review · Not approved or effective', text: 'Provisional content for design review. The final privacy policy, organisation details, and effective date are awaiting approval.', effective_label: 'Effective date', effective_date: '' },
  navigation: { label: 'On this page', aria_label: 'Privacy policy sections' },
  policy: { items: [
    { heading: 'Information you share', text: 'Account and enquiry forms may ask for your name, contact details, location, and care interests. Share only what is necessary. This frontend preview does not send these forms to a backend.' },
    { heading: 'Care and family information', text: 'The live service may need elder profiles and authorised family contacts. The approved policy must explain the purposes, permissions, and handling of sensitive information before collection begins.' },
    { heading: 'Use and sharing', text: 'The final policy will identify the organisation responsible for data, its service providers, and the reasons and circumstances for using or sharing information. These arrangements are awaiting confirmation.' },
    { heading: 'Storage and preferences', text: 'Data retention, account closure, cookies, analytics, security measures, and communication preferences will be covered in the published policy. Do not enter sensitive health records in this preview.' },
    { heading: 'Questions and requests', text: 'A verified privacy contact and the process for requests about personal information will be provided in the approved policy.' },
  ] },
  contact: { title: 'Have a question about privacy?', text: 'Contact us if you need clarification about this draft policy.', button_label: 'Contact Elder Care', button_url: '/contact' },
};
export interface FaqPageContent { slug: 'faqs'; name: string; path: '/faqs'; seo: SeoSettings; sections: typeof defaultFaqSections; images: { banner: string } }
export interface PrivacyPageContent { slug: 'privacy-policy'; name: string; path: '/privacy-policy'; seo: SeoSettings; sections: typeof defaultPrivacySections; images: { banner: string } }
export const defaultTermsSections = {
  banner: { label: 'Terms & Conditions', title: 'Clarity for every step of your care journey.', text: 'A place to understand the platform and the details to consider before sharing information or choosing care.', image_alt: 'Care and connection for older people' },
  introduction: { label: 'Terms of service', title: 'Understanding how the service works.', text: 'These draft terms outline important areas to understand when exploring Elder Care services. Final service, payment, cancellation, and account conditions will be provided in the approved terms.' },
  notice: { visibility: 'visible', title: 'Draft for review \u00b7 Not approved or effective', text: 'Provisional content for design review. The final terms & conditions, organisation details, and effective date are awaiting approval.', effective_label: 'Effective date', effective_date: '' },
  navigation: { label: 'On this page', aria_label: 'Terms and conditions sections' },
  policy: { items: [
    { heading: 'About this preview', text: 'This website demonstrates the intended customer experience. Preview forms do not create accounts, subscriptions, appointments, or payments.' },
    { heading: 'Service arrangements', text: 'Confirm location, scope, availability, dates, and fees before booking. An enquiry or preferred date is not a confirmed appointment.' },
    { heading: 'Subscriptions and offers', text: 'Inclusions, duration, minimum terms, taxes, and renewal conditions must be confirmed before purchase. Illustrative promotions are not active offers.' },
    { heading: 'Changes and cancellation', text: 'The approved terms will explain payment, cancellations, rescheduling, refunds, and service changes. This draft does not define specific cancellation or refund entitlements.' },
    { heading: 'Using the platform', text: 'Keep account information accurate and use the platform respectfully. Final terms will explain responsibilities, support channels, and the process for resolving concerns.' },
  ] },
  contact: { title: 'Need clarification about these terms?', text: 'Contact us if you have a question about this draft.', button_label: 'Contact Elder Care', button_url: '/contact' },
};
export interface TermsPageContent { slug: 'terms'; name: string; path: '/terms'; seo: SeoSettings; sections: typeof defaultTermsSections; images: { banner: string } }
type InformationPages = { faqs: FaqPageContent; 'privacy-policy': PrivacyPageContent; terms: TermsPageContent };

export function useInformationPageContent<K extends keyof InformationPages>(slug: K, enabled: boolean) {
  const [page, setPage] = useState<InformationPages[K] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const response = await apiRequest<{ page: InformationPages[K] }>('website/pages/' + slug);
        if (active && current === revision) setPage(response?.page?.slug === slug ? response.page : null);
      } catch { if (active && current === revision) setPage(null); }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [slug, enabled]);
  return enabled ? page : null;
}
