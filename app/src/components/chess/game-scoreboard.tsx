import type { Game, Scoreboard as ScoreboardType } from '@/lib/types'
import { useScrollIntoView } from '@/lib/use-scroll-into-view'
import type { Key } from 'chessground/types'
import React from 'react'
import { Card } from '../ui/card'
import { ChessIcon } from './chess-icon'
import { ChessMove } from './chess-state'

interface ScoreboardProps {
  scoreboard: ScoreboardType
  game: Game
}

const PlayerCard: React.FC<{ scoreboard: ScoreboardType }> = ({ scoreboard }) => {
  return (
    <Card className="bg-black/20 rounded-md">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left font-bold">Evaluation</th>
            <th className="text-right">
              <ChessIcon size={20} color="white" style={{ float: 'right' }} />
            </th>
            <th className="text-right">
              <ChessIcon size={20} color="black" style={{ float: 'right' }} />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-white/50">Avg. Score</td>
            <td className="text-right">{scoreboard.white.averageCentipawnScore}</td>
            <td className="text-right font-bold">{scoreboard.black.averageCentipawnScore}</td>
          </tr>
          <tr>
            <td className="text-white/50">Median Score</td>
            <td className="text-right">{scoreboard.white.medianCentipawnScore}</td>
            <td className="text-right font-bold">{scoreboard.black.medianCentipawnScore}</td>
          </tr>
          <tr>
            <td className="text-white/50">Median Swing</td>
            <td className="text-right">{scoreboard.white.medianSwing}</td>
            <td className="text-right font-bold">{scoreboard.black.medianSwing}</td>
          </tr>
          <tr>
            <td className="text-white/50">Highest Swing</td>
            <td className="text-right">{scoreboard.white.highestSwing}</td>
            <td className="text-right font-bold">{scoreboard.black.highestSwing}</td>
          </tr>
          <tr>
            <td className="text-white/50">Avg. Swing</td>
            <td className="text-right">{scoreboard.white.averageSwing}</td>
            <td className="text-right font-bold">{scoreboard.black.averageSwing}</td>
          </tr>
          <tr>
            <td className="text-white/50">Final Score</td>
            <td className="text-right">{scoreboard.white.finalCentipawnScore}</td>
            <td className="text-right font-bold">{scoreboard.black.finalCentipawnScore}</td>
          </tr>
          <tr>
            <td className="text-white/50">Blunders</td>
            <td className="text-right">{scoreboard.white.blunders}</td>
            <td className="text-right font-bold">{scoreboard.black.blunders}</td>
          </tr>
        </tbody>
      </table>
    </Card>
  )
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ scoreboard, game }) => {
  const ref = useScrollIntoView(!!scoreboard.decisiveMoment)

  return (
    <Card className="bg-black/20 rounded-xl mt-4" ref={ref}>
      <div className="flex flex-col gap-4">
        <div className="text-sm text-white font-bold mx-auto text-center w-full">
          {scoreboard.totalMoves} moves • {game.endGameReason}
        </div>

        <PlayerCard scoreboard={scoreboard} />

        {scoreboard.decisiveMoment && (
          <Card className="bg-black/20 rounded-md">
            <h3 className="font-semibold mb-2">Decisive Moment</h3>
            <p className="text-sm text-white/70 mb-2">
              Biggest evaluation swing ({scoreboard.decisiveMoment.evaluationSwing}) occurred at move{' '}
              {scoreboard.decisiveMoment.moveNumber}
            </p>
            <div className="min-h-[300px]">
              {scoreboard.decisiveMoment && (
                <ChessMove fen={scoreboard.decisiveMoment.fen} lastMove={scoreboard.decisiveMoment.move as Key[]} />
              )}
            </div>
          </Card>
        )}
      </div>
    </Card>
  )
}

export default Scoreboard
