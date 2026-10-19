import type { CustomerUser } from "./customerAuth";

const TOKEN_KEY = "elder-care-customer-token";
const USER_KEY = "elder-care-customer-user";
export const CUSTOMER_SESSION_CHANGED = "customer-session-changed";

function notifySessionChanged() {
  window.dispatchEvent(new Event(CUSTOMER_SESSION_CHANGED));
}

export function getCustomerToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredCustomer() {
  try {
    const value = localStorage.getItem(USER_KEY);
    return value ? (JSON.parse(value) as CustomerUser) : null;
  } catch {
    return null;
  }
}

export function storeCustomerSession(token: string, user: CustomerUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifySessionChanged();
}

export function storeCustomerUser(user: CustomerUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifySessionChanged();
}

export function clearCustomerSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Ignore storage failures so logout can still navigate.
  } finally {
    notifySessionChanged();
  }
}
