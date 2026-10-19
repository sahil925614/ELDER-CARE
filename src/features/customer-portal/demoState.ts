import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";

export interface Person {
  id: string;
  name: string;
  relationship: string;
  city: string;
}
export interface Notice {
  id: string;
  title: string;
  text: string;
  category: string;
  read: boolean;
}
export interface Profile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  profilePhotoUrl: string;
  emailUpdates: boolean;
}
interface DemoState {
  elders: Person[];
  setElders: Dispatch<SetStateAction<Person[]>>;
  family: Person[];
  setFamily: Dispatch<SetStateAction<Person[]>>;
  notices: Notice[];
  setNotices: Dispatch<SetStateAction<Notice[]>>;
  profile: Profile;
  setProfile: Dispatch<SetStateAction<Profile>>;
}
export const Context = createContext<DemoState | null>(null);
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("Customer demo provider is missing");
  return value;
}

export const appointments = Array.from({ length: 9 }, (_, i) => ({
  id: "APT-" + (1001 + i),
  service: ["Doctor consultation", "Physiotherapy", "Home care visit"][i % 3],
  elder: i % 2 ? "Demo Elder Two" : "Demo Elder One",
  date: [
    "2026-10-12",
    "2026-10-15",
    "2026-10-18",
    "2026-09-20",
    "2026-09-18",
    "2026-09-14",
    "2026-09-10",
    "2026-09-07",
    "2026-09-03",
  ][i],
  time: i % 2 ? "11:30 AM" : "09:00 AM",
  status: i < 3 ? "Upcoming" : i === 6 ? "Cancelled" : "Completed",
}));
export const payments = Array.from({ length: 11 }, (_, i) => ({
  id: "DEMO-" + (2001 + i),
  description: i % 3 ? "Add-on service" : "Standard subscription",
  date: "2026-09-" + String(24 - i).padStart(2, "0"),
  amount: i % 3 ? 800 + i * 100 : 6000,
  status: i === 2 ? "Pending" : i === 5 ? "Failed" : "Paid",
  method: i % 2 ? "UPI" : "Card",
}));
export const money = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
export const formatDate = (date: string) =>
  new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
