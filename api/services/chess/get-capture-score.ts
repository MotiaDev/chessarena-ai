import { PieceSymbol } from "chess.js";

export const getCaptureScore = (piece: PieceSymbol) => {
    switch (piece) {
        // Pawn
       case 'p':
           return 1
       // Knight
       case 'n':
           return 3
       // Bishop
       case 'b':
           return 3
       // Rook
       case 'r':
           return 5
       // Queen
       case 'q':
           return 9
       // King
       case 'k':
        // King should be priceless since it is the most important piece and capturing a king is considered the end of the game
           return 10000000
       default:
           return 0
    }
}


