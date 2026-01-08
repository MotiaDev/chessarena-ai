import { spawn, ChildProcess } from 'child_process'
import { Chess } from 'chess.js'
import fs from 'fs'
import path from 'path'
import mustache from 'mustache'
import { Logger } from 'motia'
import { AiModelProvider } from '@chessarena/types/ai-models'
import { StockfishGameResult, StockfishGameMove } from '@chessarena/types/stockfish-benchmark'
import { makePrompt } from '../ai/make-prompt'

const promptTemplate = fs.readFileSync(path.join(__dirname, '../../steps/chess/05-ai-player.mustache'), 'utf8')

const MAX_MOVES = 200 // Max half-moves before declaring draw
const MAX_ILLEGAL_ATTEMPTS = 3

class StockfishEngine {
  private process: ChildProcess | null = null
  private ready = false
  private outputBuffer = ''

  async init(enginePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.process = spawn(enginePath)

      this.process.stdout?.on('data', (data) => {
        this.outputBuffer += data.toString()
      })

      this.process.stderr?.on('data', (data) => {
        console.error('Stockfish error:', data.toString())
      })

      this.process.on('error', reject)

      // Send UCI command and wait for uciok
      this.send('uci')
      this.waitFor('uciok', 5000)
        .then(() => {
          this.send('isready')
          this.waitFor('readyok', 5000).then(() => {
            this.ready = true
            resolve()
          })
        })
        .catch(reject)
    })
  }

  private send(command: string): void {
    this.process?.stdin?.write(command + '\n')
  }

  private async waitFor(text: string, timeout: number): Promise<string> {
    const start = Date.now()
    while (Date.now() - start < timeout) {
      if (this.outputBuffer.includes(text)) {
        const result = this.outputBuffer
        this.outputBuffer = ''
        return result
      }
      await new Promise((r) => setTimeout(r, 50))
    }
    throw new Error(`Timeout waiting for: ${text}`)
  }

  async setLevel(level: number): Promise<void> {
    // Level 1-20, affects skill level
    const skillLevel = Math.max(0, Math.min(20, level))
    this.send(`setoption name Skill Level value ${skillLevel}`)
    this.send('isready')
    await this.waitFor('readyok', 2000)
  }

  async getBestMove(fen: string, thinkTime: number = 1000): Promise<string> {
    this.outputBuffer = ''
    this.send(`position fen ${fen}`)
    this.send(`go movetime ${thinkTime}`)

    const output = await this.waitFor('bestmove', 30000)
    const match = output.match(/bestmove\s+(\S+)/)
    if (!match) throw new Error('Could not parse best move')
    return match[1]
  }

  async evaluate(fen: string): Promise<{ score: number; bestMove: string }> {
    this.outputBuffer = ''
    this.send(`position fen ${fen}`)
    this.send('go depth 15')

    const output = await this.waitFor('bestmove', 30000)

    // Parse score from info lines
    const scoreMatch = output.match(/score cp (-?\d+)/)
    const mateMatch = output.match(/score mate (-?\d+)/)
    const bestMoveMatch = output.match(/bestmove\s+(\S+)/)

    let score = 0
    if (mateMatch) {
      const mateIn = parseInt(mateMatch[1])
      score = mateIn > 0 ? 10000 - mateIn * 100 : -10000 - mateIn * 100
    } else if (scoreMatch) {
      score = parseInt(scoreMatch[1])
    }

    return {
      score,
      bestMove: bestMoveMatch ? bestMoveMatch[1] : '',
    }
  }

  async quit(): Promise<void> {
    this.send('quit')
    this.process?.kill()
    this.process = null
  }
}

/**
 * Play a single game against Stockfish
 */
