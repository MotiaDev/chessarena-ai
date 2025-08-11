import { Card } from '@/components/ui/card'
import type { Game } from '@chessarena/types/game'
import { useScrollIntoView } from '@/lib/use-scroll-into-view'
import { Info, Loader2 } from 'lucide-react'
import React from 'react'
import { Matchup } from './matchup'
import { ScoreboardRow } from './scoreboard-row'

interface ScoreboardProps {
  game: Game
}

const PlayerCard: React.FC<ScoreboardProps> = ({ game }) => {
  const scoreboard = game.scoreboard!

  return (
    <table className="w-full">
      <tbody>
        <ScoreboardRow
          white={scoreboard.white.averageCentipawnScore}
          label="Avg. Score"
          black={scoreboard.black.averageCentipawnScore}
        />
        <ScoreboardRow
          white={scoreboard.white.medianCentipawnScore}
          label="Median Score"
          black={scoreboard.black.medianCentipawnScore}
        />
        <ScoreboardRow white={scoreboard.white.medianSwing} label="Median Swing" black={scoreboard.black.medianSwing} />
        <ScoreboardRow
          white={scoreboard.white.highestSwing}
          label="Highest Swing"
          black={scoreboard.black.highestSwing}
        />
        <ScoreboardRow white={scoreboard.white.averageSwing} label="Avg. Swing" black={scoreboard.black.averageSwing} />
        <ScoreboardRow white={scoreboard.white.blunders} label="Blunders" black={scoreboard.black.blunders} />
        <ScoreboardRow
          size="lg"
          white={scoreboard.white.finalCentipawnScore}
          label="Final Score"
          black={scoreboard.black.finalCentipawnScore}
        />
      </tbody>
    </table>
  )
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ game }) => {
  const scoreboard = game.scoreboard
  const ref = useScrollIntoView()

  return (
    <Card className="bg-black/20 rounded-xl mt-4 p-0" ref={ref}>
      {scoreboard ? (
        <>
          <div className="p-4">
            {game.endGameReason === 'Checkmate' && (
              <div className="flex flex-col">
                <div className="text-2xl text-white font-bold mx-auto text-center w-full">Checkmate!</div>
                <div className="text-md mx-auto text-center w-full text-muted-foreground">
                  <span className="capitalize">{game.winner}</span> wins the match in {scoreboard.totalMoves} moves
                </div>
              </div>
            )}
            {game.endGameReason === 'Draw' && (
              <div className="flex flex-col">
                <div className="text-2xl text-white font-bold mx-auto text-center w-full">Draw</div>
                <div className="text-md mx-auto text-center w-full text-muted-foreground">
                  The match ended in a draw after {scoreboard.totalMoves} moves
                </div>
              </div>
            )}

            <div className="flex flex-col mt-3 gap-2">
              <div className="text-lg text-white font-bold mx-auto text-center w-full">Evaluation</div>

              <Matchup white={game.players.white} black={game.players.black} />

              <PlayerCard game={game} />
            </div>
          </div>

          {game.players.black.ai && game.players.white.ai && (
            <div className="text-sm flex items-start gap-2 mx-auto w-full text-muted-foreground bg-white/10 rounded-b-xl p-4">
              <Info className="w-12" />
              <span>
                LLMs can't really win games, which is why we're evaluating scores, number of blunders, etc.{' '}
                <a href="/about" className="text-white font-bold" target="_blank">
                  Click here
                </a>{' '}
                to learn more.
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="p-4">
          <div className="flex flex-col">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
            <div className="text-2xl text-white font-bold mx-auto text-center w-full my-2">Loading scoreboard...</div>
            <div className="text-md mx-auto text-center w-full text-muted-foreground">
              The scoreboard should be ready in a few seconds.
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export default Scoreboard
