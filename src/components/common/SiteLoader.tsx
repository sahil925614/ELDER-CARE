import "./SiteLoader.css";

/**
 * Shared loading state for the public website: a small spinning ring in the
 * theme colour with a short message. Use it wherever content is being fetched.
 */
export function SiteLoader({
  label = "Loading...",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" className={"site-loader " + className}>
      <span className="site-loader-ring" aria-hidden="true" />
      <span className="site-loader-label">{label}</span>
    </div>
  );
}
