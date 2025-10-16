import React from 'react'
import type { Player } from '@chessarena/types/game'
import { AiIcon } from '../ai-icon'
import { ChessIcon } from '../chess-icon'

interface MatchupProps {
  white: Player
  black: Player
}

export const Matchup: React.FC<MatchupProps> = ({ white, black }) => (
  <div className="flex w-full rounded-md overflow-hidden relative">
    {/* White Side */}
    <div className="flex items-start gap-2 justify-start bg-white text-black px-4 py-3 w-48 relative flex-1">
      {white.ai && <AiIcon ai={white.ai} color="black" />}
      <div className="flex flex-col self-stretch">
        {white.ai && <span className="font-bold capitalize">{white.ai ?? 'White'}</span>}
        {white.model && <span className="grow text-xs text-gray-600">{white.model}</span>}
        <div className="flex gap-2 mt-2">
          <ChessIcon color="white" size={20} transparent />
          <span className="font-semibold">White</span>
        </div>
      </div>
    </div>

    <div className="flex items-start gap-2 justify-end bg-black text-white px-4 py-3 w-48 relative flex-1">
      <div className="flex flex-col self-stretch items-end">
        {black.ai && <span className="font-bold text-right capitalize">{black.ai ?? 'Black'}</span>}
        {black.model && <span className="grow text-xs text-gray-400 text-right">{black.model}</span>}
        <div className="flex gap-2 mt-2 text-right">
          <span className="font-semibold">Black</span>
          <ChessIcon color="black" size={20} transparent />
        </div>
      </div>
      {black.ai && <AiIcon ai={black.ai} color="white" />}
    </div>

    <div className="h-[30px] absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-gray-400/80 backdrop-blur-sm text-white font-medium px-3 rounded-md">
      vs
    </div>
  </div>
)
