import type { Scoreboard as ScoreboardType } from '@/lib/types';
import React from 'react';

type ScoreTrendProps = {
  trend: string;
};

const ScoreTrend: React.FC<ScoreTrendProps> = ({ trend }) => {
  if (trend.match(/disadvantage/)) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      {trend}
    </span>
    )
  }

  if (trend.match(/advantage/)) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      {trend}
    </span>
    )
  }

  return null;
};

interface ScoreboardProps {
  scoreboard: ScoreboardType;
  className?: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ scoreboard, className = '' }) => {
  const renderPlayerCard = (player: ScoreboardType['white'], isWhite: boolean) => (
    <div className={`p-4 rounded-lg ${isWhite ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{player.name}</h3>
        <div className="text-2xl font-bold">{player.score}</div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="space-y-1">
          <div className="text-gray-500">Avg. Eval</div>
          <div className="font-mono">{player.averageEval.toFixed(2)}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-500">Avg. Swing</div>
          <div className="font-mono">{player.avgSwing.toFixed(2)}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-500">Final Eval</div>
          <div className="font-mono">{player.finalEval.toFixed(2)}</div>
        </div>
        <div className="space-y-1">
          <div className="text-gray-500">Trend</div>
          <ScoreTrend trend={player.trend} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="text-sm text-white font-bold mx-auto">
          {scoreboard.totalMoves} moves • {scoreboard.gameStatus}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {renderPlayerCard(scoreboard.white, true)}
        {renderPlayerCard(scoreboard.black, false)}
      </div>

      {scoreboard.decisiveMoment && (
        <div className="mt-4 p-4 bg-black/50 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Decisive Moment</h3>
          <p className="text-sm text-white">
            Biggest evaluation swing ({scoreboard.decisiveMoment.evalChange.toFixed(2)}) 
            occurred at move {scoreboard.decisiveMoment.moveNumber}
          </p>
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
