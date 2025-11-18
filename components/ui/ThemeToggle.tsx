'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [tema, setTema] = useState<'light' | 'dark'>('light')
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
    // Leer el tema actual del DOM (ya establecido por el script de inicialización)
    const tieneDark = document.documentElement.classList.contains('dark')
    const temaActual = tieneDark ? 'dark' : 'light'
    
    setTema(temaActual)
  }, [])

  const aplicarTema = (nuevoTema: 'light' | 'dark') => {
    const root = document.documentElement
    if (nuevoTema === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('tema', nuevoTema)
  }

  const alternarTema = () => {
    const nuevoTema = tema === 'light' ? 'dark' : 'light'
    setTema(nuevoTema)
    aplicarTema(nuevoTema)
  }

  // Evitar hidratación incorrecta
  if (!montado) {
    return (
      <button
        className="p-2 rounded-lg bg-background-tertiary text-foreground-secondary"
        aria-label="Cambiar tema"
      >
        <Sun size={20} />
      </button>
    )
  }

  return (
    <button
      onClick={alternarTema}
      className="
        p-2 rounded-lg
        bg-background-tertiary dark:bg-background-tertiary
        text-foreground-secondary dark:text-foreground-secondary
        hover:bg-primary/10 dark:hover:bg-primary/20
        hover:text-primary dark:hover:text-primary
        transition-all duration-200
        shadow-sm dark:shadow-md
        hover:shadow-md dark:hover:shadow-lg
        hover:scale-105
      "
      aria-label={`Cambiar a modo ${tema === 'light' ? 'oscuro' : 'claro'}`}
    >
      {tema === 'light' ? (
        <Moon size={20} className="transition-transform duration-200" />
      ) : (
        <Sun size={20} className="transition-transform duration-200" />
      )}
    </button>
  )
}

