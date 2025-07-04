import { Game, PlayerScore, Scoreboard } from "steps/chess/streams/00-chess-game.stream"
import { GameMove } from "steps/chess/streams/00-chess-game-move.stream"

const INITIAL_SCORE = {
  averageEvaluation: 0,
  evaluationSwings: 0,
  finalPositionEvaluation: 0,
  overallTrend: 0,
}

export const generateGameScore = async (game: Game, moves: GameMove[]): Promise<{whiteScore: PlayerScore, blackScore: PlayerScore, scoreboard?: Scoreboard}> => {
  if (moves.length === 0) {
    return {
      whiteScore: { ...INITIAL_SCORE },
      blackScore: { ...INITIAL_SCORE },
    };
  }

  // Arrays to store evaluations and swings
  const evaluations: number[] = [];
  const swings: number[] = [];
  let previousEval: number | null = null;
  
  // Track position advantages for trend analysis
  let whiteAdvantageCount = 0;
  let blackAdvantageCount = 0;
  let equalPositionCount = 0;

  // Process each move to collect evaluations
  moves.forEach((move, index) => {
    const { evaluation } = move;
    if (!evaluation) return;

    const currentEval = evaluation.evaluation;
    evaluations.push(currentEval);

    // Calculate evaluation swing from previous move
    if (previousEval !== null) {
      swings.push(Math.abs(currentEval - previousEval));
    }
    previousEval = currentEval;

    // Track position advantage for trend analysis
    if (currentEval > 0.5) whiteAdvantageCount++;
    else if (currentEval < -0.5) blackAdvantageCount++;
    else equalPositionCount++;
  });

  // Calculate average evaluation
  const averageEval = evaluations.length > 0 
    ? evaluations.reduce((sum, node) => sum + node, 0) / evaluations.length 
    : 0;

  // Calculate average swing
  const averageSwing = swings.length > 0 
    ? swings.reduce((sum, swing) => sum + swing, 0) / swings.length 
    : 0;

  // Determine overall trend
  let trend = 0; // 0 = neutral, positive = white advantage, negative = black advantage
  if (evaluations.length > 0) {
    const lastFewMoves = evaluations.slice(-5); // Consider last 5 moves for trend
    const lastEval = lastFewMoves[lastFewMoves.length - 1];
    
    if (lastEval > 0.5) trend = 1; // White advantage
    else if (lastEval < -0.5) trend = -1; // Black advantage
    
    // If the trend isn't clear from the last position, check the overall game
    if (trend === 0) {
      if (whiteAdvantageCount > blackAdvantageCount * 1.5) trend = 0.5;
      else if (blackAdvantageCount > whiteAdvantageCount * 1.5) trend = -0.5;
    }
  }

  // Get final position evaluation
  const finalEval = evaluations.length > 0 ? evaluations[evaluations.length - 1] : 0;

  const scores = {
    whiteScore: {
      ...INITIAL_SCORE,
      averageEvaluation: averageEval,
      evaluationSwings: averageSwing,
      finalPositionEvaluation: finalEval,
      overallTrend: trend,
    },
    blackScore: {
      ...INITIAL_SCORE,
      averageEvaluation: -averageEval, // Invert for black's perspective
      evaluationSwings: averageSwing,  // Same swings for both players
      finalPositionEvaluation: -finalEval, // Invert for black's perspective
      overallTrend: -trend, // Invert trend for black
    }
  };

  return {
    ...scores,
    scoreboard: generateScoreboard(game, scores, moves),
  }
};

export const generateScoreboard = (
  game: Game,
  scores: {
    whiteScore: {
      averageEvaluation: number;
      evaluationSwings: number;
      finalPositionEvaluation: number;
      overallTrend: number;
    };
    blackScore: {
      averageEvaluation: number;
      evaluationSwings: number;
      finalPositionEvaluation: number;
      overallTrend: number;
    };
  },
  moves: GameMove[]
): Scoreboard => {
  const getTrendLabel = (trend: number): string => {
    if (trend > 0.5) return 'Strong advantage';
    if (trend > 0) return 'Slight advantage';
    if (trend < -0.5) return 'Strong disadvantage';
    if (trend < 0) return 'Slight disadvantage';
    return 'Balanced';
  };

  // Find the most decisive moment (biggest evaluation swing)
  let decisiveMoment = null;
  if (moves.length > 1) {
    let maxSwing = 0;
    let moveIndex = 0;
    
    for (let i = 1; i < moves.length; i++) {
      if (!moves[i].evaluation || !moves[i - 1].evaluation) continue;
      
      const swing = Math.abs(moves[i].evaluation!.evaluation - moves[i - 1].evaluation!.evaluation);
      if (swing > maxSwing) {
        maxSwing = swing;
        moveIndex = i;
      }
    }

    if (maxSwing > 0.5) {  // Only include if there was a significant swing
      decisiveMoment = {
        moveNumber: Math.ceil((moveIndex + 1) / 2), // Convert to full move number
        evalChange: maxSwing,
        fen: moves[moveIndex]?.fen || ''
      };
    }
  }

  return {
    white: {
      name: game.players.white.name,
      score: scores.whiteScore.finalPositionEvaluation > 0 ? 1 : 0,
      averageEval: scores.whiteScore.averageEvaluation,
      avgSwing: scores.whiteScore.evaluationSwings,
      finalEval: scores.whiteScore.finalPositionEvaluation,
      trend: getTrendLabel(scores.whiteScore.overallTrend)
    },
    black: {
      name: game.players.black.name,
      score: scores.blackScore.finalPositionEvaluation > 0 ? 1 : 0,
      averageEval: scores.blackScore.averageEvaluation,
      avgSwing: scores.blackScore.evaluationSwings,
      finalEval: scores.blackScore.finalPositionEvaluation,
      trend: getTrendLabel(scores.blackScore.overallTrend)
    },
    gameStatus: game.status === 'completed' 
      ? game.winner 
        ? `Checkmate - ${game.winner} wins` 
        : 'Game completed'
      : 'In progress',
    totalMoves: moves.length,
    ...(decisiveMoment && { decisiveMoment })
  };
};