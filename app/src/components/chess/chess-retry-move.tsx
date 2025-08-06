import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { RotateCcw } from 'lucide-react'
import { useState } from 'react'

export const ChessRetryMove = ({ onClick }: { onClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(true)

  const onRetryClick = () => {
    onClick();
    setIsOpen(false);
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn(
          'rounded-2xl backdrop-blur-lg border-none outline-none',
          'bg-black/50 text-white',
        )}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">Retry last move</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 w-full items-center justify-center">
          <p className="text-center">Oops! Something went wrong, would you like to retry the last move?</p>
          <Button
            data-testid="retry-move-button"
            variant="default"
            className="h-12 w-fit"
            onClick={onRetryClick}
          >
            <RotateCcw className="size-5" /> <span>Retry last move</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}