import { BaseButton } from '@/components/ui/base-button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/auth/use-auth'
import { useNavigate } from 'react-router'
import { useRequestAccess } from './hooks/use-request-access'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export const ChessRequestAccess: React.FC<{ gameId: string }> = ({ gameId }) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const login = () => {
    navigate(`/login?redirect=/game/${gameId}`)
  }
  const [isRequestingAccess, setIsRequestingAccess] = useState(false)
  const requestAccess = useRequestAccess()
  const onRequestAccess = () => {
    setIsRequestingAccess(true)
    requestAccess(gameId).catch(() => void 0)
  }

  return (
    <Card className="bg-black/20 rounded-xl mt-4 p-0">
      <div className="p-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="text-2xl text-white font-bold mx-auto text-center w-full">Request acesss</div>
          <div className="text-md mx-auto text-center w-full text-muted-foreground">
            You're currently spectating this game. Request access to play.
          </div>
          <div>
            {isRequestingAccess ? (
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
            ) : isAuthenticated ? (
              <BaseButton className="p-4" onClick={onRequestAccess}>
                Request access
              </BaseButton>
            ) : (
              <BaseButton className="p-4" onClick={login}>
                Sign in to request access
              </BaseButton>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
