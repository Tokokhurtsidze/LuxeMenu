'use client'

import { useEffect } from 'react'

interface ScanTrackerProps {
  restaurantSlug: string
}

export default function ScanTracker({ restaurantSlug }: ScanTrackerProps) {
  useEffect(() => {
    fetch(`/api/analytics/scan/${restaurantSlug}`, { method: 'POST' })
  }, [])

  return null
}
