# Website colors

Edit the two variables at the top of src/styles/globals.css:

```css
:root {
  --primary-color: #147f79;
  --secondary-color: #63d1c6;
}
```

Primary controls main buttons, links, focus outlines, and icons. A darker shade
is derived for headings and the footer. Secondary controls accent buttons,
the hero tint, and the derived pale backgrounds and borders.

The homepage, header, footer, floating controls, appointment drawer, and existing
brand-styled pages all use these variables. Hero photos keep their original colors;
only their CSS overlay changes. Whites, neutral text, and status colors remain
independent so error messages and content keep their meaning.

For new components use Tailwind classes such as bg-primary, text-primary,
bg-secondary, or the derived brand shades (bg-brand-50, border-brand-100,
text-brand-900). Opacity modifiers such as bg-primary/10 work too.
Do not add hardcoded brand hex colors inside components.

Choose a primary dark enough for white button text, and check readability on
both desktop and mobile when switching palettes.
