import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Role } from 'chessground/types'
import { PromotePiece } from './promote-piece'

type Props = {
  color: 'white' | 'black'
  isOpen: boolean
  onPromote: (piece: Role) => void
}

export const ChessPromote: React.FC<Props> = ({ color, isOpen, onPromote }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        className={cn(
          'rounded-2xl backdrop-blur-lg border-none outline-none',
          color === 'white' ? 'bg-black/50 text-white' : 'bg-white/50 text-black',
        )}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">Choose your piece</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 w-full items-center justify-between">
          <div className="flex flex-row gap-2">
            <PromotePiece color={color} piece="bishop" onPromote={onPromote} />
            <PromotePiece color={color} piece="knight" onPromote={onPromote} />
          </div>
          <div className="flex flex-row gap-2">
            <PromotePiece color={color} piece="rook" onPromote={onPromote} />
            <PromotePiece color={color} piece="queen" onPromote={onPromote} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
