import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground-secondary dark:text-foreground-secondary mb-2">
          {label}
        </label>
      )}
      <input
        className={`
          w-full
          px-4 py-2
          bg-background-secondary dark:bg-background-secondary
          border border-border dark:border-border
          rounded-lg
          text-foreground dark:text-foreground
          placeholder:text-foreground-muted dark:placeholder:text-foreground-muted
          focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent
          transition-all
          ${error ? 'border-red-500 dark:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}


