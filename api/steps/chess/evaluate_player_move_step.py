import os
from typing import Any, Literal

import chess
import chess.engine
from motia import FlowContext, Stream, queue
from pydantic import BaseModel, Field

chess_game_move_stream: Stream[dict[str, Any]] = Stream("chessGameMove")


class EvaluatePlayerMoveInput(BaseModel):
    fenBefore: str = Field(description="The FEN of the game before the move")
    fenAfter: str = Field(description="The FEN of the game after the move")
    gameId: str = Field(description="The ID of the game")
    moveId: str = Field(description="The ID of the move")
    player: Literal["white", "black"] = Field(description="The player who made the move")


config = {
    "name": "EvaluatePlayerMove",
    "description": "Evaluates the move picked by a player",
    "flows": ["chess"],
    "triggers": [queue("evaluate-player-move", input=EvaluatePlayerMoveInput.model_json_schema())],
    "enqueues": [],
    "includeFiles": ["../../lib/stockfish"],
}


class Evaluation(BaseModel):
    centipawn_score: int = Field(description="The evaluation in centipawns")
    best_move: str | None = Field(description="The best move")


def compute_evaluation_swing(best_move_cp: int, played_move_cp: int) -> int:
    return max(0, best_move_cp - played_move_cp)


def is_blunder(evaluation_swing: int) -> bool:
    return evaluation_swing > 100


async def evaluate_position(
    engine: chess.engine.SimpleEngine, board: chess.Board, player: Literal["white", "black"], time_limit: float = 1.5
) -> Evaluation:
    analysis = await engine.analyse(board, chess.engine.Limit(time=time_limit), info=chess.engine.INFO_ALL)
    score = analysis["score"]
    centipawn_score = score.white().score() if player == "white" else score.black().score()
    move = analysis.get("pv", [None])[0]

    return Evaluation(
        centipawn_score=centipawn_score if centipawn_score is not None else 0,
        best_move=move.uci() if move is not None else None,
    )


async def handler(input_data: dict[str, Any], ctx: FlowContext[Any]) -> None:
    logger = ctx.logger
    payload = EvaluatePlayerMoveInput.model_validate(input_data)
    logger.info("Received evaluate-player-move event", payload.model_dump())

    engine_path = os.getenv("STOCKFISH_BIN_PATH")
    if not engine_path:
        logger.error("STOCKFISH_BIN_PATH environment variable not set")
        raise EnvironmentError("STOCKFISH_BIN_PATH environment variable not set")

    logger.info("Initializing Stockfish engine", {"enginePath": engine_path})
    _, engine = await chess.engine.popen_uci(engine_path)
    logger.info("Stockfish engine initialized")

    try:
        board_before = chess.Board(payload.fenBefore)
        board_after = chess.Board(payload.fenAfter)

        eval_before = await evaluate_position(engine, board_before, payload.player)
        eval_after = await evaluate_position(engine, board_after, payload.player)

        if eval_before.best_move is None:
            raise ValueError("Unable to determine best move from analysis")

        best_move = chess.Move.from_uci(eval_before.best_move)
        board_before.push(best_move)
        eval_best_move = await evaluate_position(engine, board_before, payload.player)

        evaluation_swing = compute_evaluation_swing(eval_best_move.centipawn_score, eval_after.centipawn_score)
        evaluation = {
            "centipawnScore": eval_after.centipawn_score,
            "bestMove": eval_before.best_move,
            "evaluationSwing": evaluation_swing,
            "blunder": is_blunder(evaluation_swing),
        }

        logger.info("Move evaluation results", {"evaluation": evaluation})

        move_stream = await chess_game_move_stream.get(payload.gameId, payload.moveId)
        if not move_stream:
            logger.error("Move not found", {"moveId": payload.moveId})
            raise ValueError("Move not found")

        move_stream["evaluation"] = evaluation
        await chess_game_move_stream.set(payload.gameId, payload.moveId, move_stream)
        logger.info("Game move updated with evaluation", {"moveId": payload.moveId})
    except Exception as exc:
        logger.error("Error evaluating move", {"error": str(exc)})
        raise
    finally:
        await engine.quit()
