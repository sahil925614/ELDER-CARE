# Website pages

Each route owns its page content. WebsiteLayout shares the header, footer, floating actions, and photo-banner layout.

The add-ons, offers, how-it-works, blog, FAQs, testimonials, legal, and enquiry routes now have designed content. Blog articles use the ?article= URL parameter. Add-on enquiries use ?interest= to prefill the enquiry form.

Replace the two photo imports in components/WebsiteExtras.tsx to update the repeated photos used on these new pages. The earlier five pages retain their existing image configuration.

Enquiry and account forms validate locally but do not submit, store personal information, or authenticate. Offers and testimonial examples are explicitly illustrative. Privacy and terms text is draft layout content awaiting approval.
