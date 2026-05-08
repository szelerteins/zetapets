"use client"

/**
 * LogoAnimated.jsx
 *
 * Logo de ZetaPets (JPEG 1536×1024) con animaciones sobre PNG base.
 *
 * ANÁLISIS DEL ARCHIVO:
 * - Dimensiones reales: 1536 × 1024 px (ratio 3:2)
 * - El contenido real ocupa ~66% de la altura (whitespace arriba/abajo)
 * - Se muestra con height: 80px → width: 120px automático
 * - El contenido visible del logo es ~53px de alto (correcto para navbar)
 *
 * POSICIONES (en % del JPEG completo = % del display):
 *   Ojo del perro: x≈19%, y≈23%  (cabeza del perro, parte superior del Z verde)
 *   Cola del gato: x≈26%, y≈62%  (cola blanca curva, parte inferior-derecha del gato)
 *
 * AJUSTE FINO:
 * Si los overlays no coinciden exactamente, modificar en globals.css:
 *   --dog-eye-left / --dog-eye-top
 *   --cat-tail-left / --cat-tail-top
 */

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function LogoAnimated() {
  const [winking, setWinking] = useState(false)

  // Guiño cada 4 segundos, dura 300ms
  useEffect(() => {
    const interval = setInterval(() => {
      setWinking(true)
      setTimeout(() => setWinking(false), 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link href="/" className="logo-link" aria-label="ZetaPets - Inicio">
      <div className="logo-wrap">

        {/* ── Imagen base ────────────────────────────────────────────── */}
        <Image
          src="/logo.png"
          alt="ZetaPets"
          width={0}
          height={0}
          sizes="200px"
          className="logo-img"
          priority
        />

        {/* ── Overlay: párpado del perro (guiño) ──────────────────────
            Cubre el ojo blanco del perro con el mismo verde de su pelaje.
            Posición calculada en % del JPEG 1536×1024.
        */}
        <span
          className={`logo-dog-eye${winking ? " logo-dog-eye--wink" : ""}`}
          aria-hidden="true"
        />

        {/* ── Overlay: cola del gato (movimiento continuo) ─────────────
            Arco SVG blanco posicionado sobre la cola blanca del gato.
            Oscila -12° → +14° desde la base de la cola.
        */}
        <svg
          className="logo-cat-tail"
          viewBox="0 0 10 16"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          {/* Arco que imita la cola curva del gato */}
          <path
            d="M 3 15 Q 11 9 5 1"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

      </div>
    </Link>
  )
}
