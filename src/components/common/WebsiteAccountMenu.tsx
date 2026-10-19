import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CalendarDays, ChevronDown, CreditCard, HeartHandshake, LayoutDashboard, Layers, Loader2, LogOut, PackagePlus, UserRound } from 'lucide-react';
import { logoutCustomer, type CustomerUser } from '@/features/auth/customerAuth';

const shortcuts = [
  { to: '/customer', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customer/elders', label: 'Elder Profiles', icon: HeartHandshake },
  { to: '/customer/subscriptions', label: 'My Subscriptions', icon: Layers },
  { to: '/customer/add-ons', label: 'My Add-ons', icon: PackagePlus },
  { to: '/customer/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/customer/payments', label: 'Payments', icon: CreditCard },
  { to: '/customer/notifications', label: 'Notifications', icon: Bell },
  { to: '/customer/profile', label: 'My Profile', icon: UserRound },
];

export function WebsiteAccountMenu({ customer, mobile = false, onNavigate }: { customer: CustomerUser | null; mobile?: boolean; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = mobile ? 'mobile-account-menu' : 'website-account-menu';
  const name = customer?.name.trim() || 'My account';
  const initials = customer?.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'CU';

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);

  async function signOut() {
    setLoggingOut(true);
    try {
      await logoutCustomer();
    } catch {
      // logoutCustomer clears local credentials even when the server is unavailable.
    } finally {
      setLoggingOut(false);
      setOpen(false);
      onNavigate();
    }
  }

  return (
    <div ref={container} className={mobile ? 'relative mb-3 border-b border-brand-100 pb-3' : 'relative shrink-0'}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}>
      <button ref={trigger} type="button" aria-label="Open account menu" aria-expanded={open} aria-controls={id}
        title={name}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
            window.requestAnimationFrame(() => container.current?.querySelector<HTMLAnchorElement>('nav a')?.focus());
          }
        }}
        className={'flex items-center gap-2 rounded-lg text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ' + (mobile ? 'w-full px-4 py-3' : 'px-2 py-1.5')}>
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-[11px] font-semibold text-primary" aria-hidden="true">{initials}</span>
        <span className={'min-w-0 truncate text-left ' + (mobile ? 'flex-1' : 'max-w-20')}>{mobile || !customer ? name : name.split(/\s+/)[0]}</span>
        <ChevronDown size={15} aria-hidden="true" className={'shrink-0 transition-transform motion-reduce:transition-none ' + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <section id={id} aria-label="Customer account"
          className={mobile ? 'mt-2 overflow-hidden rounded-lg border border-brand-100 bg-white' : 'absolute right-0 top-full z-50 mt-3 w-72 max-w-[calc(100vw-32px)] overflow-hidden rounded-lg border border-brand-100 bg-white shadow-xl'}>
          <div className="border-b border-brand-100 px-4 py-4">
            <p className="break-words text-sm font-semibold text-brand-900">{name}</p>
            {customer?.email && <p className="mt-1 break-all text-xs text-slate-500">{customer.email}</p>}
          </div>
          <div className={mobile ? '' : 'max-h-[min(440px,calc(100dvh-220px))] overflow-y-auto overscroll-contain'}>
            <nav aria-label="Account shortcuts" className="space-y-0.5 p-2">
              {shortcuts.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => { setOpen(false); onNavigate(); }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-brand-700 transition-colors hover:bg-brand-50 focus-visible:bg-brand-50 focus-visible:outline-primary">
                  <Icon size={17} strokeWidth={1.7} aria-hidden="true" className="shrink-0 text-primary" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-brand-100 p-2">
              <button type="button" disabled={loggingOut} onClick={() => void signOut()}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50">
                {loggingOut ? <Loader2 size={17} aria-hidden="true" className="animate-spin" /> : <LogOut size={17} strokeWidth={1.7} aria-hidden="true" />}
                {loggingOut ? 'Signing out...' : 'Log Out'}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
