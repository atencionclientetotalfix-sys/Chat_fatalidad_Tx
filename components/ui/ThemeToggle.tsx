'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [tema, setTema] = useState<'light' | 'dark'>('light')
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    // Leer el tema guardado o la preferencia del sistema
    const temaGuardado = localStorage.getItem('tema') as 'light' | 'dark' | null
    const preferenciaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const temaInicial = temaGuardado || preferenciaSistema
    
    // Aplicar el tema inicial
    const root = document.documentElement
    if (temaInicial === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    setTema(temaInicial)
    setMontado(true)

    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const manejarCambio = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('tema')) {
        const nuevoTema = e.matches ? 'dark' : 'light'
        if (nuevoTema === 'dark') {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
        setTema(nuevoTema)
      }
    }
    
    mediaQuery.addEventListener('change', manejarCambio)
    return () => mediaQuery.removeEventListener('change', manejarCambio)
  }, [])

  const aplicarTema = (nuevoTema: 'light' | 'dark') => {
    const root = document.documentElement
    if (nuevoTema === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('tema', nuevoTema)
    setTema(nuevoTema)
  }

  const alternarTema = () => {
    const nuevoTema = tema === 'light' ? 'dark' : 'light'
    aplicarTema(nuevoTema)
  }

  // Evitar hidratación incorrecta
  if (!montado) {
    return (
      <button
        className="p-2 rounded-lg bg-background-tertiary text-foreground-secondary"
        aria-label="Cambiar tema"
        disabled
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
        focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-secondary
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

