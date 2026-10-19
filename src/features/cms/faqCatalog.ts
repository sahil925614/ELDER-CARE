import { useEffect, useState } from 'react';
import { apiRequest } from '@/services/api/client';

export interface FaqCatalog {
  categories: { id: number; name: string }[];
  faqs: { id: number; category_id: number; category: string; question: string; answer: string }[];
}
const empty: FaqCatalog = { categories: [], faqs: [] };

export function useFaqCatalog() {
  const [state, setState] = useState<{ status: 'loading' | 'ready' | 'error'; data: FaqCatalog }>({ status: 'loading', data: empty });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      try {
        const data = await apiRequest<FaqCatalog>('website/faqs');
        if (!data || !Array.isArray(data.categories) || !Array.isArray(data.faqs)) throw new Error('Invalid FAQ catalogue');
        if (active && current === revision) setState({ status: 'ready', data });
      } catch { if (active && current === revision) setState({ status: 'error', data: empty }); }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [attempt]);
  return { ...state, retry: () => { setState({ status: 'loading', data: empty }); setAttempt(value => value + 1); } };
}
