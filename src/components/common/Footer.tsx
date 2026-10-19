import footerLogo from '@/assets/footer-logo-test.png';
import { useWebsiteFooter } from '@/features/cms/websiteFooter';
import './Footer.css';
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";
import { resolveWebsiteLink } from '@/features/cms/websiteLinks';

function FooterLink({ url, newTab = false, children, ...props }: { url: string; newTab?: boolean; children: ReactNode; className?: string; 'aria-label'?: string }) {
  const attributes = { ...props, target: newTab ? '_blank' : undefined, rel: newTab ? 'noopener noreferrer' : undefined };
  const destination = resolveWebsiteLink(url);
  return destination.internal ? <Link to={destination.href} {...attributes}>{children}</Link> : <a href={destination.href} {...attributes}>{children}</a>;
}

export function Footer() {
  const footer = useWebsiteFooter();
  const groups = footer.groups;
  const legalLinks = footer.legal_links.filter((link) => link.enabled);
  const [openGroup, setOpenGroup] = useState<number | null>(0);

  return (
    <footer className="website-footer bg-brand-900 text-white">
      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}

      <div
        className="
          page-container
          py-10
          sm:py-14
          lg:grid
          lg:grid-cols-[1.4fr_1fr_1fr_1fr]
          lg:gap-12
          lg:py-16
        "
      >
        {/* =================================================
            BRAND
        ================================================= */}

        <div className="footer-brand pb-9 lg:pb-0">
          <FooterLink
            url={footer.home_url}
            className="inline-flex items-center [&>img]:object-left"
            aria-label={`${footer.logo_alt} home`}
          >
            <img src={footer.logo_url || footerLogo} alt={footer.logo_alt} className="h-14 w-44 max-w-full object-contain"
              onError={(event) => { if (event.currentTarget.src !== new URL(footerLogo, window.location.href).href) event.currentTarget.src = footerLogo; }} />
          </FooterLink>

          <p
            className="
              mt-5
              max-w-[320px]
              text-sm
              leading-7
              text-brand-100/80
              sm:mt-6
            "
          >
            {footer.description}
          </p>

          {footer.cta.enabled && <FooterLink
            url={footer.cta.url}
            newTab={footer.cta.new_tab}
            className="
              group
              mt-6
              inline-flex
              items-center
              gap-3
              border-b
              border-brand-300/50
              pb-1.5
              text-sm
              font-semibold
              text-brand-100
              transition-colors
              hover:border-white
              hover:text-white
              lg:mt-7
              lg:rounded-full
              lg:border
              lg:px-5
              lg:py-3
              lg:font-normal
              lg:hover:bg-white/10
            "
          >
            {footer.cta.label}

            <ArrowUpRight
              size={16}
              strokeWidth={1.7}
              className="
                transition-transform
                duration-200
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
              aria-hidden="true"
            />
          </FooterLink>}
        </div>

        {/* =================================================
            MOBILE NAVIGATION
        ================================================= */}

        <div className="border-t border-white/15 lg:hidden">
          {groups.map(({ title, links }, groupIndex) => {
            const isOpen = openGroup === groupIndex;
            const id = `footer-links-${groupIndex}`;

            return (
              <div
                key={groupIndex}
                className="border-b border-white/15"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() =>
                    setOpenGroup((current) =>
                      current === groupIndex ? null : groupIndex,
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-4
                    py-5
                    text-left
                  "
                >
                  <span
                    className={
                      "text-[15px] font-semibold transition-colors " +
                      (isOpen ? "text-white" : "text-brand-100")
                    }
                  >
                    {title}
                  </span>

                  <span
                    className="
                      grid
                      size-8
                      shrink-0
                      place-items-center
                      text-brand-100
                    "
                  >
                    <ChevronDown
                      size={17}
                      strokeWidth={1.7}
                      aria-hidden="true"
                      className={
                        "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
                        (isOpen ? "rotate-180" : "")
                      }
                    />
                  </span>
                </button>

                {/* SMOOTH ACCORDION */}

                <div
                  id={id}
                  inert={!isOpen}
                  className={
                    "grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
                    (isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0")
                  }
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-1 pb-5">
                      {links.filter((link) => link.enabled).map((link, index) => (
                        <li key={index}>
                          <FooterLink
                            url={link.url}
                            newTab={link.new_tab}
                            className="
                              group
                              flex
                              items-center
                              justify-between
                              gap-4
                              py-2
                              text-sm
                              text-brand-100/75
                              transition-colors
                              hover:text-white
                            "
                          >
                            <span>{link.label}</span>

                            <ArrowUpRight
                              size={14}
                              strokeWidth={1.5}
                              className="
                                opacity-40
                                transition-all
                                group-hover:-translate-y-0.5
                                group-hover:translate-x-0.5
                                group-hover:opacity-100
                              "
                              aria-hidden="true"
                            />
                          </FooterLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        {groups.map(({ title, links }, index) => (
          <nav
            key={index}
            aria-label={title}
            className="hidden lg:block"
          >
            <h2 className="text-base font-semibold">
              {title}
            </h2>

            <ul className="mt-5 space-y-2">
              {links.filter((link) => link.enabled).map((link, index) => (
                <li key={index}>
                  <FooterLink
                    url={link.url}
                    newTab={link.new_tab}
                    className="
                      inline-block
                      py-1.5
                      text-sm
                      text-brand-100/85
                      transition-colors
                      hover:text-white
                      hover:underline
                    "
                  >
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* =====================================================
          BOTTOM
      ===================================================== */}

      <div className="border-t border-white/15">
        <div
          className="
            page-container
            py-6
            text-sm
            text-brand-100/75
            sm:flex
            sm:items-center
            sm:justify-between
            sm:gap-6
          "
        >
          <p className="text-xs sm:text-sm">
            &copy; {footer.show_current_year && <>{new Date().getFullYear()}{' '}</>}{footer.copyright_text}
          </p>

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-x-5
              gap-y-2
              sm:mt-0
              sm:gap-6
            "
          >
            {legalLinks.map((link, index) => <Fragment key={index}>
            {index > 0 && <span className="size-1 rounded-full bg-brand-300/60 sm:hidden" aria-hidden="true" />}
            <FooterLink
              url={link.url}
              newTab={link.new_tab}
              className="
                text-xs
                transition-colors
                hover:text-white
                sm:text-sm
              "
            >
              {link.label}
            </FooterLink>
            </Fragment>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
