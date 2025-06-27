import type React from 'react'

type PromoteRole = 'queen' | 'rook' | 'bishop' | 'knight'
type Props = {
  color: 'white' | 'black'
  piece: PromoteRole
  onPromote: (piece: PromoteRole) => void
}

const whitePieces = {
  queen: { name: 'Queen', image: '/chess/pieces/wQ.png' },
  rook: { name: 'Rook', image: '/chess/pieces/wR.png' },
  bishop: { name: 'Bishop', image: '/chess/pieces/wB.png' },
  knight: { name: 'Knight', image: '/chess/pieces/wN.png' },
}

const blackPieces = {
  queen: { name: 'Queen', image: '/chess/pieces/bQ.png' },
  rook: { name: 'Rook', image: '/chess/pieces/bR.png' },
  bishop: { name: 'Bishop', image: '/chess/pieces/bB.png' },
  knight: { name: 'Knight', image: '/chess/pieces/bN.png' },
}

export const PromotePiece: React.FC<Props> = ({ color, piece, onPromote }) => {
  const pieces = color === 'white' ? whitePieces : blackPieces
  const pieceObject = pieces[piece]

  return (
    <div
      className="flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 rounded-lg py-2 px-4"
      onClick={() => onPromote(piece)}
    >
      <img src={pieceObject.image} alt={pieceObject.name} className="w-24 h-24" />
      <p className="text-sm font-semibold">{pieceObject.name}</p>
    </div>
  )
}
