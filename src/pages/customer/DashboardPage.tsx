import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatTimeRange } from '@/utils/time';
import {
  ArrowUpRight,
  CalendarDays,
  HeartHandshake,
  Layers,
  Plus,
  Bell,
  Clock3,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  useDemo,
} from "@/features/customer-portal/demoState";
import { CUSTOMER_NOTIFICATIONS_CHANGED, fetchCustomerDashboard } from "@/features/auth/customerAuth";
import type { CustomerDashboard } from "@/features/auth/customerAuth";

import { Badge, PageHeading } from "./components/PortalUi";

/* =========================================================
   DASHBOARD
========================================================= */

export function DashboardPage() {
  const { profile } = useDemo();
  const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    let pending = false;
    const refresh = () => {
      if (pending || document.visibilityState === 'hidden') return;
      pending = true;
      void fetchCustomerDashboard()
        .then((data) => {
          if (!data) throw new Error('Dashboard unavailable');
          if (active) { setDashboard(data); setError(''); }
        })
        .catch(() => { if (active) setError('Your account overview could not be loaded. Please try again.'); })
        .finally(() => { pending = false; if (active) setLoading(false); });
    };
    refresh();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener(CUSTOMER_NOTIFICATIONS_CHANGED, refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener(CUSTOMER_NOTIFICATIONS_CHANGED, refresh);
    };
  }, [revision]);

  const dynamicNotices = dashboard?.notifications ?? [];
  const upcomingAppointments = dashboard?.upcoming_appointments ?? [];
  const elderCount = dashboard?.summary.elder_profiles ?? '--';
  const activePlanCount = dashboard?.summary.active_subscriptions ?? '--';
  const unreadCount = dashboard?.summary.unread_notifications ?? '--';
  const currentSubscription = dashboard?.current_subscription;

  const summary = [
    {
      title: "Elder profiles",
      value: elderCount,
      icon: HeartHandshake,
      to: "elders",
      helper: "People in your care",
    },
    {
      title: "Unread updates",
      value: unreadCount,
      icon: Bell,
      to: "notifications",
      helper: "Account notifications",
    },
    {
      title: "Upcoming visits",
      value: dashboard?.summary.upcoming_appointments ?? '--',
      icon: CalendarDays,
      to: "appointments",
      helper: "Scheduled ahead",
    },
    {
      title: "Active plans",
      value: activePlanCount,
      icon: Layers,
      to: "subscriptions",
      helper: "Current subscription",
    },
  ];

  return (
    <>
      {/* =====================================================
          PAGE HEADING
      ===================================================== */}

      <PageHeading
        title={"Welcome, " + (dashboard?.customer?.name || profile.name).trim().split(/\s+/)[0] + "."}
        text="A little clarity for your family's care journey. Here is your account at a glance."
        action={
          <Link
            to="/customer/appointments?request=1"
            className="button-primary"
          >
            <Plus size={17} aria-hidden="true" />
            Plan a care visit
          </Link>
        }
      />

      {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><p>{error}</p><button type="button" disabled={loading} className="inline-flex items-center gap-2 font-semibold" onClick={() => { setLoading(true); setRevision((value) => value + 1); }}><RefreshCw size={15} aria-hidden="true" />Retry</button></div>}

      {/* =====================================================
          PRIMARY OVERVIEW
      ===================================================== */}

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        {/* CARE OVERVIEW */}

        <div className="overflow-hidden rounded-[28px] bg-primary text-white">
          <div className="grid h-full sm:grid-cols-[1fr_auto]">
            <div className="flex flex-col justify-between p-7 sm:p-9">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-brand-100">
                    <HeartHandshake
                      size={21}
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  </span>

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-100">
                    Together in care
                  </p>
                </div>

                <h2 className="mt-6 max-w-lg text-[28px] font-semibold leading-[1.18] tracking-tight sm:text-[34px]">
                  Everything that matters,
                  <br className="hidden sm:block" /> a little closer together.
                </h2>

                <p className="mt-4 max-w-lg text-sm font-normal leading-7 text-white/75">
                  Keep your family connected, understand your care
                  arrangements, and find the next step from one place.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/customer/elders"
                  className="group inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-brand-50"
                >
                  View elder profiles

                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  to="/customer/appointments"
                  className="inline-flex items-center px-3 py-3 text-sm font-medium text-white/75 transition-colors hover:text-white"
                >
                  Your appointments
                </Link>
              </div>
            </div>

            {/* DESKTOP CARE SUMMARY */}

            <div className="hidden w-[190px] border-l border-white/10 bg-white/[0.04] p-7 sm:flex sm:flex-col sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-100">
                  Your care circle
                </p>

                <p className="mt-4 text-4xl font-semibold tracking-tight">
                  {elderCount}
                </p>

                <p className="mt-1 text-xs leading-5 text-white/60">
                  profiles connected
                </p>
              </div>

              <div className="mt-10 space-y-4">
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xl font-semibold">
                    {elderCount}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Elder profiles
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-xl font-semibold">
                    {activePlanCount}
                  </p>
                  <p className="mt-1 text-xs text-white/60">
                    Active plans
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CURRENT PLAN */}

        <div className="portal-card flex flex-col p-7 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Current plan
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-brand-900">
                {currentSubscription?.plan_name || (loading ? "Loading plan..." : error && !dashboard ? "Plan unavailable" : "No active plan")}
              </h2>
            </div>

            <Badge>{currentSubscription?.status || (loading ? 'Loading' : error && !dashboard ? 'Unavailable' : 'None')}</Badge>
          </div>

          <div className="mt-7 border-y border-brand-100 py-5">
            <div className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary">
                <CalendarDays
                  size={19}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Plan period
                </p>

                <p className="mt-1 text-sm font-semibold text-brand-900">
                  {currentSubscription
                    ? `${currentSubscription.start_date || "Not set"} - ${currentSubscription.end_date || "Not set"}`
                    : loading ? 'Loading subscription...' : error && !dashboard ? 'Subscription details unavailable' : "No active subscription yet"}
                  {currentSubscription?.elder_name && <span className="mt-1 block text-xs font-normal text-slate-500">{currentSubscription.elder_name} | {currentSubscription.subscription_number}</span>}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
            <Check
              size={15}
              className="text-primary"
              aria-hidden="true"
            />

            {currentSubscription ? "Subscription currently active" : loading ? 'Checking your plans...' : error && !dashboard ? 'Please retry to load your plan' : "No active paid subscription"}
          </div>

          <Link
            to="/customer/subscriptions"
            className="text-link group mt-auto pt-7"
          >
            See your plan

            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>

                            {/* =====================================================
    QUICK ACTIONS
===================================================== */}

