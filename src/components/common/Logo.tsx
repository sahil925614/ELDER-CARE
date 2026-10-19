import logo from "@/assets/testlogo.png";
import footerLogo from "@/assets/testlogo.png";
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
      src={variant === 'footer' ? footerLogo : logo}
      alt={branding.site_name}
      className="h-10 w-32 max-w-full object-contain sm:w-44"
      onError={(event) => {
        if (event.currentTarget.src !== new URL(fallback, window.location.href).href) {
          event.currentTarget.src = fallback;
        }
      }}
    />
  );
}
