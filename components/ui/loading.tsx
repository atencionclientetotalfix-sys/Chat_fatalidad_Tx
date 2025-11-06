import { Loader2 } from 'lucide-react'

export function Loading({ tamaño = 'md' }: { tamaño?: 'sm' | 'md' | 'lg' }) {
  const tamanos = {
    sm: 16,
    md: 24,
    lg: 32,
  }

  return (
    <div className="flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={tamanos[tamaño]} />
    </div>
  )
}


