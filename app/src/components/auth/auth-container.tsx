import { useAuth } from '@/lib/auth/use-auth'
import { ChatBubbleAvatar } from '../ui/chat/chat-bubble'
import { Button } from '../ui/button'
import { Loader2, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router'

export const AuthContainer = () => {
  const { user, isLoading, logout } = useAuth()
  const navigate = useNavigate()

  if (user) {
    return (
      <div className="flex items-center justify-between w-[400px] max-w-full rounded-xl backdrop-blur-lg bg-white/10 px-4 py-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
            <ChatBubbleAvatar color={'white'} fallback={user.name?.slice(0, 2).toUpperCase()} src={user.profilePic} />
          </div>
          <div>
            <div className="text-white font-medium text-lg ellipsis-1">{user.name}</div>
            <div className="text-gray-400 text-sm ellipsis-1">{user.email}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between w-[400px] rounded-xl backdrop-blur-lg bg-white/10 px-4 py-2 shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <LogIn className="size-4 text-black" />
        </div>
        <div>
          <div className="text-white font-medium text-lg">Sign In</div>
          <div className="text-gray-400 text-sm">You need an account to play</div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {isLoading ? (
          <Button variant="outline">
            <Loader2 className="size-4 animate-spin" />
          </Button>
        ) : (
          <Button variant="outline" onClick={() => navigate('/login')}>
            Log in
          </Button>
        )}
      </div>
    </div>
  )
}
