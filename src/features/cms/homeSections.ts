export const defaultHomeSections = {
  highlights: { items: [
    { title: 'Care with compassion', text: 'People come first. Always.' },
    { title: 'Respect for every individual', text: 'Support around their needs.' },
    { title: 'Comfort in familiar surroundings', text: 'Care that feels close to home.' },
    { title: 'Support for every family', text: 'Helping families feel connected.' },
    { title: 'Care you can trust', text: 'Thoughtful support at every step.' },
    { title: 'Support when you need it', text: 'Making everyday care easier.' },
  ] },
  services: { label: 'Our services', title: 'A little support. A meaningful difference.', text: 'From everyday companionship to professional care, explore support for the moments that matter.', button_label: 'Explore all services', button_url: '/services', item_label: 'Explore care' },
  approach: {
    label: 'Why Elder Care', title: 'For them, a helping hand. For you, peace of mind.', text: "Every family has a different story. Our aim is to help you explore care that respects your loved one's routines, preferences, and independence.",
    image_url: null as string | null, image_alt: 'An older woman and her caregiver smiling together', image_badge: 'Person-centred care', image_title: 'More than care. A connection.', image_text: 'With dignity at its heart.',
    items: [
      { title: 'We start by understanding', text: "Support begins with your family's needs, preferences, and everyday routines." },
      { title: 'Care that can move with life', text: 'Explore different care options as needs, routines, and circumstances change.' },
      { title: 'Everything stays connected', text: 'Keep care services, subscriptions, appointments, and important information together.' },
    ],
    button_label: 'Get to know us', button_url: '/about', button_note: 'Discover our approach to supporting elders and their families.',
  },
  journey: {
    label: 'How it works', title: 'Your care journey, made simpler.', text: "From understanding your family's needs to staying connected with care, we keep every step clear and simple.",
    items: [
      { label: 'Step 01', title: 'Tell us what matters', text: 'Start with the needs, preferences, and everyday routines of your loved one.', note: 'We listen first' },
      { label: 'Step 02', title: 'Explore the possibilities', text: 'Discover services and subscription options, and confirm the support available.', note: 'Find the right support' },
      { label: 'Step 03', title: 'Stay connected', text: 'Use your account to keep track of subscriptions, services, and appointments.', note: 'Everything in one place' },
    ], button_label: 'See how it works', button_url: '/how-it-works',
  },
  plans: {
    label: 'Subscription plans', title: "Care that fits into your family's life.", text: "Choose a starting point for ongoing support. We'll help you understand the inclusions and find an option that suits your family's needs.",
    button_label: 'Compare all plans', button_url: '/plans', help_title: 'Not sure which plan fits?', help_text: "Tell us about your family's needs and we'll help you explore the available options.", help_label: 'Talk to us', help_url: '/enquiry',
    price_label: 'Starting price', services_label: 'Included services', benefits_label: 'Benefits', choose_label: 'Choose',
  },
  addons: { label: 'Additional support', title: 'A little extra care, when it matters.', text: 'Explore services beyond your main subscription. Availability and pricing are confirmed for each service.', button_label: 'Discover add-on services', button_url: '/add-ons' },
  account: {
    label: 'Your Elder Care account', title_line_1: 'Your care journey.', title_line_2: 'One connected place.', text: "Keep your family's care information organised and easy to access whenever you need it.", button_note: 'Already have an account?', button_label: 'Login to your account', button_url: '/login',
    items: [
      { title: 'Profile', text: "Your family's care details, together." },
      { title: 'Subscriptions', text: 'Keep track of your care plans.' },
      { title: 'Appointments', text: "See what's coming up next." },
      { title: 'Payments', text: 'Find your payment information.' },
    ],
  },
  faqs: {
    label: 'A little clarity', title: "Questions? Let's start here.", text: 'Explore answers to common questions about plans, services, and your care journey.', button_label: 'View all FAQs', button_url: '/faqs',
    items: [
      { question: 'How do I choose a care plan?', answer: 'Start by exploring our subscription plans and the care your loved one needs. Contact us to discuss the options and confirm inclusions, pricing, and availability.' },
      { question: 'Can I purchase additional services?', answer: 'Add-on services are intended to complement a subscription or meet an additional care need. Available services and applicable prices will be listed in the service catalogue.' },
      { question: 'Where will I manage my care?', answer: 'Your customer account is designed to bring together your profile, subscriptions, purchased services, appointments, and payments.' },
      { question: 'How can I learn more before registering?', answer: 'Explore our services and How It Works pages, or visit Contact Us for more information.' },
    ],
  },
  enquiry: {
    label: 'Here for your family', title: 'The next chapter starts with a conversation.', text: "Tell us a little about your family's needs. We'll help you explore care and support that respects what matters most to your loved one.", note_title: 'Care begins with understanding.', note_text: "Your family's routines, preferences, and priorities come first.",
    action_label: 'Take the next step', action_title: 'Not sure what kind of care you need?', action_text: "Start by telling us what you're looking for. You can explore the available options before deciding what feels right.",
    primary_label: 'Make an enquiry', primary_url: '/enquiry', secondary_label: 'Contact us', secondary_url: '/contact', reassurance: 'No need to have everything figured out before getting in touch.',
  },
};

export type HomeSectionsContent = typeof defaultHomeSections;

export interface HomeService {
  id: number;
  name: string;
  text: string;
  image_url: string | null;
  url: string;
}
