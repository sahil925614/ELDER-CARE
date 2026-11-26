import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { key, pathname, search, state } = useLocation()
  const keepScroll = Boolean((state as { keepScroll?: boolean } | null)?.keepScroll)
  useLayoutEffect(() => {
    // Filters such as blog categories / pages ask to stay where the visitor is.
    if (keepScroll) return
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    return () => { window.history.scrollRestoration = previous }
  }, [key, pathname, search, keepScroll])
  return null
}
