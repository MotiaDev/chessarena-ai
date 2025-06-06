import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import type { GameWithRole } from '@/lib/types'
import { Eye } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '../ui/button'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: GameWithRole
}

export const ChessShare: React.FC<Props> = ({ open, onOpenChange, game }) => {
  const onClick = (color?: 'white' | 'black') => {
    onOpenChange(false)

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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share Game</DrawerTitle>
          {game.role === 'root' ? (
            <DrawerDescription>How do you want your friends to interact?</DrawerDescription>
          ) : (
            <DrawerDescription>Share this game with your friends</DrawerDescription>
          )}
        </DrawerHeader>
        <div className="flex flex-col gap-2 w-full p-4">
          <div className="flex flex-row gap-2 items-center justify-center w-full">
            {game.passwords?.white && (
              <Button variant="default" className="flex-1" onClick={() => onClick('white')}>
                Play as White (You)
              </Button>
            )}
            {game.passwords?.black && (
              <Button variant="outline" className="flex-1" onClick={() => onClick('black')}>
                Play as Black
              </Button>
            )}
          </div>
          <Button variant="secondary" onClick={() => onClick()}>
            <Eye /> Watch
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