<section
  aria-labelledby="quick-actions-heading"
  className="mt-6"
>
  <div className="mb-4 flex items-end justify-between gap-4">
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        Quick actions
      </p>

      <h2
        id="quick-actions-heading"
        className="mt-1 text-lg font-semibold text-brand-900"
      >
        What would you like to do?
      </h2>
    </div>
  </div>

  <div
    className="
      grid overflow-hidden
      rounded-[22px]
      border border-brand-100
      bg-white
      sm:grid-cols-3
    "
  >
    {/* BOOK A VISIT */}

    <Link
      to="/customer/appointments?request=1"
      className="
        group
        flex items-center gap-4
        border-b border-brand-100
        p-5
        transition-colors
        hover:bg-brand-50/60
        sm:border-b-0 sm:border-r
        sm:p-6
      "
    >
      <span
        className="
          grid size-11 shrink-0
          place-items-center
          rounded-xl
          bg-brand-50
          text-primary
          transition-colors
          group-hover:bg-brand-100
        "
      >
        <CalendarDays
          size={20}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-900">
          Book a visit
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Arrange your next care appointment
        </p>
      </div>

      <ArrowUpRight
        size={16}
        className="
          shrink-0 text-slate-300
          transition-all duration-200
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          group-hover:text-primary
        "
        aria-hidden="true"
      />
    </Link>


    {/* MANAGE PLANS */}

    <Link
      to="/customer/subscriptions"
      className="
        group
        flex items-center gap-4
        border-b border-brand-100
        p-5
        transition-colors
        hover:bg-brand-50/60
        sm:border-b-0 sm:border-r
        sm:p-6
      "
    >
      <span
        className="
          grid size-11 shrink-0
          place-items-center
          rounded-xl
          bg-brand-50
          text-primary
          transition-colors
          group-hover:bg-brand-100
        "
      >
        <Layers
          size={20}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-900">
          Manage subscriptions
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Review your plans and included services
        </p>
      </div>

      <ArrowUpRight
        size={16}
        className="
          shrink-0 text-slate-300
          transition-all duration-200
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          group-hover:text-primary
        "
        aria-hidden="true"
      />
    </Link>


    {/* REQUEST SUPPORT */}

    <Link
      to="/customer/add-ons"
      className="
        group
        flex items-center gap-4
        p-5
        transition-colors
        hover:bg-brand-50/60
        sm:p-6
      "
    >
      <span
        className="
          grid size-11 shrink-0
          place-items-center
          rounded-xl
          bg-brand-50
          text-primary
          transition-colors
          group-hover:bg-brand-100
        "
      >
        <HeartHandshake
          size={20}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-900">
          Request support
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-400">
          Explore additional care services
        </p>
      </div>

      <ArrowUpRight
        size={16}
        className="
          shrink-0 text-slate-300
          transition-all duration-200
          group-hover:-translate-y-0.5
          group-hover:translate-x-0.5
          group-hover:text-primary
        "
        aria-hidden="true"
      />
    </Link>
  </div>
