import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/* =========================================================
   OVERVIEW
   Individual dashboard blocks animate
========================================================= */

export function AnimatedDashboardIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} className="portal-svg portal-svg-dashboard">
      <rect
        className="portal-dashboard-block portal-dashboard-block-1"
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        className="portal-dashboard-block portal-dashboard-block-2"
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        className="portal-dashboard-block portal-dashboard-block-3"
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
      <rect
        className="portal-dashboard-block portal-dashboard-block-4"
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
      />
    </svg>
  );
}

/* =========================================================
   ELDER PROFILE
   Heart gently beats
========================================================= */

export function AnimatedHeartIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} className="portal-svg portal-svg-heart">
      <g className="portal-heart-shape">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
      </g>

      <path
        className="portal-heart-pulse"
        d="M7.5 12h2l1.2-2.3 2.2 4.6 1.2-2.3h2.4"
      />
    </svg>
  );
}

/* =========================================================
   FAMILY
========================================================= */

export function AnimatedUsersIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} className="portal-svg portal-svg-users">
      <g className="portal-user-main">
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-2a6 6 0 0 1 12 0v2" />
      </g>

      <g className="portal-user-secondary">
        <path d="M16 4.5a3 3 0 0 1 0 5.8" />
        <path d="M18 14a5 5 0 0 1 3 4.6V21" />
      </g>
    </svg>
  );
}

/* =========================================================
   SUBSCRIPTIONS
   Layers separate and return
========================================================= */

export function AnimatedLayersIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} className="portal-svg portal-svg-layers">
      <path
        className="portal-layer portal-layer-top"
        d="m12 2 9 5-9 5-9-5 9-5Z"
      />

      <path
        className="portal-layer portal-layer-middle"
        d="m3 12 9 5 9-5"
      />

      <path
        className="portal-layer portal-layer-bottom"
        d="m3 17 9 5 9-5"
      />
    </svg>
  );
}

/* =========================================================
   ADD-ONS
   Plus opens/pops
========================================================= */

export function AnimatedPackageIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} className="portal-svg portal-svg-package">
      <g className="portal-package-box">
        <path d="M16.5 9.4 7.5 4.2" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0" />
        <path d="M3.3 7 12 12l8.7-5" />
        <path d="M12 22V12" />
      </g>

      <g className="portal-package-plus">
        <path d="M19 13v6" />
        <path d="M16 16h6" />
      </g>
    </svg>
  );
}

/* =========================================================
   APPOINTMENTS
   Calendar top/markers animate
========================================================= */

export function AnimatedCalendarIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} className="portal-svg portal-svg-calendar">
      <rect x="3" y="5" width="18" height="16" rx="2" />

      <g className="portal-calendar-header">
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 10h18" />
      </g>

      <g className="portal-calendar-dates">
        <path d="M8 14h.01" />
        <path d="M12 14h.01" />
        <path d="M16 14h.01" />
        <path d="M8 18h.01" />
        <path d="M12 18h.01" />
      </g>
    </svg>
  );
}

/* =========================================================
   PAYMENTS
   Card stripe slides
========================================================= */

export function AnimatedCardIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} className="portal-svg portal-svg-card">
      <rect x="2" y="5" width="20" height="14" rx="2" />

      <path
        className="portal-card-stripe"
        d="M2 10h20"
      />

      <path
        className="portal-card-detail"
        d="M6 15h4"
      />
    </svg>
  );
}

/* =========================================================
   NOTIFICATIONS
   Bell actually rings
========================================================= */

export function AnimatedBellIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} className="portal-svg portal-svg-bell">
      <g className="portal-bell-body">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </g>

      <path
        className="portal-bell-clapper"
        d="M12 18v1"
      />
    </svg>
  );
}

/* =========================================================
   PROFILE
========================================================= */

export function AnimatedProfileIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props} className="portal-svg portal-svg-profile">
      <circle
        className="portal-profile-head"
        cx="12"
        cy="7"
        r="4"
      />

      <path
        className="portal-profile-body"
        d="M4 21v-2a8 8 0 0 1 16 0v2"
      />
    </svg>
  );
}


/* =========================================================
   LOGOUT
   Door stays fixed, arrow moves outward
========================================================= */

export function AnimatedLogoutIcon(props: IconProps) {
  return (
    <svg
      {...baseProps}
      {...props}
      className="portal-svg portal-svg-logout"
    >
      {/* DOOR */}
      <path
        className="portal-logout-door"
        d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"
      />

      {/* ARROW */}
      <g className="portal-logout-arrow">
        <path d="M13 8l4 4-4 4" />
        <path d="M17 12H8" />
      </g>
    </svg>
  );
}


