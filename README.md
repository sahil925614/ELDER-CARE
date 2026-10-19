# Elder Care Frontend

React + TypeScript + Tailwind CSS, built with Vite. Frontend only; Laravel and MySQL are managed by the backend developer.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm.

```sh
npm ci
npm run dev
```

Optionally copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL`.
The starter works without a backend and makes no API requests.

## Commands

- `npm run dev`: development server
- `npm run build`: TypeScript check and production build
- `npm run lint`: Oxlint checks
- `npm run preview`: preview the production build

## Folder structure

```text
public/                   Static files served without processing
src/
  app/                    App entry, router, navigation
  assets/                 Imported images, icons, fonts
  components/
    ui/                   Reusable visual building blocks
    common/               Shared application components
  config/                 Public environment configuration
  features/               Business modules (see below)
  hooks/                  Shared React hooks
  layouts/                Website and portal shells
  pages/
    website/              Public page compositions
    auth/                 Login and registration pages
    customer/             Customer page compositions
    shared/               Placeholders and not-found page
  services/api/           Fetch client and API errors
  styles/                 Tailwind import and theme
  types/                  Shared TypeScript types
  utils/                  Shared pure helpers
docs/                     Architecture and integration notes
```

Feature folders: auth, profile, elders, family, providers, subscriptions, add-ons,
appointments, payments, enquiries, notifications, content.

As each feature is implemented, keep its components, hooks, types, and API calls
inside its feature folder. Create only the subfolders that the feature needs.
Pages compose feature components; shared components should not depend on features.

## Current scope

The home screen is a development landing page. Public routes and `/customer` contain responsive shells and clearly marked placeholders.
No real login, customer records, or checkout is implemented. The Laravel developer owns the complete admin/CRM panel.
Portal routes are public previews; do not treat them as protected areas.

Tailwind uses the official Vite plugin and CSS theme configuration in
`src/styles/globals.css`; no legacy Tailwind configuration file is needed.
See https://tailwindcss.com/docs/installation/using-vite.

## Deployment

Build output is `dist/`. Configure the hosting server to serve `index.html`
for frontend routes so direct links and refreshes work. Keep backend API routes
outside that fallback. Public SEO requirements may require prerendering or SSR
later; this initial SPA setup does not implement either.

See [architecture](docs/architecture.md) for API and feature boundaries.

## Planned customer journey

Public website -> registration/login -> customer dashboard -> profile, elder/family profiles, subscriptions, purchased add-ons, appointments, payments, and notifications.
After authentication is integrated, successful login will redirect to /customer and signed-out visitors will be redirected to /login. This flow is planned, not implemented in the placeholder routes.

## Customer dashboard demo

Visit /customer for the interactive nine-page customer workspace. Sample data and example amounts are clearly marked; edits last until refresh. See src/pages/customer/README.md for implemented interactions and integration boundaries.

