import { useDeviceWidth } from '@/lib/use-device-width'
import { Chessground as ChessgroundApi } from 'chessground'
import type { Api } from 'chessground/api'
import type { Config } from 'chessground/config'
import React, { useEffect, useRef, useState } from 'react'

interface Props {
  config?: Config
}

export const Chessground: React.FC<Props> = ({ config = {} }) => {
  const [api, setApi] = useState<Api | null>(null)
  const ref = useRef<HTMLDivElement>(null)
  const deviceWidth = useDeviceWidth()
  const chessgroundSize = deviceWidth > 600 ? 600 : deviceWidth

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
    <div style={{ width: chessgroundSize, height: chessgroundSize }}>
      <div ref={ref} className="w-full h-full table" />
    </div>
  )
}
