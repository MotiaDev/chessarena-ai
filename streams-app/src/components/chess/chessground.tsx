import { Chessground as ChessgroundApi } from 'chessground'
import type { Api } from 'chessground/api'
import type { Config } from 'chessground/config'
import React, { useEffect, useRef, useState } from 'react'

interface Props {
  config?: Config
}

export const Chessground: React.FC<Props> = ({ config = {} }) => {
  const [api, setApi] = useState<Api | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<number>()

  useEffect(() => {
    const parent = rootRef.current?.parentElement

    if (parent) {
      const handleResize = () => {
        const width = parent.clientWidth
        const height = parent.clientHeight

        setSize(width > height ? height : width)
      }

      window.addEventListener('resize', handleResize)
      handleResize()

      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (ref && ref.current && !api) {
      const chessgroundApi = ChessgroundApi(ref.current, {
        animation: { enabled: true, duration: 200 },
        ...config,
      })

      setApi(chessgroundApi)
    } else if (ref && ref.current && api) {
      api.set(config)
    }
  }, [ref])

  useEffect(() => {
    api?.set(config)
  }, [api, config])

  return (
    <div ref={rootRef} className="w-full h-full" style={{ width: size, height: size }}>
      <div ref={ref} className="w-full h-full table" />
    </div>
  )
}
