import { Game, GameRole } from '@chessarena/types/game'

export const getGameRole = (game: Game, userId: string): GameRole => {
  if (!!userId && game.players.white.userId === userId) {
    return 'white'
  } else if (!!userId && game.players.black.userId === userId) {
    return 'black'
  }
  return 'spectator'
}
