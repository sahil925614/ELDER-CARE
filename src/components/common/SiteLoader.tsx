import "./SiteLoader.css";

/**
 * Shared loading state for the public website: a heart (as in the MEDindus
 * logo) that gently beats while a heartbeat line draws across it, in the
 * theme colour, with a short message underneath.
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
      <svg className="site-loader-mark" viewBox="0 0 64 56" aria-hidden="true">
        <path
          className="site-loader-heart"
          d="M32 51C17 41 5 31 5 18.5 5 10.5 11 5 18.5 5c5.6 0 10 3.2 13.5 8 3.5-4.8 7.9-8 13.5-8C53 5 59 10.5 59 18.5 59 31 47 41 32 51Z"
        />
        <path
          className="site-loader-pulse"
          pathLength={100}
          d="M2 29h15l4-8 5 16 6-22 5 18 3-6h22"
        />
      </svg>
      <span className="site-loader-label">{label}</span>
    </div>
  );
}
