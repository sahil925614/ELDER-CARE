import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';

export interface FooterLinkItem {
  label: string;
  url: string;
  enabled: boolean;
  new_tab: boolean;
}

const link = (url: string, label: string): FooterLinkItem => ({ url, label, enabled: true, new_tab: false });

export const defaultWebsiteFooter = {
  logo_url: '',
  logo_alt: 'Elder Care',
  home_url: '/',
  description: 'Compassionate care. Meaningful connections. Support that puts your loved ones first.',
  cta: link('/enquiry', "Let's talk about care"),
  groups: [
    { title: 'Explore care', links: [link('/services', 'Elder Care Services'), link('/plans', 'Subscription Plans'), link('/add-ons', 'Add-on Services'), link('/doctors', 'Healthcare Professionals')] },
    { title: 'Get to know us', links: [link('/about', 'About Us'), link('/how-it-works', 'How It Works'), link('/blog', 'Blog'), link('/faqs', 'FAQs'), link('/testimonials', 'Testimonials')] },
    { title: 'Here for you', links: [link('/contact', 'Contact Us'), link('/enquiry', 'Make an Enquiry'), link('/login', 'Customer Login'), link('/register', 'Create an Account'), link('/partner/register', 'Become a Partner')] },
  ],
  copyright_text: 'Elder Care. All rights reserved.',
  show_current_year: true,
  legal_links: [link('/privacy-policy', 'Privacy Policy'), link('/terms', 'Terms & Conditions')],
};

export type WebsiteFooterContent = typeof defaultWebsiteFooter;

export function useWebsiteFooter() {
  const [footer, setFooter] = useState(defaultWebsiteFooter);
  useEffect(() => {
    let active = true;
    let revision = 0;
    const refresh = () => {
      const current = ++revision;
      void apiRequest<{ footer: WebsiteFooterContent }>('website/footer')
        .then((data) => { if (active && current === revision) setFooter(data?.footer ?? defaultWebsiteFooter); })
        .catch(() => { if (active && current === revision) setFooter(defaultWebsiteFooter); });
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, []);

  return footer;
}
