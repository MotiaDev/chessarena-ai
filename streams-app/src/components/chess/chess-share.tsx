import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { GameWithRole } from '@/lib/types'
import { Share } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CreateGameButton, CreateGameButtonAlt } from './create-game/create-game-button'

type Props = {
  game: GameWithRole
}

export const ChessShare: React.FC<Props> = ({ game }) => {
  const [isOpen, setIsOpen] = useState(false)

  const onClick = (color?: 'white' | 'black') => {
    setIsOpen(false)

    const password = color ? game.passwords?.[color] : undefined

    if (password) {
      navigator.clipboard.writeText(window.location.host + `?pw=${password}&game=${game.id}`)
    } else {
      navigator.clipboard.writeText(window.location.host + `?game=${game.id}`)
    }

    toast('Link copied to clipboard', {
      description: 'Share this link with your friends',
      position: 'bottom-center',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="h-12 w-12">
          <Share className="size-5" onClick={() => setIsOpen(true)} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl bg-gradient-to-b from-gray-900/20 to-black/80 border-none backdrop-blur-lg border-1 border-white/10 border-solid">
        <DialogHeader>
          <DialogTitle className="text-md font-semibold text-center">Share match</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 w-full">
          {game.passwords?.white && (
            <CreateGameButton className="flex-1" onClick={() => onClick('white')}>
              Invite to play as white
            </CreateGameButton>
          )}
          {game.passwords?.black && (
            <CreateGameButton className="flex-1" onClick={() => onClick('black')}>
              Invite to play as black
            </CreateGameButton>
          )}
          <CreateGameButtonAlt onClick={() => onClick()}>Invite to watch</CreateGameButtonAlt>
        </div>
      </DialogContent>
    </Dialog>
  )
}
