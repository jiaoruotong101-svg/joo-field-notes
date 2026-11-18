import { useState, type ReactNode } from 'react'
import { readHomeState, rememberDetail } from '../homeState'

export function RememberedDetails({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  const [open, setOpen] = useState(() => readHomeState()?.openDetails.includes(id) || false)
  return <details className={className} data-home-detail={id} open={open} onToggle={event => {
    const next = event.currentTarget.open
    setOpen(next)
    rememberDetail(id, next)
  }}>{children}</details>
}
