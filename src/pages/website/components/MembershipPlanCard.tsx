import { Link } from "react-router-dom";
import {
  Ambulance,
  ArrowUpRight,
  BellRing,
  BriefcaseMedical,
  ClipboardList,
  Crown,
  FlaskConical,
  Flower2,
  Headset,
  HeartHandshake,
  HeartPulse,
  House,
  Laptop,
  PhoneCall,
  Plus,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { PlanCatalogItem, PlanPrice } from "@/features/plans/planCatalog";
import { money, monthlyRate } from "@/features/plans/pricing";
import "./MembershipPlans.css";

/** Icon for a benefit line, picked from its wording so admin never has to choose one. */
function benefitIcon(text: string): LucideIcon {
  const value = text.toLowerCase();
  if (value.includes("ambulance")) return Ambulance;
  if (value.includes("on-call") || value.includes("on call")) return BellRing;
  if (value.includes("emergency")) return Headset;
  if (value.includes("check-in") || value.includes("call")) return PhoneCall;
  if (value.includes("nurs")) return Stethoscope;
  if (value.includes("online")) return Laptop;
  if (value.includes("doctor") || value.includes("physician")) return BriefcaseMedical;
  if (value.includes("lab") || value.includes("screening") || value.includes("test")) return FlaskConical;
  if (value.includes("safety") || value.includes("fall")) return House;
  if (value.includes("monitor") || value.includes("health")) return HeartPulse;
  if (value.includes("plan")) return ClipboardList;
  return ShieldCheck;
}

function planIcon(name: string): LucideIcon {
  const value = name.toLowerCase();
  if (value.includes("assurance")) return ShieldCheck;
  if (value.includes("plus")) return Plus;
  if (value.includes("prime")) return Flower2;
  if (value.includes("elite")) return Crown;
  return HeartHandshake;
}

/** "Care Prime" is shown as a light "Care" followed by the bold coloured "PRIME". */
function splitName(name: string) {
  const [first, ...rest] = name.trim().split(/\s+/);
  return rest.length ? { lead: first, tail: rest.join(" ") } : { lead: "", tail: first };
}

export function MembershipPlanCard({
  plan,
  price,
  popularLabel,
  chooseLabel,
}: {
  plan: PlanCatalogItem;
  price?: PlanPrice;
  popularLabel: string;
  chooseLabel: string;
}) {
  const Icon = planIcon(plan.name);
  const { lead, tail } = splitName(plan.name);
  const items = plan.features.length
    ? plan.features.map((feature) => feature.title)
    : plan.services.map(
        (service) =>
          service.name +
          (service.is_unlimited ? " (unlimited)" : service.quantity ? " x " + service.quantity : "") +
          (service.usage_period ? " " + service.usage_period.replace(/_/g, " ") : ""),
      );
  const bestFor = plan.best_for || plan.short_description;
  const months = price ? price.duration_months + (price.free_months || 0) : 1;

  return (
    <article
      className="membership-card"
      data-featured={plan.is_featured}
      style={plan.highlight_color ? ({ "--accent": plan.highlight_color } as React.CSSProperties) : undefined}
    >
      {plan.is_featured && (
        <span className="membership-ribbon">
          <Star size={13} fill="currentColor" aria-hidden="true" />
          {popularLabel}
        </span>
      )}

      <header className="membership-head">
        <Icon size={34} strokeWidth={1.5} aria-hidden="true" />
        <h3>
          {lead && <span className="membership-lead">{lead} </span>}
          <span className="membership-tail">{tail}</span>
        </h3>
      </header>

      <div className="membership-price">
        {price ? (
          <>
            <p>
              <strong>{money(monthlyRate(price), price.currency)}</strong>
              <span> / month</span>
            </p>
            {months > 1 && (
              <small>
                {money(price.price, price.currency)} billed for {price.duration_months}
                {price.free_months ? " + " + price.free_months + " free" : ""} months
              </small>
            )}
          </>
        ) : (
          <p>
            <span>Pricing coming soon</span>
          </p>
        )}
      </div>

      <ul className="membership-items">
        {items.map((text) => {
          const ItemIcon = benefitIcon(text);
          return (
            <li key={text}>
              <ItemIcon size={24} strokeWidth={1.5} aria-hidden="true" />
              <span>{text}</span>
            </li>
          );
        })}
      </ul>

      {bestFor && (
        <div className="membership-best">
          <p>
            <Users size={20} strokeWidth={1.6} aria-hidden="true" />
            Best suited for?
          </p>
          <em>{bestFor}</em>
        </div>
      )}

      {price ? (
        <Link
          to={"/customer/checkout?plan=" + encodeURIComponent(plan.slug) + "&price=" + price.id}
          className="membership-cta"
        >
          {chooseLabel} {plan.name}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      ) : (
        <span className="membership-cta" data-disabled="true">
          Pricing coming soon
        </span>
      )}

      <Link to={"/plans/" + plan.slug} className="membership-more">
        View full plan details
      </Link>
    </article>
  );
}
