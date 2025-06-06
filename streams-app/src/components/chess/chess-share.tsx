import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Eye } from 'lucide-react'
import { Button } from '../ui/button'
import type { GameWithRole } from './types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  game: GameWithRole
}

export const ChessShare: React.FC<Props> = ({ open, onOpenChange, game }) => {
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
              <Button variant="default" className="flex-1">
                Play as White (You)
              </Button>
            )}
            {game.passwords?.black && (
              <Button variant="outline" className="flex-1">
                Play as Black
              </Button>
            )}
          </div>
          <Button variant="secondary">
            <Eye /> Watch
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
