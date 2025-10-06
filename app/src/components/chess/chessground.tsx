import React, { useEffect, useRef, useState } from 'react'
import { Chessground as ChessgroundApi } from '@lichess-org/chessground'
import type { Api } from '@lichess-org/chessground/api'
import type { Config } from '@lichess-org/chessground/config'

interface Props {
  config?: Config
}

export const Chessground: React.FC<Props> = ({ config = {} }) => {
  const [api, setApi] = useState<Api | null>(null)
  const ref = useRef<HTMLDivElement>(null)

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
  }, [ref, api, config])

  useEffect(() => {
    api?.set(config)
  }, [api, config])

  return (
    <div
      ref={ref}
      className="max-h-[600px] xl:max-h-[calc(100dvh-32px)] 2xl:max-h-[calc(100dvh-64px)] mx-auto aspect-square"
    />
  )
}
