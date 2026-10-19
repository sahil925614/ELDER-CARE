import { createContext, useContext } from 'react';

export interface WebsiteBranding {
  site_name: string;
  logo_url: string | null;
}

export const defaultWebsiteBranding: WebsiteBranding = {
  site_name: 'Elder Care',
  logo_url: null,
};

export const WebsiteBrandingContext = createContext(defaultWebsiteBranding);

export function useWebsiteBranding() {
  return useContext(WebsiteBrandingContext);
}
