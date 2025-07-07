import { FlowContextStateStreams } from "motia";
import { Game, Scoreboard } from "../../steps/chess/streams/00-chess-game.stream";
import { models } from "../ai/models";
import { analyzePlayerStrength } from "./analyze-player-strength";
import { Leaderboard } from "../../steps/chess/streams/00-chess-leaderboard.stream";

type Options = {
  skipAnalysis?: boolean
}

export const updateLeaderboard = async (game: Game, leaderboards: Record<string, Leaderboard>, scoreboard?: Scoreboard, options?: Options) => {
  // NOTE: board is limited just for AI player for now
  if (!game.players.white.ai || !game.players.black.ai) {
    return leaderboards
  }
  
  const rankingWhite = leaderboards[game.players.white.ai] ?? {}
  const rankingBlack = leaderboards[game.players.black.ai] ?? {}

  const whiteGamesPlayed = rankingWhite?.gamesPlayed ?? 0
  const blackGamesPlayed = rankingBlack?.gamesPlayed ?? 0
  const whiteWins = rankingWhite?.wins ?? 0
  const blackWins = rankingBlack?.wins ?? 0
  const whiteDraws = rankingWhite?.draws ?? 0
  const blackDraws = rankingBlack?.draws ?? 0

  const whiteIllegalMoves = rankingWhite?.illegalMoves ?? 0
  const blackIllegalMoves = rankingBlack?.illegalMoves ?? 0

  const whiteModel = models[game.players.white.ai]
  const blackModel = models[game.players.black.ai]

  const whiteEvaluation = scoreboard?.white.averageEval ? {evaluation: scoreboard.white.averageEval!, color: 'white', timestamp: Date.now()} : undefined;
  const whiteAverageEvals = [...(rankingWhite?.averageEvals ?? []), ...(whiteEvaluation ? [whiteEvaluation] : [])];

  const blackEvaluation = scoreboard?.black.averageEval ? {evaluation: scoreboard.black.averageEval!, color: 'black', timestamp: Date.now()} : undefined;
  const blackAverageEvals = [...(rankingBlack?.averageEvals ?? []), ...(blackEvaluation ? [blackEvaluation] : [])];

  return {
    ...leaderboards,
    [game.players.white.ai]: {
      ...rankingWhite,
      provider: game.players.white.ai,
      model: whiteModel,
      gamesPlayed: whiteGamesPlayed + 1,
      wins: whiteWins + (game.winner === 'white' ? 1 : 0),
      draws: whiteDraws + (game.status === 'draw' ? 1 : 0),
      illegalMoves: whiteIllegalMoves + (game.players.white.illegalMoveAttempts ?? 0),
      averageEvals: whiteAverageEvals,
      analysis: options?.skipAnalysis ? rankingWhite?.analysis : analyzePlayerStrength(whiteAverageEvals)
    },
    [game.players.black.ai]: {
      ...rankingBlack,
      provider: game.players.black.ai,
      model: blackModel,
      gamesPlayed: blackGamesPlayed + 1,
      wins: blackWins + (game.winner === 'black' ? 1 : 0),
      draws: blackDraws + (game.status === 'draw' ? 1 : 0),
      illegalMoves: blackIllegalMoves + (game.players.black.illegalMoveAttempts ?? 0),
      averageEvals: blackAverageEvals,
      analysis: options?.skipAnalysis ? rankingBlack?.analysis : analyzePlayerStrength(blackAverageEvals)
    }
  }
}
