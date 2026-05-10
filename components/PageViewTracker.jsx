"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export default function PageViewTracker() {
  const pathname = usePathname()
  const lastTracked = useRef(null)

  useEffect(() => {
    // No trackear el panel de admin
    if (pathname.startsWith("/admin")) return
    // Evitar trackear la misma ruta dos veces seguidas
    if (lastTracked.current === pathname) return
    lastTracked.current = pathname

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
    }).catch(() => {}) // silencioso si falla
  }, [pathname])

  return null
}
