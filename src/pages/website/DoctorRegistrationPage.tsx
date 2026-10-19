import { useEffect } from 'react';
import { resolveWebsiteLink } from '@/features/cms/websiteLinks';

export function DoctorRegistrationPage() {
  const destination = resolveWebsiteLink('/partner/register').href;
  useEffect(() => { window.location.replace(destination); }, [destination]);
  return <section className="py-16"><a className="text-link" href={destination}>Continue to partner registration</a></section>;
}
