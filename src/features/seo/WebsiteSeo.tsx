import { useLocation } from 'react-router-dom'
import { resolveSeo, absoluteSeoUrl } from './resolveSeo'
import type { SeoSettings } from './settings'

export function WebsiteSeo({ override }: { override?: Partial<SeoSettings> }) {
  const { pathname, search } = useLocation()
  const seo = resolveSeo(pathname, search, override)
  const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
  const canonical = absoluteSeoUrl(seo.canonicalPath, siteUrl)
  const image = absoluteSeoUrl(seo.image, siteUrl)
  const noIndex = import.meta.env.VITE_SEO_ALLOW_INDEXING !== 'true' || seo.noIndex
  return <>
    <title>{seo.title}</title>
    <meta name="description" content={seo.description} />
    {seo.keywords.length > 0 && <meta name="keywords" content={seo.keywords.join(', ')} />}
    <meta name="robots" content={(noIndex ? 'noindex' : 'index') + ', ' + (seo.noFollow ? 'nofollow' : 'follow')} />
    {canonical && <link rel="canonical" href={canonical} />}
    <meta property="og:site_name" content="Elder Care" />
    <meta property="og:title" content={seo.title} />
    <meta property="og:description" content={seo.description} />
    <meta property="og:type" content={pathname.startsWith('/blog/') || (pathname === '/blog' && search.includes('article=')) ? 'article' : 'website'} />
    {canonical && <meta property="og:url" content={canonical} />}
    {image && <meta property="og:image" content={image} />}
    {image && seo.imageAlt && <meta property="og:image:alt" content={seo.imageAlt} />}
    <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
    <meta name="twitter:title" content={seo.title} />
    <meta name="twitter:description" content={seo.description} />
    {image && <meta name="twitter:image" content={image} />}
    {image && seo.imageAlt && <meta name="twitter:image:alt" content={seo.imageAlt} />}
  </>
}
