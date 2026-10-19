import { useEffect, useState, type ReactNode } from 'react';
import { apiRequest } from '@/services/api/client';
import { defaultWebsiteBranding, WebsiteBrandingContext, type WebsiteBranding } from './websiteBranding';

export function WebsiteBrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState(defaultWebsiteBranding);

  useEffect(() => {
    let active = true;
    let pending: AbortController | undefined;
    const refresh = () => {
      pending?.abort();
      const controller = new AbortController();
      pending = controller;
      void apiRequest<{ branding: WebsiteBranding }>('website/branding', { signal: controller.signal, cache: 'no-store' })
        .then((data) => {
          if (active && !controller.signal.aborted && data?.branding) {
            setBranding({
              site_name: data.branding.site_name || defaultWebsiteBranding.site_name,
              logo_url: data.branding.logo_url || null,
            });
          }
        })
        .catch(() => { /* Keep the last working branding when the API is unavailable. */ });
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => {
      active = false;
      pending?.abort();
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return <WebsiteBrandingContext.Provider value={branding}>{children}</WebsiteBrandingContext.Provider>;
}
