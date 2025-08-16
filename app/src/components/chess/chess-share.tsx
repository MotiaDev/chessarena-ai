import { BaseButton } from '@/components/ui/base-button'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Share } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const ChessShare: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const onClick = () => {
    setIsOpen(false)

    navigator.clipboard.writeText(window.location.href)

    toast('Link copied to clipboard', {
      description: 'Share this link with your friends',
      position: 'bottom-center',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="h-8 w-8 md:h-12 md:w-12">
          <Share className="size-3 md:size-5" onClick={() => setIsOpen(true)} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl bg-gradient-to-b from-gray-900/20 to-black/80 border-none backdrop-blur-lg border-1 border-white/10 border-solid">
        <DialogHeader>
          <DialogTitle className="text-md font-semibold text-center">Share match</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 w-full">
          <BaseButton className="w-full" onClick={() => onClick()}>
            Invite to watch
          </BaseButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
