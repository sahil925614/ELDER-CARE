import { Logo } from './Logo'
import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function CustomerNavigationDrawer({ children, footer, onClose }: { children: ReactNode; footer?: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    const desktop = window.matchMedia('(min-width: 1024px)')
    const checkWidth = () => { if (desktop.matches) closeRef.current() }
    desktop.addEventListener('change', checkWidth)
    checkWidth()
    return () => {
      desktop.removeEventListener('change', checkWidth)
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <dialog ref={ref} id="customer-navigation-drawer" aria-labelledby="customer-navigation-title"
      className="customer-navigation-drawer"
      onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
      }}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-brand-100 px-5 py-6">
          <div className="min-w-0"><span id="customer-navigation-title" className="sr-only">Customer navigation</span><Logo /></div>
          <button autoFocus type="button" aria-label="Close customer navigation" className="portal-icon-button" onClick={onClose}><X size={20} aria-hidden="true" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">{children}</div>
        {footer && <div className="shrink-0 border-t border-brand-100 px-4 py-4">{footer}</div>}
      </div>
    </dialog>
  )
}
