import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`
        bg-background-secondary
        border border-border
        rounded-lg
        p-6
        shadow-lg
        shadow-primary/20
        border-primary/30
        transition-all
        duration-300
        hover:shadow-primary/30
        hover:border-primary/50
        ${className}
      `}
    >
      {children}
    </div>
  )
}


