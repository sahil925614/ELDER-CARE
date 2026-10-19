import { useEffect, useState } from 'react';
import { fetchCustomerMe } from './customerAuth';
import { CUSTOMER_SESSION_CHANGED, clearCustomerSession, getCustomerToken, getStoredCustomer } from './customerSession';
import { ApiError } from '@/services/api/client';

function readSession() {
  const token = getCustomerToken();
  return { token, customer: token ? getStoredCustomer() : null };
}

export function useCustomerSession() {
  const [session, setSession] = useState(readSession);

  useEffect(() => {
    const sync = () => setSession(readSession());
    window.addEventListener(CUSTOMER_SESSION_CHANGED, sync);
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    sync();
    return () => {
      window.removeEventListener(CUSTOMER_SESSION_CHANGED, sync);
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  useEffect(() => {
    if (!session.token) return;
    const token = session.token;
    let active = true;
    void fetchCustomerMe().catch((error: unknown) => {
      // Only an explicit auth rejection clears the session, not a network outage.
      if (active && getCustomerToken() === token && error instanceof ApiError && error.status === 401) {
        clearCustomerSession();
      }
    });
    return () => { active = false; };
  }, [session.token]);

  return session;
}
