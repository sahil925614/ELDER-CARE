# Website SEO

Edit src/features/seo/settings.ts for each page's title, description, keywords, noIndex and noFollow.
Optional canonicalPath can be a relative path or an absolute HTTP(S) canonical URL. Optional image is an absolute or site-relative social image URL.

## Environment
Copy .env.example settings into your local environment:
- VITE_SITE_URL: actual public origin, e.g. https://your-domain.com (no trailing subdirectory).
- VITE_SEO_ALLOW_INDEXING: false for development/staging; true only for approved production.
Restart Vite after changing environment values. Production values are embedded at build time.

Without a configured site origin, canonical and social URL tags are omitted rather than pointing crawlers at localhost.
Account, enquiry, and draft legal pages default to noindex. Customer and unknown routes are always noindex.
Robots directives are crawler instructions, not authentication or access control.

## Dynamic pages
Blog content is shared from src/pages/website/components/blogArticles.ts.
Recognised article IDs keep ?article= in their canonical. Tracking and enquiry query parameters are excluded.
Unknown article IDs are noindex and canonicalise to the blog listing currently shown by the UI.

## Future API integration
WebsiteSeo accepts override?: Partial<SeoSettings>. The route resolver first loads local defaults, then merges these overrides.
Fetch metadata in the page/layout data layer after an endpoint is agreed; pass validated, camelCase fields to the single WebsiteSeo in WebsiteLayout.
Reset overrides on route changes, cancel stale requests, and retain local defaults on loading/error.
Do not add another metadata component alongside it. No endpoint is assumed or requested today.
Example mapped response:
{ title: "Care Services | Elder Care", description: "...", keywords: ["elder care"], canonicalPath: "/services", noIndex: false, noFollow: false }
Customer/unknown route restrictions and the environment indexing switch take precedence.

## Rendering and deployment
React 19 places the shared title, meta, and canonical tags in the document head. The old page-level tags were removed to prevent duplicates.
This is a client-rendered Vite app. Metadata appears after JavaScript executes; this setup is not SSR or prerendering.
For reliable crawler/social previews, plan prerendering or server-rendered route HTML. Configure hosting to serve proper 404 statuses and server-side indexing headers where necessary.
No blanket noindex is placed in index.html because crawlers may skip JavaScript after finding it.
A sitemap and deployment robots.txt require the final domain and published-page list and are not generated here.
Keywords are included as requested; Google does not use the keywords meta tag for ranking.

References:
https://react.dev/reference/react-dom/components/meta
https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
