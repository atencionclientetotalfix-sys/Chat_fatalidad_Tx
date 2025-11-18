import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`
        bg-background-secondary dark:bg-background-secondary
        border border-border dark:border-border
        rounded-lg
        p-6
        shadow-lg dark:shadow-xl
        shadow-primary/20 dark:shadow-primary/10
        border-primary/30 dark:border-primary/30
        transition-all
        duration-300
        hover:shadow-primary/30 dark:hover:shadow-primary/20
        hover:border-primary/50 dark:hover:border-primary/50
        ${className}
      `}
    >
      {children}
    </div>
  )
}


