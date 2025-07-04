import chess
import chess.engine
import os
from typing import Dict, Any

config = {
    "type": "event",
    "name": "EvaluatePlayerMove",
    "description": "Evaluates the move picked by a player",
    "subscribes": ["evaluate-player-move"], 
    "emits": ["player-move-score"],
    "flows": ["chess"],
    "input": None
}

def normalize_score(score: chess.engine.Score, is_mate: bool) -> float:
    """Normalize score to a value between -1 and 1."""
    if is_mate:
        # For mate scores, map to range [-1, -0.8] or [0.8, 1] based on sign
        mate_in = abs(score.mate())
        normalized = 0.8 + (0.2 * (1.0 / mate_in))
        return normalized if score.mate() > 0 else -normalized
    else:
        # For centipawn scores, cap at +-1000 and normalize to [-1, 1]
        cp = score.score()
        return max(-1.0, min(1.0, cp / 1000.0))

async def evaluate_position(engine: chess.engine.SimpleEngine, board: chess.Board, 
                          time_limit: float = 1.0) -> Dict[str, Any]:
    """Evaluate a chess position and return analysis results."""
    info = await engine.analyse(
        board, 
        chess.engine.Limit(time=time_limit),
        info=chess.engine.INFO_ALL
    )
    
    score = info["score"].relative
    is_mate = score.is_mate()
    
    return {
        "score": score,
        "is_mate": is_mate,
        "normalized_score": normalize_score(score, is_mate),
        "best_move": info.get("pv", [None])[0],
        "depth": info.get("depth", 0),
        "nodes": info.get("nodes", 0),
        "nps": info.get("nps", 0)
    }

async def handler(input, ctx):
    ctx.logger.info('[EvaluatePlayerMove] Received event', input)

    # Get FEN strings from input
    fen_before = input.get('fenBefore')
    fen_after = input.get('fenAfter')
    
    if not fen_before or not fen_after:
        raise ValueError("Both fenBefore and fenAfter must be provided")

    # Initialize Stockfish engine
    engine_path = os.getenv("STOCKFISH_PATH")
    if not engine_path:
        ctx.logger.error('STOCKFISH_PATH environment variable not set')
        raise EnvironmentError("STOCKFISH_PATH environment variable not set")
    
    _, engine = await chess.engine.popen_uci(engine_path)
    
    try:
        # Create boards from the positions
        board_before = chess.Board(fen_before)
        
        # Find the move that was made
        move = None
        for m in board_before.legal_moves:
            board_before.push(m)
            if board_before.fen() == fen_after:
                move = m
                board_before.pop()
                break
            board_before.pop()
            
        if not move:
            raise ValueError("Could not determine the move between the provided FENs")
        
        # Evaluate position before the move
        eval_before = await evaluate_position(engine, board_before)
        
        # Make the move and evaluate after
        board_before.push(move)
        eval_after = await evaluate_position(engine, board_before)
        
        # Calculate move quality (improvement in position)
        move_quality = eval_after["normalized_score"] - eval_before["normalized_score"]
        
        # Calculate move accuracy (0-100 scale)
        if eval_before["best_move"] and move == eval_before["best_move"]:
            accuracy = 100.0  # Best move
        else:
            # Scale accuracy based on how close the move is to the best move's evaluation
            best_move_eval = await evaluate_position(engine, board_before)
            accuracy = max(0, min(100, 50 + (move_quality * 50)))
        
        ctx.logger.info(f"Move {move.uci()}: Score {eval_after['normalized_score']:.2f}, "
                       f"Quality: {move_quality:.2f}, Accuracy: {accuracy:.1f}%")
        
        # Emit the results
        result = {
            "topic": "player-move-score",
            "data": {
                "evaluation": eval_after["normalized_score"],
                # NOTE: This is the evaluation in centipawns
                "evaluationCp": None if eval_after["is_mate"] else eval_after["score"].score(),
                "isMate": eval_after["is_mate"],
                "mateIn": eval_after["score"].mate() if eval_after["is_mate"] else None,
                "bestMove": eval_after["best_move"].uci() if eval_after["best_move"] else None,
                "movePlayed": move.uci(),
                "moveQuality": move_quality,
                "moveAccuracy": accuracy,
                "gameId": input.get("gameId"),
                "moveId": input.get("moveId"),
                "color": "white" if board_before.turn == chess.BLACK else "black"
            }
        }
        
        await ctx.emit(result)
    finally:
        await engine.quit()
