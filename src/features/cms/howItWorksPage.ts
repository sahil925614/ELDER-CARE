import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';
import { defaultNewsletterContent } from './newsletterContent';

export const defaultHowItWorksSections = {
  "banner": {
    "label": "How It Works",
    "title": "Your care journey, one thoughtful step at a time.",
    "text": "From the first question to everyday support, understand what happens next and make decisions with confidence.",
    "image_alt": "Care and connection for older people"
  },
  "introduction": {
    "label": "Your care journey",
    "title": "Simple to understand. Personal at every step.",
    "text": "Finding support for someone you care about can involve a lot of questions. Our process begins by understanding what matters to your family, then helping you explore the next step with greater clarity."
  },
  "journey": {
    "items": [
      {
        "label": "Explore",
        "title": "Start with what matters",
        "text": "Explore services and care plans while thinking about your loved one's routines, preferences, and the kind of support that could make everyday life easier.",
        "points": [
          "Explore available care services",
          "Consider everyday routines",
          "Think about personal preferences"
        ],
        "button_url": "/services",
        "button_label": "Explore services",
        "image_alt": "A caregiver spending time with an older person"
      },
      {
        "label": "Connect",
        "title": "Have a conversation",
        "text": "Tell us what your family is looking for. Share your location, the support you are considering, and any questions you would like to discuss.",
        "points": [
          "Tell us about your care needs",
          "Share your preferred location",
          "Keep your loved one involved"
        ],
        "button_url": "/enquiry",
        "button_label": "Make an enquiry",
        "image_alt": "A caregiver spending time with an older person"
      },
      {
        "label": "Confirm",
        "title": "Understand the details",
        "text": "Before moving forward, review the available services, professional arrangements, pricing, duration, and applicable terms.",
        "points": [
          "Review service arrangements",
          "Understand pricing and duration",
          "Confirm the next steps"
        ],
        "button_url": "/plans",
        "button_label": "View care plans",
        "image_alt": "A caregiver spending time with an older person"
      },
      {
        "label": "Continue",
        "title": "Stay connected with care",
        "text": "As your care journey continues, your customer account brings important information together so your family can stay informed and organised.",
        "points": [
          "Keep care information together",
          "Follow appointments and services",
          "Stay connected as needs change"
        ],
        "button_url": "/login",
        "button_label": "Go to customer login",
        "image_alt": "A caregiver spending time with an older person"
      }
    ]
  },
  "preparation": {
    "label": "Before your first enquiry",
    "title": "You don't need to have everything figured out.",
    "text": "A few simple details can help start a more useful conversation about the support your family is exploring.",
    "button_url": "/enquiry",
    "button_label": "Start a conversation",
    "items": [
      {
        "title": "Your loved one's routine",
        "text": "Think about what a comfortable, familiar day currently looks like."
      },
      {
        "title": "Where support may help",
        "text": "Consider the activities or routines where an extra hand would be welcome."
      },
      {
        "title": "Who should be involved",
        "text": "Decide which family members should be part of the care conversation."
      }
    ]
  },
  "reassurance": {
    "label": "One step at a time",
    "title": "Care begins by listening.",
    "text": "Tell us what matters to your family. The first conversation is simply a place to begin.",
    "button_url": "/enquiry",
    "button_label": "Make an enquiry"
  },
  "newsletter": defaultNewsletterContent
};
export type HowItWorksSectionsContent = typeof defaultHowItWorksSections;
export type HowItWorksImageKey = 'banner' | 'step_1' | 'step_2' | 'step_3' | 'step_4';
export interface HowItWorksPageContent {
  slug: 'how-it-works';
  name: string;
  path: '/how-it-works';
  seo: SeoSettings;
  sections: HowItWorksSectionsContent;
  images: Record<HowItWorksImageKey, string>;
}

export function useHowItWorksPageContent(enabled: boolean) {
  const [page, setPage] = useState<HowItWorksPageContent | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const result = await apiRequest<{ page: HowItWorksPageContent }>('website/pages/how-it-works');
        if (active && current === revision) setPage(result?.page?.slug === 'how-it-works' ? result.page : null);
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

