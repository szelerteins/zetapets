"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePathname } from "next/navigation"

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getOrCreate(storage, key) {
  try {
    let val = storage.getItem(key)
    if (!val) { val = generateId(); storage.setItem(key, val) }
    return val
  } catch { return generateId() }
}

function getUTMParams() {
  try {
    const p = new URLSearchParams(window.location.search)
    return {
      utm_source:   p.get("utm_source")   || null,
      utm_medium:   p.get("utm_medium")   || null,
      utm_campaign: p.get("utm_campaign") || null,
    }
  } catch { return {} }
}

export default function PageViewTracker() {
  const pathname = usePathname()
  const lastTracked = useRef(null)
  const pageStartTime = useRef(Date.now())
  const maxScroll = useRef(0)
  const currentPath = useRef(pathname)

  // Send time_on_page update for previous page before leaving
  const sendTimeUpdate = useCallback(() => {
    const duration = Math.round((Date.now() - pageStartTime.current) / 1000)
    const scroll = maxScroll.current
    if (duration < 1) return
    navigator.sendBeacon("/api/track/update", JSON.stringify({
      path: currentPath.current,
      session_id: getOrCreate(sessionStorage, "sz_session"),
      time_on_page: duration,
      scroll_depth: scroll,
    }))
  }, [])

  // Track clicks for heatmap
  useEffect(() => {
    if (pathname.startsWith("/admin")) return

    function handleClick(e) {
      const x_pct = parseFloat(((e.clientX / window.innerWidth) * 100).toFixed(2))
      const y_pct = parseFloat(((e.clientY / window.innerHeight) * 100).toFixed(2))
      const el = e.target
      const element = [el.tagName, el.textContent?.slice(0, 30)].filter(Boolean).join(": ")

      fetch("/api/track/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          session_id: getOrCreate(sessionStorage, "sz_session"),
          x_pct, y_pct, element,
        }),
      }).catch(() => {})
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [pathname])

  // Track scroll depth
  useEffect(() => {
    if (pathname.startsWith("/admin")) return
    maxScroll.current = 0

    function handleScroll() {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      const pct = Math.round((scrolled / total) * 100)
      if (pct > maxScroll.current) maxScroll.current = Math.min(pct, 100)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [pathname])

  // Track page views
  useEffect(() => {
    if (pathname.startsWith("/admin")) return
    if (lastTracked.current === pathname) return

    // Send time update for previous page
    if (lastTracked.current !== null) sendTimeUpdate()

    lastTracked.current = pathname
    currentPath.current = pathname
    pageStartTime.current = Date.now()
    maxScroll.current = 0

    const visitorId = getOrCreate(localStorage, "sz_visitor")
    const sessionId = getOrCreate(sessionStorage, "sz_session")

    // Check if new visitor (first time we see this visitorId in this browser)
    let isNewVisitor = false
    try {
      const seen = localStorage.getItem("sz_seen")
      if (!seen) { isNewVisitor = true; localStorage.setItem("sz_seen", "1") }
    } catch { isNewVisitor = true }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        session_id: sessionId,
        visitor_id: visitorId,
        is_new_visitor: isNewVisitor,
        ...getUTMParams(),
      }),
    }).catch(() => {})
  }, [pathname, sendTimeUpdate])

  // Send time on page when tab becomes hidden or closes
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") sendTimeUpdate()
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [sendTimeUpdate])

  return null
}