export const playGameAgainstStockfish = async (
  provider: AiModelProvider,
  model: string,
  aiColor: 'white' | 'black',
  stockfishLevel: number,
  logger: Logger,
): Promise<StockfishGameResult> => {
  const gameId = crypto.randomUUID()
  const chess = new Chess()
  const moves: StockfishGameMove[] = []
  let totalCentipawnLoss = 0
  let aiMoveCount = 0
  let blunders = 0
  let mistakes = 0
  let inaccuracies = 0

  const result: StockfishGameResult = {
    id: gameId,
    createdAt: Date.now(),
    status: 'running',
    provider,
    model,
    aiColor,
    stockfishLevel,
    moves: [],
    totalMoves: 0,
  }

  const enginePath = process.env.STOCKFISH_BIN_PATH
  if (!enginePath) {
    result.status = 'failed'
    result.resultReason = 'STOCKFISH_BIN_PATH not set'
    return result
  }

  const engine = new StockfishEngine()

  try {
    logger.info(`Starting game: ${provider}/${model} as ${aiColor} vs Stockfish level ${stockfishLevel}`)
    await engine.init(enginePath)
    await engine.setLevel(stockfishLevel)

    let moveNumber = 0
    let illegalAttempts = 0

    while (!chess.isGameOver() && moveNumber < MAX_MOVES) {
      const currentPlayer = chess.turn() === 'w' ? 'white' : 'black'
      const isAiTurn = currentPlayer === aiColor
      const fenBefore = chess.fen()

      moveNumber++

      if (isAiTurn) {
        // AI's turn - get move from LLM
        const validMoves = chess.moves({ verbose: true })
        const templateData = {
          fenBefore,
          fen: fenBefore,
          inCheck: chess.isCheck(),
          player: currentPlayer,
          validMoves,
          totalMoves: validMoves.length,
        }

        const prompt = mustache.render(promptTemplate, templateData, {}, { escape: (v: string) => v })

        const startTime = Date.now()
        let moveSan: string | null = null
        let error: string | undefined

        try {
          const response = await makePrompt({
            prompt,
            provider,
            model,
            logger,
          })

          moveSan = response?.moveSan
        } catch (e) {
          error = e instanceof Error ? e.message : 'Unknown error'
        }

        const responseTime = Date.now() - startTime

        // Validate and play AI move
        if (moveSan) {
          try {
            // Get evaluation before the move
            const evalBefore = await engine.evaluate(fenBefore)

            chess.move(moveSan)
            const fenAfter = chess.fen()

            // Get evaluation after the move
            const evalAfter = await engine.evaluate(fenAfter)

            // Calculate centipawn loss (from AI's perspective)
            const scoreBefore = aiColor === 'white' ? evalBefore.score : -evalBefore.score
            const scoreAfter = aiColor === 'white' ? evalAfter.score : -evalAfter.score
            const centipawnLoss = Math.max(0, scoreBefore - scoreAfter)

            totalCentipawnLoss += centipawnLoss
            aiMoveCount++

            if (centipawnLoss > 100) blunders++
            else if (centipawnLoss > 50) mistakes++
            else if (centipawnLoss > 25) inaccuracies++

            moves.push({
              moveNumber,
              player: currentPlayer,
              moveSan,
              fen: fenAfter,
              centipawnScore: scoreAfter,
              bestMove: evalBefore.bestMove,
              centipawnLoss,
              isAiMove: true,
              responseTime,
            })

            illegalAttempts = 0
            logger.info(`  Move ${moveNumber}: ${moveSan} (CPL: ${centipawnLoss})`)
          } catch {
            // Illegal move
            illegalAttempts++
            logger.warn(`  Illegal move attempt ${illegalAttempts}: ${moveSan}`)

            if (illegalAttempts >= MAX_ILLEGAL_ATTEMPTS) {
              result.result = 'ai_illegal_move'
              result.resultReason = `Too many illegal moves (last: ${moveSan})`
              break
            }
            moveNumber-- // Retry
            continue
          }
        } else {
          // No move returned
          illegalAttempts++
          if (illegalAttempts >= MAX_ILLEGAL_ATTEMPTS) {
            result.result = 'ai_illegal_move'
            result.resultReason = 'AI failed to return valid move'
            break
          }
          moveNumber--
          continue
        }
      } else {
        // Stockfish's turn
        const uciMove = await engine.getBestMove(fenBefore, 500) // 500ms think time

        // Convert UCI to SAN
        const from = uciMove.slice(0, 2)
        const to = uciMove.slice(2, 4)
        const promotion = uciMove.length > 4 ? uciMove[4] : undefined

        const move = chess.move({ from, to, promotion })
        if (move) {
          moves.push({
            moveNumber,
            player: currentPlayer,
            moveSan: move.san,
            fen: chess.fen(),
            isAiMove: false,
          })
          logger.info(`  Move ${moveNumber}: ${move.san} (Stockfish)`)
        }
      }
    }

    // Determine result
    if (!result.result) {
      if (chess.isCheckmate()) {
        const winner = chess.turn() === 'w' ? 'black' : 'white'
        result.result = winner === aiColor ? 'ai_win' : 'stockfish_win'
        result.resultReason = 'Checkmate'
      } else if (chess.isDraw()) {
        result.result = 'draw'
        if (chess.isStalemate()) result.resultReason = 'Stalemate'
        else if (chess.isThreefoldRepetition()) result.resultReason = 'Threefold repetition'
        else if (chess.isInsufficientMaterial()) result.resultReason = 'Insufficient material'
        else result.resultReason = '50-move rule'
      } else if (moveNumber >= MAX_MOVES) {
        result.result = 'draw'
        result.resultReason = 'Max moves reached'
      }
    }

    result.moves = moves
    result.totalMoves = moves.length
    result.finalFen = chess.fen()
    result.pgn = chess.pgn()
    result.aiMoveCount = aiMoveCount
    result.totalCentipawnLoss = totalCentipawnLoss
    result.averageCentipawnLoss = aiMoveCount > 0 ? totalCentipawnLoss / aiMoveCount : 0
    result.blunders = blunders
    result.mistakes = mistakes
    result.inaccuracies = inaccuracies
    result.status = 'completed'
    result.completedAt = Date.now()

    logger.info(`Game completed: ${result.result} - ACPL: ${result.averageCentipawnLoss?.toFixed(1)}`)
  } catch (error) {
    result.status = 'failed'
    result.resultReason = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Game failed', { error })
  } finally {
    await engine.quit()
  }

  return result
}
