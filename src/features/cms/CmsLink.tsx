import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { resolveWebsiteLink } from './websiteLinks';

export function CmsLink({ to, children, className }: { to: string; children: ReactNode; className: string }) {
  const destination = resolveWebsiteLink(to);
  return destination.internal
    ? <Link to={destination.href} className={className}>{children}</Link>
    : <a href={destination.href} className={className}>{children}</a>;
}
