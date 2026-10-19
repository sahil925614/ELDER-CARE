import { PlanDetailsPage } from '@/pages/website/PlanDetailsPage'
import { CareCategoryPage } from '@/pages/website/CareCategoryPage'
import { DoctorRegistrationPage } from '@/pages/website/DoctorRegistrationPage'
import { DashboardPage } from '@/pages/customer/DashboardPage'
import { EldersPage } from '@/pages/customer/EldersPage'
import { FamilyPage } from '@/pages/customer/FamilyPage'
import { SubscriptionsPage } from '@/pages/customer/SubscriptionsPage'
import { CheckoutPage } from '@/pages/customer/CheckoutPage'
import { AddOnsPage as CustomerAddOnsPage } from '@/pages/customer/AddOnsPage'
import { AppointmentsPage } from '@/pages/customer/AppointmentsPage'
import { PaymentsPage } from '@/pages/customer/PaymentsPage'
import { NotificationsPage } from '@/pages/customer/NotificationsPage'
import { ProfilePage } from '@/pages/customer/ProfilePage'
import { createBrowserRouter } from 'react-router-dom'
import { WebsiteLayout } from '@/layouts/WebsiteLayout'
import { PortalLayout } from '@/layouts/PortalLayout'
import { HomePage } from '@/pages/website/HomePage'
import { NotFoundPage } from '@/pages/shared/NotFoundPage'
import { AboutPage } from '@/pages/website/AboutPage'
import { ServicesPage } from '@/pages/website/ServicesPage'
import { PlansPage } from '@/pages/website/PlansPage'
import { AddOnsPage } from '@/pages/website/AddOnsPage'
import { DoctorsPage } from '@/pages/website/DoctorsPage'
import { HowItWorksPage } from '@/pages/website/HowItWorksPage'
import { BlogPage } from '@/pages/website/BlogPage'
import { FaqsPage } from '@/pages/website/FaqsPage'
import { TestimonialsPage } from '@/pages/website/TestimonialsPage'
import { ContactPage } from '@/pages/website/ContactPage'
import { EnquiryPage } from '@/pages/website/EnquiryPage'
import { PrivacyPolicyPage } from '@/pages/website/PrivacyPolicyPage'
import { TermsPage } from '@/pages/website/TermsPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'

export const router = createBrowserRouter([
  {
    element: <WebsiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'services', element: <ServicesPage /> },
      { path: 'plans', element: <PlansPage /> },
      { path: 'plans/basic', element: <PlanDetailsPage planName="Basic" /> },
      { path: 'plans/standard', element: <PlanDetailsPage planName="Standard" /> },
      { path: 'plans/premium', element: <PlanDetailsPage planName="Premium" /> },
      { path: 'plans/:planSlug', element: <PlanDetailsPage /> },
      { path: 'add-ons', element: <AddOnsPage /> },
      { path: 'doctors', element: <DoctorsPage /> },
      { path: 'doctors/doctors', element: <CareCategoryPage category="doctors" /> },
      { path: 'doctors/physiotherapists', element: <CareCategoryPage category="physiotherapists" /> },
      { path: 'doctors/nursing-professionals', element: <CareCategoryPage category="nursing-professionals" /> },
      { path: 'become-a-partner', element: <DoctorRegistrationPage /> },
      { path: 'partner/register', element: <DoctorRegistrationPage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'blog', element: <BlogPage /> },
      { path: 'blog/:slug', element: <BlogPage /> },
      { path: 'faqs', element: <FaqsPage /> },
      { path: 'testimonials', element: <TestimonialsPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'enquiry', element: <EnquiryPage /> },
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password/:token', element: <ResetPasswordPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: 'customer',
    element: <PortalLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'elders', element: <EldersPage /> },
      { path: 'family', element: <FamilyPage /> },
      { path: 'subscriptions', element: <SubscriptionsPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'add-ons', element: <CustomerAddOnsPage /> },
      { path: 'appointments', element: <AppointmentsPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
