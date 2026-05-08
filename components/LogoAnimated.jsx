"use client"

/**
 * LogoAnimated.jsx
 *
 * Logo de ZetaPets con animaciones sutiles sobre el PNG base.
 *
 * ESTRATEGIA:
 * El logo es una imagen PNG plana, por lo que las animaciones se logran
 * con elementos HTML/SVG posicionados en overlay sobre las partes correctas.
 *
 * ANIMACIONES:
 * 1. Perro (letra Z verde): guiña un ojo cada 4 segundos.
 *    → Un pequeño overlay con forma de párpado cerrado aparece brevemente
 *      sobre el ojo del perro y desaparece. El ojo abierto es el PNG original.
 *
 * 2. Gato (letra P celeste): mueve la cola suavemente de forma continua.
 *    → Un arco SVG blanco posicionado sobre la cola del gato oscila con
 *      una animación CSS de rotación suave.
 *
 * AJUSTE FINO DE POSICIÓN:
 * Si al visualizar los overlays no coinciden exactamente con el ojo o la cola,
 * modificar las variables CSS en globals.css:
 *   --dog-eye-left, --dog-eye-top
 *   --cat-tail-left, --cat-tail-top
 *
 * NOTA TÉCNICA:
 * Las posiciones están calculadas en base al ratio real del PNG (≈1.71:1)
 * y al tamaño de display del logo en el navbar (176x55 container,
 * imagen renderizada ~94x55 centrada).
 */

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function LogoAnimated() {
  const [winking, setWinking] = useState(false)

  // Perro guiña un ojo cada 4 segundos durante 280ms
  useEffect(() => {
    const interval = setInterval(() => {
      setWinking(true)
      const timeout = setTimeout(() => setWinking(false), 280)
      return () => clearTimeout(timeout)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link href="/" className="logo" aria-label="ZetaPets - Inicio">
      <div className="logo-wrap">

        {/* ── Imagen base del logo ────────────────────────────────── */}
        <Image
          src="/logo.png"
          alt="ZetaPets"
          width={176}
          height={55}
          style={{ objectFit: "contain", display: "block" }}
          priority
        />

        {/* ── Overlay: párpado del perro (guiño) ──────────────────── */}
        {/*
          Posición calculada sobre el ojo del perro en la letra Z verde.
          El ojo del perro está aprox. en X:35%, Y:27% del contenedor.
          Ajustar --dog-eye-left / --dog-eye-top si es necesario.
        */}
        <span
          className={`logo-dog-eye${winking ? " logo-dog-eye--wink" : ""}`}
          aria-hidden="true"
        />

        {/* ── Overlay: cola del gato (movimiento continuo) ─────────── */}
        {/*
          La cola del gato blanco está en la base derecha del gato,
          aprox. X:41%, Y:66% del contenedor.
          Ajustar --cat-tail-left / --cat-tail-top si es necesario.
        */}
        <svg
          className="logo-cat-tail"
          width="9"
          height="12"
          viewBox="0 0 9 12"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          {/* Arco que imita la curvatura de la cola del gato */}
          <path
            d="M 2 11 Q 9 7 5 1"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

      </div>
    </Link>
  )
}
