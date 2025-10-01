import { useAuth } from '@/lib/auth/use-auth'
import { ChatBubbleAvatar } from '../ui/chat/chat-bubble'
import { Button } from '../ui/button'
import { Loader2, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router'

export const AuthContainer = () => {
  const {
    // user,
    isLoading,
    logout,
  } = useAuth()
  const navigate = useNavigate()
  // const user = undefined
  const user = {
    name: 'John Doe',
    profilePic: 'https://via.placeholder.com/150',
    email: 'john.doe@example.com',
  }

  if (user) {
    return (
      <div className="flex items-center justify-between w-full gap-2 rounded-xl backdrop-blur-lg bg-white/10 px-4 py-4 shadow-lg">
        <div className="flex items-center min-w-0 gap-3">
          <div className="w-10 h-10 shrink-0 rounded-full bg-black/50 flex items-center justify-center">
            <ChatBubbleAvatar color="white" fallback={user.name?.slice(0, 2).toUpperCase()} src={user.profilePic} />
          </div>
          <div className="min-w-0">
            <span className="block text-white font-medium text-lg truncate">{user.name}</span>
            <span className="block text-gray-400 text-sm truncate">{user.email}</span>
          </div>
        </div>

        <Button variant="outline" onClick={logout}>
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between w-full gap-2 rounded-xl backdrop-blur-lg bg-white/10 px-4 py-4 shadow-lg">
      <div className="flex items-center min-w-0 gap-3">
        <div className="p-3 rounded-full bg-white">
          <LogIn className="size-4 text-black" />
        </div>
        <div className="min-w-0">
          <span className="block text-white font-medium text-lg truncate">Sign In</span>
          <span className="block sm:hidden text-gray-400 text-sm truncate">Sign In to play</span>
          <span className="hidden sm:block text-gray-400 text-sm truncate">You need an account to play</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