</section>

      {/* =====================================================
          ACCOUNT SUMMARY
      ===================================================== */}

      <section
        aria-label="Account summary"
        className="my-6 grid grid-cols-2 overflow-hidden rounded-[24px] border border-brand-100 bg-white lg:grid-cols-4"
      >
        {summary.map(
          ({ title, value, icon: Icon, to, helper }, index) => (
            <Link
              key={title}
              to={"/customer/" + to}
              className={
                "group relative min-w-0 p-5 transition-colors hover:bg-brand-50/60 sm:p-6 " +
                (index % 2 === 0
                  ? "border-r border-brand-100 "
                  : "") +
                (index < 2
                  ? "border-b border-brand-100 lg:border-b-0 "
                  : "") +
                (index > 0
                  ? "lg:border-l lg:border-brand-100 "
                  : "") +
                (index === 2
                  ? "border-r border-brand-100 lg:border-r-0 "
                  : "")
              }
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-primary transition-colors group-hover:bg-brand-100">
                  <Icon
                    size={18}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>

                <ArrowUpRight
                  size={15}
                  className="text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </div>

              <p className="mt-5 text-3xl font-semibold tracking-tight text-brand-900">
                {value}
              </p>

              <p className="mt-1 text-sm font-semibold text-brand-900">
                {title}
              </p>

              <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                {helper}
              </p>
            </Link>
          ),
        )}
      </section>

      {/* =====================================================
          APPOINTMENTS + UPDATES
      ===================================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        {/* APPOINTMENTS */}

        <div className="portal-card overflow-hidden p-0">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-100 px-6 py-5 sm:px-7">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Your schedule
              </p>

              <h2 className="mt-1 text-lg font-semibold text-brand-900">
                Coming up next
              </h2>
            </div>

            <Link
              to="/customer/appointments"
              className="text-link group"
            >
              All appointments

              <ArrowUpRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          <div>
            {loading && (
              <div className="flex items-center gap-3 px-6 py-6 text-sm text-slate-500 sm:px-7">
                <Loader2 className="animate-spin text-primary" size={17} />
                Loading appointments...
              </div>
            )}

            {!loading && !error && upcomingAppointments.length === 0 && (
              <div className="px-6 py-6 text-sm text-slate-500 sm:px-7">
                No upcoming appointments yet.
              </div>
            )}
            {!loading && error && !dashboard && <p className="px-6 py-6 text-sm text-slate-500 sm:px-7">Appointments could not be loaded.</p>}

            {!loading && upcomingAppointments.map((appointment, index) => (
              <Link
                key={appointment.id}
                to={`/customer/appointments?appointment=${appointment.id}`}
                className={
                  "group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-brand-50/40 sm:px-7 " +
                  (index !== upcomingAppointments.length - 1
                    ? "border-b border-brand-100"
                    : "")
                }
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-primary">
                  <CalendarDays
                    size={20}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="font-semibold text-brand-900">
                      {appointment.service}
                    </p>

                    <Badge>{appointment.status}</Badge>
                  </div>

                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {appointment.elder}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 sm:hidden">{appointment.date} | {formatTimeRange(appointment.time)}</p>
                </div>

                <div className="hidden shrink-0 text-right sm:block">
                  <p className="text-sm font-semibold text-brand-900">
                    {appointment.date || "Not set"}
                  </p>

                  <p className="mt-1 flex items-center justify-end gap-1.5 text-xs text-slate-400">
                    <Clock3
                      size={13}
                      aria-hidden="true"
                    />

                    {formatTimeRange(appointment.time)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="border-t border-brand-100 bg-brand-50/40 px-6 py-4 sm:px-7">
            <Link
              to="/customer/appointments?request=1"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary"
            >
              <Plus size={14} aria-hidden="true" />
              Plan another care visit
            </Link>
          </div>
        </div>

        {/* UPDATES */}

        <div className="portal-card p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Stay informed
              </p>

              <h2 className="mt-1 text-lg font-semibold text-brand-900">
                Your updates
              </h2>
            </div>

            <span className="flex size-9 items-center justify-center rounded-xl bg-brand-50 text-primary">
              <Bell
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </span>
          </div>

          <div className="mt-6">
            {loading && <p className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={17} className="animate-spin text-primary" />Loading updates...</p>}
            {!loading && error && !dashboard && <p className="text-sm text-slate-500">Updates could not be loaded.</p>}
            {dynamicNotices.slice(0, 3).map((notice, index) => (
              <div
                key={notice.id}
                className={
                  "relative pl-6 " +
                  (index !== dynamicNotices.slice(0, 3).length - 1 ? "pb-6" : "")
                }
              >
                {/* TIMELINE */}

                <span
                  className="absolute left-[3px] top-1.5 size-2 rounded-full bg-primary"
                  aria-hidden="true"
                />

                {index !== dynamicNotices.slice(0, 3).length - 1 && (
                  <span
                    className="absolute bottom-0 left-[6px] top-3 w-px bg-brand-100"
                    aria-hidden="true"
                  />
                )}

                <p className="break-words text-sm font-semibold leading-5 text-brand-900">
                  <Link to={notice.url || '/customer/notifications'} className="hover:text-primary">{notice.title}</Link>
                </p>

                <p className="mt-2 break-words text-xs font-normal leading-6 text-slate-500">
                  {notice.message}
                </p>
                {notice.created_at && <p className="mt-1 text-xs text-slate-400">{notice.created_at}</p>}
              </div>
            ))}

            {!loading && !error && !dynamicNotices.length && (
              <p className="text-sm leading-6 text-slate-500">
                No new account updates yet.
              </p>
            )}
          </div>

          <Link
            to="/customer/notifications"
            className="text-link group mt-7 border-t border-brand-100 pt-5"
          >
            View all updates

            <ArrowUpRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </>
  );
}
