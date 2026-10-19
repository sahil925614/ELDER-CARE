# Frontend architecture and backend handoff

## Boundaries

React renders the public website and customer account portal. The Laravel developer owns the complete admin/CRM panel, including its screens.
Laravel owns authentication, authorization, business validation, persistence,
payments, notification delivery, audit records, exports, and media processing.
Do not add PHP, database migrations, payment secrets, or messaging credentials here.

The route inventory is in src/app/navigation.ts. Authentication routes and the
website and customer areas are composed in src/app/router.tsx. Placeholder routes
will be replaced by page components during feature development.

## API integration

src/services/api/client.ts provides a small fetch wrapper with caller-provided
request options, cancellation through AbortSignal, empty-response handling,
and structured HTTP errors. It is not a runtime response validator.
No endpoints or backend response schemas have been invented.

Before connecting APIs, agree:
- API origin/version, resource routes, pagination, filtering, and validation errors.
- Laravel authentication choice (for example Sanctum session cookies or tokens).
- Login, logout, CSRF, session expiry, password reset, and optional OTP flows.
- Customer ownership checks and server-enforced authorization for account data.
- CORS, cookie domain, and credentials configuration if cookie auth is selected.

The current client does not configure cross-origin cookie credentials or CSRF.
Implement the agreed auth flow before using it for protected or mutating requests.
Frontend route guards improve navigation but cannot enforce backend security.

VITE_ variables are public browser configuration. Keep all secrets on the backend.

## Business modules

- subscriptions: plan display, durations, subscription state, and offer presentation.
  Basic, Standard, and Premium are initial business plans, not fixed frontend enums.
  Pricing, taxes, minimum terms, 6+1 / 12+2 promotions, and availability come from APIs.
- add-ons: service catalogue, availability, purchase forms, and purchased services.
- payments: future Razorpay/PayPal checkout UI. Laravel creates payment orders and
  verifies payment results/webhooks; browser success is not proof of payment.
- profile / elders / family: the signed-in customer's profile and linked elder/family records.
- providers: public healthcare professional listings and details.
- appointments: customer booking and appointment history after workflows are finalized.
- enquiries: public contact and enquiry forms.
- notifications: customer notifications and communication preferences.
  Email, WhatsApp, SMS, and OTP delivery are backend responsibilities.
- content: display published pages, blogs, FAQs, testimonials, offers, and SEO metadata
  supplied by Laravel. Content editing and CMS administration belong to the Laravel team.

## Customer login flow

The intended flow is public website -> registration/login -> /customer.
The dashboard will summarize the customer's subscriptions, purchased services,
appointments, and payments, with links to profile and account details.
Authentication integration will add session checks, login redirects, and logout.
For now /customer is a public interactive demo with clearly labelled synthetic records. Changes are held only in memory and reset on refresh; no real customer data or backend actions are connected.
## Development conventions

Use strict TypeScript, the @/ alias, and Tailwind theme tokens.
Keep forms labelled, keyboard focus visible, and empty/loading/error states explicit.
Use feature-local types for API contracts once agreed with the backend developer.
Avoid fabricated customer data, secrets, or medical information in repository fixtures.
Add meaningful tests as functional workflows are implemented.
