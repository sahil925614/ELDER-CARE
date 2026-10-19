export interface SeoSettings {
  title: string;
  description: string;
  keywords: string[];
  canonicalPath?: string;
  noIndex: boolean;
  noFollow: boolean;
  image?: string;
  imageAlt?: string;
}
export const pageSeo: Record<string, SeoSettings> = {
  "/": {
    title: "Elder Care | Compassionate Care for Your Family",
    description:
      "Explore elder care services, care plans, healthcare professionals, and support for your family.",
    keywords: ["elder care", "elder care"],
    noIndex: false,
    noFollow: false,
  },
  "/about": {
    title: "About Us | Elder Care",
    description:
      "Learn about our approach to compassionate elder care and family connection.",
    keywords: ["elder care", "about us"],
    noIndex: false,
    noFollow: false,
  },
  "/services": {
    title: "Elder Care Services | Elder Care",
    description:
      "Explore doctor visits, home care, nursing, physiotherapy, and additional care services.",
    keywords: ["elder care", "elder care services"],
    noIndex: false,
    noFollow: false,
  },
  "/plans": {
    title: "Care Plans | Elder Care",
    description:
      "Explore Basic, Standard, and Premium care plans and discuss your family's needs.",
    keywords: ["elder care", "care plans"],
    noIndex: false,
    noFollow: false,
  },
  "/add-ons": {
    title: "Add-on Services | Elder Care",
    description:
      "Explore additional services to complement your elder care plan.",
    keywords: ["elder care", "add-on services"],
    noIndex: false,
    noFollow: false,
  },
  "/doctors": {
    title: "Care Experts | Elder Care",
    description:
      "Explore doctors, physiotherapists, and nursing professionals for elder care.",
    keywords: ["elder care", "care experts"],
    noIndex: false,
    noFollow: false,
  },
  "/how-it-works": {
    title: "How It Works | Elder Care",
    description:
      "Learn how to explore care, enquire, and manage your family's care journey.",
    keywords: ["elder care", "how it works"],
    noIndex: false,
    noFollow: false,
  },
  "/blog": {
    title: "Elder Care Journal | Elder Care",
    description:
      "Read about care planning, family conversations, and everyday connection.",
    keywords: ["elder care", "elder care journal"],
    noIndex: false,
    noFollow: false,
  },
  "/faqs": {
    title: "Frequently Asked Questions | Elder Care",
    description:
      "Find answers about care plans, appointments, services, and customer accounts.",
    keywords: ["elder care", "frequently asked questions"],
    noIndex: false,
    noFollow: false,
  },
  "/testimonials": {
    title: "Family Stories | Elder Care",
    description:
      "Explore the family stories and experiences shared through Elder Care.",
    keywords: ["elder care", "family stories"],
    noIndex: false,
    noFollow: false,
  },
  "/contact": {
    title: "Contact Us | Elder Care",
    description:
      "Connect with Elder Care to discuss your questions and support needs.",
    keywords: ["elder care", "contact us"],
    noIndex: false,
    noFollow: false,
  },
  "/enquiry": {
    title: "Make an Enquiry | Elder Care",
    description:
      "Tell us about the care and support you are exploring for your family.",
    keywords: ["elder care", "make an enquiry"],
    noIndex: true,
    noFollow: false,
  },
  "/become-a-partner": {
    title: "Become a Partner | Elder Care",
    description:
      "Introduce your medical practice and explore doctor partnerships with Elder Care.",
    keywords: ["elder care", "become a partner"],
    noIndex: false,
    noFollow: false,
  },
  "/privacy-policy": {
    title: "Privacy Policy | Elder Care",
    description:
      "Read the draft privacy information for the Elder Care platform.",
    keywords: ["elder care", "privacy policy"],
    noIndex: true,
    noFollow: false,
  },
  "/terms": {
    title: "Terms & Conditions | Elder Care",
    description:
      "Read the draft terms for Elder Care services and platform use.",
    keywords: ["elder care", "terms & conditions"],
    noIndex: true,
    noFollow: false,
  },
  "/login": {
    title: "Customer Login | Elder Care",
    description: "Access your Elder Care customer account.",
    keywords: ["elder care", "customer login"],
    noIndex: true,
    noFollow: false,
  },
  "/register": {
    title: "Create an Account | Elder Care",
    description: "Start your Elder Care customer account journey.",
    keywords: ["elder care", "create an account"],
    noIndex: true,
    noFollow: false,
  },
  "/forgot-password": {
    title: "Reset Password | Elder Care",
    description: "Recover access to your Elder Care account.",
    keywords: ["elder care", "reset password"],
    noIndex: true,
    noFollow: false,
  },
  "/doctors/doctors": {
    title: "Doctors | Elder Care",
    description:
      "Explore doctor consultations and discuss care requirements for your loved one.",
    keywords: ["elder care", "doctors"],
    noIndex: false,
    noFollow: false,
  },
  "/doctors/physiotherapists": {
    title: "Physiotherapists | Elder Care",
    description:
      "Explore professional support for movement and mobility needs.",
    keywords: ["elder care", "physiotherapists"],
    noIndex: false,
    noFollow: false,
  },
  "/doctors/nursing-professionals": {
    title: "Nursing Professionals | Elder Care",
    description:
      "Explore nursing support, visit arrangements, and care preferences.",
    keywords: ["elder care", "nursing professionals"],
    noIndex: false,
    noFollow: false,
  },
};

pageSeo["/plans/basic"] = {
  title: "Basic Care Plan | Elder Care",
  description:
    "Explore the Basic care plan, discuss your preferred duration, and enquire about services and pricing.",
  keywords: ["elder care", "basic care plan"],
  noIndex: false,
  noFollow: false,
};
pageSeo["/plans/standard"] = {
  title: "Standard Care Plan | Elder Care",
  description:
    "Explore the Standard care plan, discuss your preferred duration, and enquire about services and pricing.",
  keywords: ["elder care", "standard care plan"],
  noIndex: false,
  noFollow: false,
};
pageSeo["/plans/premium"] = {
  title: "Premium Care Plan | Elder Care",
  description:
    "Explore the Premium care plan, discuss your preferred duration, and enquire about services and pricing.",
  keywords: ["elder care", "premium care plan"],
  noIndex: false,
  noFollow: false,
};
