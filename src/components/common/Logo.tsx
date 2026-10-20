import logo from "@/assets/newheaderlogo.png";
import footerLogo from "@/assets/newfooterlogo.png";
import { useWebsiteBranding } from '@/features/cms/websiteBranding';

export function Logo({
  variant = "default",
}: {
  variant?: "default" | "footer";
}) {
  const branding = useWebsiteBranding();
  const fallback = variant === 'footer' ? footerLogo : logo;
  return (
    <img
      src={variant === 'footer' ? footerLogo : branding.logo_url || logo}
      alt={branding.site_name}
      className="h-12 w-32 max-w-full object-contain pl-3 sm:w-44 sm:pl-0"
      onError={(event) => {
        if (event.currentTarget.src !== new URL(fallback, window.location.href).href) {
          event.currentTarget.src = fallback;
        }
      }}
    />
  );
}
