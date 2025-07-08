import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { Share } from "lucide-react"
import type { Game, Scoreboard as ScoreboardType } from '@/lib/types'
import { Scoreboard } from "./game-scoreboard.tsx"

type Props = {
  game: Game
}

export const CompletedGameDialog: React.FC<Props> = ({ game }) => {
  const [scoreboard, setScoreboard] = useState<ScoreboardType | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    if (['completed', 'draw'].includes(game.status) && !!game?.scoreboard) {
      setIsOpen(true);
      setScoreboard(game.scoreboard);
    }
  }, [game])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="h-12 w-12">
          <Share className="size-5" onClick={() => setIsOpen(true)} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px] rounded-2xl bg-gradient-to-b from-gray-900/20 to-black/80 backdrop-blur-lg border-none">
        <DialogHeader>
          <DialogTitle className="text-md font-semibold text-center"><span className="text-xl font-bold">Game Scoreboard</span></DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 w-full">
          {scoreboard && <Scoreboard scoreboard={scoreboard} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}