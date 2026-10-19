import { pageSeo, type SeoSettings } from './settings'

export function resolveSeo(pathname: string, search = '', override: Partial<SeoSettings> = {}) {
  const path = pathname.replace(/\/+$/, '') || '/'
  const isCustomer = path === '/customer' || path.startsWith('/customer/')
  const known = pageSeo[path] || (path.startsWith('/blog/') && path.split('/').length === 3 ? pageSeo['/blog'] : undefined)
  let settings: SeoSettings = known || {
    title: isCustomer ? 'Customer Account | Elder Care' : 'Page Not Found | Elder Care',
    description: isCustomer ? 'Your private Elder Care customer workspace.' : 'The requested page could not be found.',
    keywords: [], noIndex: true, noFollow: true,
  }
  let canonicalPath = known ? path : undefined
  if (path === '/blog' && new URLSearchParams(search).has('article')) settings = { ...settings, noIndex: true }
  return {
    ...settings, ...override,
    canonicalPath: override.canonicalPath ?? settings.canonicalPath ?? canonicalPath,
    // Account and unknown URLs must not become indexable through CMS overrides.
    noIndex: isCustomer || !known || (override.noIndex ?? settings.noIndex),
    noFollow: isCustomer || !known || (override.noFollow ?? settings.noFollow),
  }
}

export function absoluteSeoUrl(value: string | undefined, siteUrl: string): string | undefined {
  if (!value || !siteUrl) return undefined
  try {
    const base = new URL(siteUrl)
    if (!['http:', 'https:'].includes(base.protocol)) return undefined
    const url = new URL(value, base.origin + '/')
    if (!['http:', 'https:'].includes(url.protocol)) return undefined
    url.hash = ''
    return url.href
  } catch { return undefined }
}
