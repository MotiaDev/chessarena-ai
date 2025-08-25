import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { PublicUser } from '@chessarena/types/user'
import { ChatBubbleAvatar } from '../../ui/chat/chat-bubble'
import { useAcceptRequestAccess } from './hooks/use-accept-request-access'

type Props = {
  gameId: string
  user: PublicUser
  onCancel: () => void
}

export const ChessAccessRequest: React.FC<Props> = ({ gameId, user, onCancel }) => {
  const acceptRequestAccess = useAcceptRequestAccess()
  const onAccept = () => {
    acceptRequestAccess(gameId, user.id)
    onCancel()
  }

  return (
    <Card className="bg-black/20 rounded-xl mt-4 p-0">
      <div className="p-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex flex-col items-center justify-center gap-2">
            <ChatBubbleAvatar
              color={'white'}
              fallback={user.name?.slice(0, 2).toUpperCase()}
              src={user.profilePic}
              className="size-10 rounded-full"
            />
            <span className="text-2xl text-white font-bold mx-auto text-center w-full">{user.name}</span>
          </div>
          <div className="text-md mx-auto text-center w-full text-muted-foreground">
            {user.name} just requested access to play this game.
          </div>
          <div className="flex flex-row gap-2">
            <Button variant="outline" className="p-4" onClick={onAccept}>
              Accept
            </Button>
            <Button variant="destructive" className="p-4" onClick={onCancel}>
              Reject
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
