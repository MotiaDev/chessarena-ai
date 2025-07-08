import { GameEvaluation, PlayerAnalysis } from "../../steps/chess/streams/00-chess-leaderboard.stream";

export const analyzePlayerStrength = (gameEvaluations: GameEvaluation[]): PlayerAnalysis => {
  if (!gameEvaluations || gameEvaluations.length === 0) { 
    return {
      strength: 0,
      consistency: 0,
      trend: 0,
      reliability: 0,
      gamesAnalyzed: 0,
      whiteGames: 0,
      blackGames: 0
    };
  }

  // Sort games by timestamp if available, otherwise by array order
  const sortedEvaluations = [...gameEvaluations].sort((a, b) => 
    (a.timestamp || 0) - (b.timestamp || 0)
  );

  // Adjust evaluations based on player color
  // For white: positive is good, negative is bad
  // For black: negative is good, positive is bad
  const adjustedEvals = sortedEvaluations.map(game => {
    return game.color === 'white' 
      ? game.evaluation  // Keep as is for white
      : -game.evaluation; // Invert for black
  });

  // Count games by color
  const whiteGames = gameEvaluations.filter(g => g.color === 'white').length;
  const blackGames = gameEvaluations.length - whiteGames;

  // Calculate basic statistics
  const avg = adjustedEvals.reduce((a, b) => a + b, 0) / adjustedEvals.length;
  const squaredDiffs = adjustedEvals.map(val => Math.pow(val - avg, 2));
  const stdDev = Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / adjustedEvals.length);
  
  // Calculate trend using weighted average (more recent games have more weight)
  const weightedSum = adjustedEvals.reduce((sum, val, i) => sum + (val * (i + 1)), 0);
  const weightSum = (adjustedEvals.length * (adjustedEvals.length + 1)) / 2;
  const trend = weightSum > 0 ? weightedSum / weightSum : 0;

  // Calculate reliability (percentage of strong performances)
  const strongThreshold = 1.0; // Advantage of at least 1 pawn
  const strongGames = adjustedEvals.filter(e => e >= strongThreshold).length;
  const reliability = (strongGames / adjustedEvals.length) * 100;

  return {
    strength: avg,                // Higher is better
    consistency: 1 / (1 + stdDev), // Higher means more consistent
    trend,                 // Positive means improving
    reliability: reliability,     // Percentage of strong games
    gamesAnalyzed: adjustedEvals.length,
    whiteGames,
    blackGames
  };
}