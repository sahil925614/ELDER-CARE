import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';
import type { SeoSettings } from '@/features/seo/settings';

export const defaultAboutSections = {
  "banner": {
    "label": "About Us",
    "title": "Care with compassion. Life with dignity.",
    "text": "Growing older should come with connection, independence, and the freedom to feel like yourself. That belief is at the heart of Elder Care.",
    "image_alt": "An older woman and a caregiver sharing a smile",
    "button_label": "Let's talk about your family",
    "button_url": "/enquiry"
  },
  "purpose": {
    "badge_label": "Our purpose",
    "badge_text": "Care that feels personal.",
    "label": "Why we're here",
    "heading_line_1": "A helping hand for them.",
    "heading_line_2": "A little reassurance for you.",
    "paragraph_1": "Finding care for someone you love can bring a lot of questions. What kind of support do they need? How do you respect their independence? Where do you begin?",
    "paragraph_2": "Elder Care aims to make that journey easier to navigate by bringing care options and useful account tools into one connected place.",
    "quote": "Our starting point is simple: listen to the individual, understand the family, and make space for choices that feel right for them.",
    "image_alt": "An older adult spending meaningful time with a caregiver",
    "connection_image_alt": "Family connection and companionship"
  },
  "values": {
    "label": "What guides us",
    "title": "The values behind every conversation.",
    "text": "Care is personal. These principles guide how we want families and older adults to experience every step of the journey.",
    "statement": "Every person deserves to feel heard, respected, and involved in their own care.",
    "statement_label": "Care with dignity",
    "items": [
      {
        "title": "Compassion",
        "text": "Care begins with listening, understanding, and responding with warmth."
      },
      {
        "title": "Dignity",
        "text": "Personal choices, familiar routines, and independence remain important."
      },
      {
        "title": "Connection",
        "text": "Families stay involved while the older person remains at the centre."
      },
      {
        "title": "Clarity",
        "text": "Clear conversations help families understand their options and next steps."
      }
    ]
  },
  "family": {
    "label": "For elders. For families.",
    "title": "Support that sees the whole person.",
    "text": "Needs can change over time, but the importance of feeling heard does not. We believe care should consider emotional wellbeing, everyday comfort, family connection, and practical support together.",
    "items": [
      "Respect for individual preferences and familiar routines",
      "Room for family conversations and involvement",
      "Options for everyday and additional care needs"
    ],
    "button_label": "Explore our services",
    "button_url": "/services",
    "image_alt": "An older adult enjoying time with family",
    "caption_title": "The familiar routines. The favourite chair. The conversations that make a day brighter.",
    "caption_text": "Care should make room for what makes life feel like home."
  },
  "connection": {
    "label": "More than practical support",
    "quote": "Feeling supported can begin with something as simple as being heard.",
    "text": "Meaningful care leaves room for conversation, familiarity, independence, and connection.",
    "image_alt": "A caregiver sharing a warm conversation with an older adult"
  },
  "approach": {
    "label": "Our approach",
    "heading_line_1": "Listen first.",
    "heading_line_2": "Take the next step together.",
    "text": "Care does not need to begin with all the answers. It can begin with understanding what matters today.",
    "button_label": "See how it works",
    "button_url": "/how-it-works",
    "items": [
      {
        "title": "We listen",
        "text": "We begin by understanding the person, their routines, preferences, family, and everyday needs."
      },
      {
        "title": "We explore",
        "text": "Together, you can look at suitable services, subscription options, and additional support."
      },
      {
        "title": "We stay connected",
        "text": "Your care information, services, subscriptions, and appointments can stay easier to follow."
      }
    ]
  },
  "options": {
    "label": "Find your next step",
    "heading_line_1": "Different needs.",
    "heading_line_2": "Thoughtful options.",
    "text": "Explore subscription plans for ongoing support or discover additional services for specific needs. Confirm inclusions and availability before choosing your care.",
    "primary_label": "View plans",
    "primary_url": "/plans",
    "secondary_label": "Explore add-ons",
    "secondary_url": "/add-ons"
  },
  "enquiry": {
    "label": "Here for your family",
    "title": "Tell us about someone who matters to you.",
    "text": "Every care journey starts somewhere. Tell us a little about your family's needs and explore what the next step could look like.",
    "action_title": "Start with a conversation.",
    "action_text": "You don't need to have everything figured out before getting in touch.",
    "primary_label": "Make an enquiry",
    "primary_url": "/enquiry",
    "secondary_label": "Contact us",
    "secondary_url": "/contact"
  }
};
export type AboutSectionsContent = typeof defaultAboutSections;
export type AboutImageKey = 'banner' | 'purpose' | 'connection' | 'family' | 'support';
export interface AboutPageContent {
  slug: 'about';
  name: string;
  path: '/about';
  seo: SeoSettings;
  sections: AboutSectionsContent;
  images: Record<AboutImageKey, string>;
}

export function useAboutPageContent(enabled: boolean) {
  const [page, setPage] = useState<AboutPageContent | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const result = await apiRequest<{ page: AboutPageContent }>('/website/pages/about');
        if (active && current === revision) setPage(result?.page?.slug === 'about' ? result.page : null);
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

