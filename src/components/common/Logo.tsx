import logo from "@/assets/logo-test.png";
import footerLogo from "@/assets/footer-logo-test.png";
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
      className="h-14 w-44 max-w-full object-contain"
      onError={(event) => {
        if (event.currentTarget.src !== new URL(fallback, window.location.href).href) {
          event.currentTarget.src = fallback;
        }
      }}
    />
  );
}
