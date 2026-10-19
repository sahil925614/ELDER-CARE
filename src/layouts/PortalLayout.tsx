import "@/styles/customer-theme.css";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { Bell, ChevronRight, Menu, Moon, Sun, X } from "lucide-react";

import { WebsiteSeo } from "@/features/seo/WebsiteSeo";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { Logo } from "@/components/common/Logo";

import {
  AnimatedDashboardIcon,
  AnimatedHeartIcon,
  AnimatedLayersIcon,
  AnimatedPackageIcon,
  AnimatedCalendarIcon,
  AnimatedCardIcon,
  AnimatedBellIcon,
  AnimatedProfileIcon,
  AnimatedLogoutIcon,
} from "@/components/common/AnimatedPortalIcons";

import { useDemo } from "@/features/customer-portal/demoState";
import { DemoProvider } from "@/features/customer-portal/DemoProvider";
import {
  fetchCustomerMe,
  fetchCustomerNotifications,
  markCustomerNotificationRead,
  CUSTOMER_NOTIFICATIONS_CHANGED,
  logoutCustomer,
} from "@/features/auth/customerAuth";
import type { CustomerNotification } from "@/features/auth/customerAuth";
import { getCustomerToken } from "@/features/auth/customerSession";

import { CustomerNavigationDrawer } from "@/components/common/CustomerNavigationDrawer";

/* =========================================================
   NAVIGATION
========================================================= */

const navigation = [
  {
    path: "",
    label: "Overview",
    icon: AnimatedDashboardIcon,
  },
  {
    path: "elders",
    label: "Elder Profiles",
    icon: AnimatedHeartIcon,
  },
  {
    path: "subscriptions",
    label: "My Subscriptions",
    icon: AnimatedLayersIcon,
  },
  {
    path: "add-ons",
    label: "My Add-ons",
    icon: AnimatedPackageIcon,
  },
  {
    path: "appointments",
    label: "Appointments",
    icon: AnimatedCalendarIcon,
  },
  {
    path: "payments",
    label: "Payments",
    icon: AnimatedCardIcon,
  },
  {
    path: "notifications",
    label: "Notifications",
    icon: AnimatedBellIcon,
  },
  {
    path: "profile",
    label: "My Profile",
    icon: AnimatedProfileIcon,
  },
];

/* =========================================================
   PORTAL SHELL
========================================================= */

function PortalShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("elder-care-customer-theme") === "dark"; }
    catch { return false; }
  });
  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    try { localStorage.setItem("elder-care-customer-theme", next ? "dark" : "light"); }
    catch { /* Theme still works when browser storage is unavailable. */ }
  }

  const [menuFor, setMenuFor] = useState<string | null>(null);

  const { profile, setProfile } = useDemo();
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    if (!getCustomerToken()) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;
    void fetchCustomerMe().then((user) => {
      if (!active || !user) return;
      setProfile((current) => ({ ...current, name: user.name, email: user.email, phone: user.phone || '', address: user.address || '', city: user.city || '', state: user.state || '', country: user.country || '', zipCode: user.zip_code || '', profilePhotoUrl: user.profile_photo_url || '' }));
    }).catch(() => {
      if (active) navigate("/login", { replace: true });
    });
    return () => { active = false; };
  }, [navigate, setProfile]);

  useEffect(() => {
    let active = true;
    let pending = false;
    const refresh = () => {
      if (!getCustomerToken() || document.visibilityState === "hidden" || pending) return;
      pending = true;
      void fetchCustomerNotifications()
        .then((data) => { if (active) setUnreadCount(data.unread_count); })
        .catch(() => {})
        .finally(() => { pending = false; });
    };
    refresh();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener(CUSTOMER_NOTIFICATIONS_CHANGED, refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener(CUSTOMER_NOTIFICATIONS_CHANGED, refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [location.key]);

  const unread = unreadCount ?? 0;

  const currentPage =
    navigation.find(
      (item) =>
        location.pathname === "/customer" + (item.path ? "/" + item.path : ""),
    )?.label || "Customer portal";

  const initials = getInitials(profile.name);

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    setMenuFor(null);
    await logoutCustomer();
    navigate("/login", { replace: true });
  }

  const logout = (
    <button
      type="button"
      onClick={handleLogout}
      className="
        w-full
        group flex items-center gap-3
        rounded-xl px-3.5 py-3
        text-sm font-medium
        text-slate-500
        transition-colors
        hover:bg-brand-50
        hover:text-primary
      "
    >
      <AnimatedLogoutIcon size={19} strokeWidth={1.7} aria-hidden="true" />

      <span>Log Out</span>
    </button>
  );

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const nav = (
    <nav aria-label="Customer navigation" className="space-y-1">
      {navigation.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={"/customer" + (path ? "/" + path : "")}
          end
          onClick={() => setMenuFor(null)}
          className={({ isActive }) =>
            `
                group relative flex
                items-center gap-3
                rounded-xl px-3.5 py-3
                text-sm font-medium
                transition-colors
                ${
                  isActive
                    ? "bg-brand-50 text-primary"
                    : "text-slate-500 hover:bg-brand-50/70 hover:text-primary"
                }
              `
          }
        >
          {({ isActive }) => (
            <>
              {/* ACTIVE INDICATOR */}

              {isActive && (
                <span
                  className="
                      absolute bottom-3
                      left-0 top-3
                      w-[3px]
                      rounded-r-full
                      bg-primary
                    "
                  aria-hidden="true"
                />
              )}

              {/* ICON */}

              <span
                className={
                  "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors " +
                  (isActive
                    ? "bg-brand-100 text-primary"
                    : "text-slate-400 group-hover:text-primary")
                }
              >
                <Icon size={19} strokeWidth={1.7} aria-hidden="true" />
              </span>

              {/* LABEL */}

              <span className="min-w-0 flex-1 truncate">{label}</span>

              {/* NOTIFICATION COUNT */}

              {path === "notifications" && unread > 0 && (
                <span
                  className={
                    "flex min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold " +
                    (isActive
                      ? "bg-primary text-white"
                      : "bg-brand-100 text-primary")
                  }
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className={"min-h-screen " + (darkMode ? "customer-dark" : "bg-slate-50/70")}>
      <WebsiteSeo />
      <ScrollToTop />

      {/* ===================================================
          SKIP LINK
      =================================================== */}

      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      {/* ===================================================
          DESKTOP SIDEBAR
      =================================================== */}

      <aside
        className="
          fixed inset-y-0 left-0 z-30
          hidden w-64 flex-col
          border-r border-brand-100
          bg-white
          lg:flex
        "
      >
        {/* LOGO */}

        <div className="flex h-20 shrink-0 items-center border-b border-brand-100 px-6">
          <Link to="/" aria-label="Go to website home" className="inline-flex">
            <Logo />
          </Link>
        </div>

        {/* NAVIGATION */}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Customer workspace
          </p>

          {nav}
        </div>

        {/* LOGOUT */}

        <div className="shrink-0 border-t border-brand-100 px-4 py-4">
          {logout}
        </div>
      </aside>

      {/* ===================================================
          MAIN PORTAL
      =================================================== */}

      <div className="min-w-0 lg:pl-64">
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            sticky top-0 z-20
            flex h-16 items-center
            justify-between gap-3
            border-b border-brand-100
            bg-white/95
            px-4 backdrop-blur-md
            sm:h-20 sm:px-8
          "
        >
          {/* LEFT */}

          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open customer navigation"
              aria-expanded={menuFor === location.key}
              aria-controls="customer-navigation-drawer"
              onClick={() => setMenuFor(location.key)}
              className="portal-icon-button shrink-0 lg:hidden"
            >
              <Menu size={21} aria-hidden="true" />
            </button>

            {/* BREADCRUMB */}

            <div className="flex min-w-0 items-center gap-2">
              <span className="hidden text-xs font-medium text-slate-400 sm:inline">
                My account
              </span>

              <ChevronRight
                size={13}
                className="hidden shrink-0 text-slate-300 sm:block"
                aria-hidden="true"
              />

              <span className="truncate text-sm font-semibold text-brand-900">
                {currentPage}
              </span>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={darkMode}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="flex size-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-brand-50 hover:text-primary sm:size-10"
            >
              {darkMode ? <Sun size={19} strokeWidth={1.7} aria-hidden="true" /> : <Moon size={19} strokeWidth={1.7} aria-hidden="true" />}
            </button>
            {/* NOTIFICATIONS */}

            <NotificationBell key={"notifications-" + location.key} unreadCount={unread} />

            {/* DIVIDER */}

            <span
              className="hidden h-7 w-px bg-brand-100 sm:block"
              aria-hidden="true"
            />

            {/* PROFILE */}

            <ProfileMenu key={"profile-" + location.key} name={profile.name} initials={initials} />
          </div>
        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main
          id="main-content"
          tabIndex={-1}
          className="
    w-full
    max-w-[1600px]
    px-4 py-6
    sm:px-8 sm:py-8
    lg:px-8 lg:py-9
    xl:px-10
    2xl:px-12
          "
        >
          <div key={location.pathname} className="portal-page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ===================================================
          MOBILE NAVIGATION
      =================================================== */}

      {menuFor === location.key && (
        <CustomerNavigationDrawer
          footer={logout}
          onClose={() => setMenuFor(null)}
        >
          {nav}
        </CustomerNavigationDrawer>
      )}
    </div>
  );
}

/* =========================================================
   PROFILE INITIALS
========================================================= */



function ProfileMenu({ name, initials }: { name: string; initials: string }) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  return (
    <div ref={container} className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button ref={trigger} type="button" onClick={() => setOpen(!open)}
        aria-label="Open account menu" aria-expanded={open} aria-controls="customer-profile-popup"
        className="group flex min-w-0 items-center gap-3 rounded-xl text-left transition-colors sm:px-2 sm:py-1.5 sm:hover:bg-brand-50"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-100 text-xs font-semibold uppercase tracking-wide text-primary sm:size-10">
          {initials}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-[160px] truncate text-xs font-semibold text-brand-900">{name || "Customer"}</span>
          <span className="mt-0.5 block text-[10px] text-slate-400">Customer account</span>
        </span>
      </button>
      {open && (
        <section id="customer-profile-popup" aria-labelledby="profile-popup-title"
          className="absolute right-0 top-full z-50 mt-3 w-64 max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-xl">
          <div className="flex items-center justify-between gap-3 border-b border-brand-100 px-4 py-4">
            <div className="min-w-0">
              <h2 id="profile-popup-title" className="truncate text-sm font-semibold text-brand-900">{name || "Customer"}</h2>
              <p className="mt-1 text-xs text-slate-500">Your account</p>
            </div>
            <button type="button" aria-label="Close account menu"
              onClick={() => { setOpen(false); trigger.current?.focus(); }}
              className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-primary">
              <X size={17} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Account shortcuts" className="space-y-1 p-2">
            {[
              { to: "/customer/profile", label: "My Profile", icon: AnimatedProfileIcon },
              { to: "/customer/subscriptions", label: "My Subscriptions", icon: AnimatedLayersIcon },
              { to: "/customer/appointments", label: "Appointments", icon: AnimatedCalendarIcon },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 transition-colors hover:bg-brand-50 hover:text-primary">
                <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-brand-100 p-2">
            <button type="button" onClick={async () => {
              setOpen(false);
              await logoutCustomer();
              window.location.href = "/login";
            }}
              className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-primary transition-colors hover:bg-brand-50">
              <AnimatedLogoutIcon size={18} strokeWidth={1.7} aria-hidden="true" />
              Log Out
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function NotificationBell({ unreadCount }: { unreadCount: number }) {
  const unread = unreadCount;
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError("");
    void fetchCustomerNotifications()
      .then((data) => { if (active) setNotifications(data.notifications.slice(0, 5)); })
      .catch(() => { if (active) setError("Notifications could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [open, unreadCount]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  return (
    <div ref={container} className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button ref={trigger} type="button" onClick={() => setOpen(!open)}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open} aria-controls="customer-notification-popup"
        className="relative flex size-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-brand-50 hover:text-primary"
      >
        <Bell size={19} strokeWidth={1.7} aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-primary px-1 text-[9px] font-bold leading-none text-white shadow-sm" aria-hidden="true">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <section id="customer-notification-popup" aria-labelledby="notification-popup-title"
          className="fixed left-4 right-4 top-[72px] z-50 overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96"
        >
          <div className="flex items-center justify-between gap-3 border-b border-brand-100 px-5 py-4">
            <div>
              <h2 id="notification-popup-title" className="text-sm font-semibold text-brand-900">Notifications</h2>
              <p className="mt-1 text-xs text-slate-500" role="status">{unread ? `${unread} unread updates` : "You're all caught up"}</p>
            </div>
            <button type="button" aria-label="Close notifications" onClick={() => { setOpen(false); trigger.current?.focus(); }}
              className="rounded-lg p-2 text-slate-500 hover:bg-brand-50 hover:text-primary">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="max-h-[min(360px,50dvh)] overflow-y-auto overscroll-contain">
            {loading && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">
                Loading notifications...
              </p>
            )}

            {!loading && notifications.length ? notifications.map((notice) => (
              <div key={notice.id} className="flex items-start gap-3 border-b border-brand-100 px-5 py-4">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-primary">
                  <Bell size={16} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{notice.category}</p>
                  <h3 className="mt-1 text-sm font-semibold text-brand-900"><Link to={notice.url || '/customer/notifications'} onClick={() => setOpen(false)} className="hover:text-primary hover:underline">{notice.title}</Link></h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{notice.message}</p>
                  {!notice.read && (
                    <button type="button" className="mt-2 text-xs font-semibold text-primary hover:underline"
                      onClick={async () => {
                        try {
                          await markCustomerNotificationRead(notice.id);
                          setNotifications((items) => items.map((item) => item.id === notice.id ? { ...item, read: true } : item));
                        } catch { setError("This notification could not be marked as read."); }
                      }}>
                      Mark as read
                    </button>
                  )}
                </div>
                {!notice.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
              </div>
            )) : null}

            {!loading && !notifications.length && (
              <p className="px-5 py-8 text-center text-sm text-slate-500">No notifications yet.</p>
            )}
            {error && <p role="alert" className="px-5 py-3 text-xs text-red-600">{error}</p>}
          </div>
          <Link to="/customer/notifications" onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 px-5 py-4 text-sm font-semibold text-primary hover:bg-brand-50">
            View all notifications <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </section>
      )}
    </div>
  );
}

function getInitials(name: string) {
  if (!name?.trim()) {
    return "CU";
  }

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/* =========================================================
   LAYOUT PROVIDER
========================================================= */

export function PortalLayout() {
  return (
    <DemoProvider>
      <PortalShell />
    </DemoProvider>
  );
}
