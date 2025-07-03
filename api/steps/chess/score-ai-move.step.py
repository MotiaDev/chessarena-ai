import chess
import chess.engine
import os
# from dotenv import load_dotenv

# load_dotenv(dotenv_path="../../.env")

config = {
    "type": "event",
    "name": "score-ai-move",
    "description": "Evaluates the move picked by an ai model",
    "subscribes": ["ai-move-result"], 
    "emits": ["ai-move-scored"],
    "flows": ["chess"],
    "input": None
}

async def handler(args, ctx):
    ctx.logger.info('Processing score-ai-move', args)

    # Get FEN strings from input
    fen_before = args.get('fenBefore')
    fen_after = args.get('fenAfter')
    
    if not fen_before or not fen_after:
        raise ValueError("Both fenBefore and fenAfter must be provided")

    # Initialize Stockfish engine
    engine_path = "/opt/homebrew/bin/stockfish"
    # engine_path = os.getenv("STOCKFISH_PATH")
    # if not engine_path:
    #     raise EnvironmentError("STOCKFISH_PATH environment variable not set")
        
    engine = chess.engine.SimpleEngine.popen_uci(engine_path)

    try:
        # Create board from the position before the move
        board = chess.Board(args.fenBefore)
        
        # Get the move that was made by comparing the two FENs
        temp_board = chess.Board(args.fenAfter)
        move = None
        
        # Find the move that transforms fen_before into fen_after
        for m in board.legal_moves:
            board.push(m)
            if board.fen() == fen_after:
                move = m
                board.pop()
                break
            board.pop()
            
        if not move:
            raise ValueError("Could not determine the move between the provided FENs")
            
        # Apply the move to the board
        board.push(move)
        
        # Analyze the position after the move
        info = engine.analyse(board, chess.engine.Limit(time=1.0))
        evaluation = info["score"].relative.cp
        
        ctx.logger.info(f"Evaluation after the move: {evaluation}")
        
        ctx.emit({
            "topic": "ai-move-scored",
            "data": {
                "evaluation": evaluation,
                "isMate": info["score"].is_mate(),
                "bestMove": info.get("pv", [move])[0].uci() if info.get("pv") else None,
                "gameId": args.gameId,
                "moveId": args.moveId
            }
        })
    finally:
        engine.quit()
