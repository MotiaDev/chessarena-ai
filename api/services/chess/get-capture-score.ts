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
       default:
           return 0
    }
}


