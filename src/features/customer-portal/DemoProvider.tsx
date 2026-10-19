import { useState } from "react";
import type { ReactNode } from "react";
import { Context } from "./demoState";
import type { Person, Notice, Profile } from "./demoState";
import { getStoredCustomer } from "@/features/auth/customerSession";

export function DemoProvider({ children }: { children: ReactNode }) {
  const [elders, setElders] = useState<Person[]>([
    {
      id: "elder-1",
      name: "Demo Elder One",
      relationship: "Parent",
      city: "Pune",
    },
    {
      id: "elder-2",
      name: "Demo Elder Two",
      relationship: "Parent",
      city: "Mumbai",
    },
  ]);
  const [family, setFamily] = useState<Person[]>([
    {
      id: "family-1",
      name: "Demo Family Member",
      relationship: "Sibling",
      city: "Pune",
    },
  ]);
  const [notices, setNotices] = useState<Notice[]>([
    {
      id: "n1",
      title: "Your upcoming care visit",
      text: "A sample appointment is ready to review in your care calendar.",
      category: "Appointments",
      read: false,
    },
    {
      id: "n2",
      title: "Your plan overview is ready",
      text: "Explore the sample Standard plan and its subscription timeline.",
      category: "Subscriptions",
      read: false,
    },
    {
      id: "n3",
      title: "Payment record available",
      text: "A demonstration payment record has been added to Payments.",
      category: "Payments",
      read: false,
    },
    {
      id: "n4",
      title: "Welcome to your care space",
      text: "Keep family profiles, appointments, and services together.",
      category: "Account",
      read: true,
    },
  ]);
  const [profile, setProfile] = useState<Profile>(() => {
    const customer = getStoredCustomer();

    return {
      name: customer?.name || "Demo Customer",
      email: customer?.email || "customer@example.com",
      phone: customer?.phone || "",
      address: customer?.address || "",
      city: customer?.city || "Pune",
      state: customer?.state || "",
      country: customer?.country || "India",
      zipCode: customer?.zip_code || "",
      profilePhotoUrl: customer?.profile_photo_url || "",
      emailUpdates: true,
    };
  });
  return (
    <Context.Provider
      value={{
        elders,
        setElders,
        family,
        setFamily,
        notices,
        setNotices,
        profile,
        setProfile,
      }}
    >
      {children}
    </Context.Provider>
  );
}
