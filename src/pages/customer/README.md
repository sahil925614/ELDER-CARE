# Customer Portal

PortalLayout provides the responsive sidebar and account header. Authenticated
account data comes from the Laravel customer API. DemoProvider remains for
legacy page state; the overview does not use its sample counts or notifications.

The overview uses the customer dashboard endpoint for the account identity,
elder count, active paid plans, upcoming appointments, and unread notifications.
It refreshes on focus, notification changes, and every minute while visible.
Loading, empty, and failed requests have distinct states with retry support.

Family Members is hidden from desktop and mobile navigation. The existing family
route remains available to avoid removing unrelated functionality.

See `docs/customer-dashboard.md`, `docs/appointment-management.md`, and
`docs/subscription-addon-flow.md` at the repository root for integration behavior
and verification commands.
