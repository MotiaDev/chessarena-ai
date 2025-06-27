import { useCallback, useRef } from 'react'
import { Chess } from 'chess.js'

export const useChessInstance = () => {
  const ref = useRef<Chess | undefined>(undefined)

  const getInstance = useCallback(() => {
    if (!ref.current) {
      ref.current = new Chess()
    }
    return ref.current
  }, [])

  return {
    getInstance,
  }
}
