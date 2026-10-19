import { Logo } from "@/components/common/Logo";
import { WebsiteAccountMenu } from "@/components/common/WebsiteAccountMenu";
import { useCustomerSession } from "@/features/auth/useCustomerSession";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import {
  getCurrencyPreference,
  setCurrencyPreference,
  type CurrencyCode,
} from "@/features/plans/currencyPreference";

type NavigationItem = {
  to: string;
  label: string;
  children?: readonly (readonly [string, string])[];
};

const links: NavigationItem[] = [
  { to: "/", label: "Home" },
  {
    to: "/about",
    label: "About Us",
    children: [
      ["/how-it-works", "How It Works"],
      ["/testimonials", "Testimonials"],
    ],
  },
  {
    to: "/services",
    label: "Services",
    children: [["/add-ons", "Add-on Services"]],
  },
  { to: "/plans", label: "Care Plans" },
  { to: "/doctors", label: "Care Experts" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
];

function NavigationEntry({
  item,
  mobile = false,
  onNavigate,
}: {
  item: NavigationItem;
  mobile?: boolean;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const id = (mobile ? "mobile-" : "desktop-") + item.to.slice(1) + "-submenu";
  const active =
    pathname === item.to ||
    (item.to !== "/" && pathname.startsWith(item.to + "/")) ||
    item.children?.some(([to]) => pathname === to);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);

  return (
    <div
      ref={container}
      className={mobile ? "relative" : "relative shrink-0"}
      onPointerEnter={(event) => {
        if (!mobile && event.pointerType === "mouse" && item.children)
          setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (
          !mobile &&
          event.pointerType === "mouse" &&
          !container.current?.contains(document.activeElement)
        )
          setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div
        className={
          "flex items-center " + (mobile ? "justify-between" : "gap-0.5")
        }
      >
        <NavLink
          to={item.to}
          end={item.to === "/"}
          onClick={() => {
            setOpen(false);
            onNavigate();
          }}
          className={
            (mobile ? "flex-1 rounded-lg px-4 py-3 " : "py-3 ") +
            "text-sm hover:text-brand-900 " +
            (active ? "font-bold text-brand-900" : "text-brand-700")
          }
        >
          {item.label}
        </NavLink>
        {item.children && (
          <button
            ref={toggle}
            type="button"
            aria-label={item.label + " submenu"}
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen(!open)}
            className={
              "rounded-lg text-brand-700 hover:bg-brand-50 " +
              (mobile ? "p-3" : "px-1 py-3")
            }
          >
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={
                "transition-transform motion-reduce:transition-none " +
                (open ? "rotate-180" : "")
              }
            />
          </button>
        )}
      </div>
      {item.children && (
        <div
          id={id}
          hidden={!open}
          className={
            mobile
              ? "mb-2 ml-4 border-l border-brand-100 pl-2"
              : "absolute left-0 top-full z-50 min-w-52 rounded-2xl border border-brand-100 bg-white p-2 shadow-lg"
          }
        >
          {item.children.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => {
                setOpen(false);
                onNavigate();
              }}
              className={({ isActive }) =>
                "block rounded-lg px-4 py-3 text-sm hover:bg-brand-50 " +
                (isActive
                  ? "bg-brand-50 font-semibold text-brand-900"
                  : "text-brand-700")
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header({ overlay = false }: { overlay?: boolean }) {
  const { token, customer } = useCustomerSession();
  const { key: locationKey } = useLocation();
  const [openForLocation, setOpenForLocation] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>(() => getCurrencyPreference());
  const menuOpen = openForLocation === locationKey;
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const closeMenu = () => setOpenForLocation(null);

  useEffect(() => {
    if (!menuOpen) return;
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node))
        setOpenForLocation(null);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [menuOpen]);

  return (
    <header
      ref={header}
      className={
        "site-header" +
        (overlay ? " site-header--overlay" : " site-header--compact")
      }
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          closeMenu();
          menuButton.current?.focus();
        }
      }}
    >
      <div className="nav-pill">
        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-brand-700"
        >
          <Logo />
        </Link>
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-3 xl:flex"
        >
          {links.map((item) => (
            <NavigationEntry
              key={locationKey + item.to}
              item={item}
              onNavigate={closeMenu}
            />
          ))}
        </nav>
        <div className="hidden shrink-0 items-center gap-3 xl:flex">
          <label className="sr-only" htmlFor="site-currency">
            Currency
          </label>
          <select
            id="site-currency"
            value={currency}
            onChange={(event) => {
              const next = event.target.value === "USD" ? "USD" : "INR";
              setCurrency(next);
              setCurrencyPreference(next);
            }}
            className="rounded-full border border-brand-100 bg-white px-3 py-2 text-xs font-semibold text-brand-700 outline-none transition-colors hover:border-primary focus:border-primary"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
          {token ? <WebsiteAccountMenu key={locationKey + token} customer={customer} onNavigate={closeMenu} /> : <Link to="/login" className="text-sm font-semibold text-brand-700">
            Login
          </Link>}
          <Link
            to="/enquiry"
            className="rounded-full bg-brand-300 px-6 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-200"
          >
            Find Care
          </Link>
        </div>
        <button
          ref={menuButton}
          type="button"
          className="rounded-full p-3 text-brand-700 xl:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setOpenForLocation(menuOpen ? null : locationKey)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      <nav
        id="mobile-navigation"
        aria-label="Mobile navigation"
        hidden={!menuOpen}
        className="mt-3 max-h-[70dvh] overflow-y-auto rounded-2xl border border-brand-100 bg-white p-4 shadow-xl xl:hidden"
      >
        {menuOpen && (
          <label className="mb-3 flex items-center justify-between rounded-xl border border-brand-100 px-4 py-3 text-sm font-semibold text-brand-700">
            Currency
            <select
              value={currency}
              onChange={(event) => {
                const next = event.target.value === "USD" ? "USD" : "INR";
                setCurrency(next);
                setCurrencyPreference(next);
              }}
              className="rounded-full border border-brand-100 bg-white px-3 py-2 text-xs font-semibold text-brand-700 outline-none"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </label>
        )}
        {menuOpen && token && <WebsiteAccountMenu key={locationKey + token + '-mobile'} customer={customer} mobile onNavigate={closeMenu} />}
        {menuOpen &&
          [
            ...links,
            ...(!token ? [{ to: "/login", label: "Login" }] : []),
            { to: "/enquiry", label: "Find Care" },
          ].map((item) => (
            <NavigationEntry
              key={locationKey + item.to}
              item={item}
              mobile
              onNavigate={closeMenu}
            />
          ))}
      </nav>
    </header>
  );
}
