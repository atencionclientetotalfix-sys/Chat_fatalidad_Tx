'use client'

import { User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface UserProfileProps {
  email: string
  nombre?: string | null
}

export function UserProfile({ email, nombre }: UserProfileProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {nombre || email.split('@')[0]}
          </p>
          <p className="text-xs text-foreground-secondary truncate">{email}</p>
        </div>
      </div>
      <Button
        variante="ghost"
        tamaño="sm"
        className="w-full justify-start"
        onClick={handleLogout}
      >
        <LogOut size={16} />
        Cerrar sesión
      </Button>
    </div>
  )
}


