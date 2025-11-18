import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primary' | 'secondary' | 'accent' | 'ghost'
  tamaño?: 'sm' | 'md' | 'lg'
  icono?: LucideIcon
  children: React.ReactNode
}

export function Button({
  variante = 'primary',
  tamaño = 'md',
  icono: Icono,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const variantes = {
    primary: 'bg-primary dark:bg-primary hover:bg-primary-hover dark:hover:bg-primary-hover text-white',
    secondary: 'bg-secondary dark:bg-secondary hover:bg-secondary-hover dark:hover:bg-secondary-hover text-white',
    accent: 'bg-accent dark:bg-accent hover:bg-accent-hover dark:hover:bg-accent-hover text-white',
    ghost: 'bg-transparent hover:bg-background-secondary dark:hover:bg-background-secondary text-foreground dark:text-foreground',
  }

  const tamanos = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`
        ${variantes[variante]}
        ${tamanos[tamaño]}
        rounded-lg
        font-medium
        transition-colors
        duration-200
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {Icono && <Icono size={20} />}
      {children}
    </button>
  )
}


