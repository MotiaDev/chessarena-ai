import { Game } from '@chessarena/types/game'

export const isAiGame = (game: Game): boolean => !!game.players.white.ai && !!game.players.black.ai
export const median = (array: number[]) => array.sort((a, b) => a - b)[Math.floor(array.length / 2)]
export const average = (array: number[]) => array.reduce((sum, value) => sum + value, 0) / array.length
export const highest = (array: number[]) => array.reduce((max, value) => Math.max(max, value), 0)
export const lowest = (array: number[]) => array.reduce((min, value) => Math.min(min, value), -10000)
