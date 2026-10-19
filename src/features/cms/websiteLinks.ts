import { env } from '@/config/env';

export function resolveWebsiteLink(value: string) {
  if (value.startsWith('/') && !value.startsWith('//')) {
    const url = new URL(value, 'https://website.invalid');
    if (['/partner/register', '/become-a-partner'].includes(url.pathname.replace(/\/$/, ''))) {
      return { href: env.apiBaseUrl.replace(/\/api$/, '') + '/partner/register' + url.search + url.hash, internal: false };
    }
    return { href: value, internal: true };
  }
  return { href: value, internal: false };
}
