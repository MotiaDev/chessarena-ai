import { useCallback, useEffect, useState } from 'react'
import { apiUrl } from './env'
import type { AiModels } from '@chessarena/types/ai-models'

export const useGetAiModels = () => {
  const [models, setModels] = useState<AiModels>({
    openai: [],
    gemini: [],
    claude: [],
    grok: [],
  })
  const getAiModels = useCallback(async (): Promise<void> => {
    const res = await fetch(`${apiUrl}/chess/models`)

    if (!res.ok) {
      return
    }

    const models = (await res.json())?.models
    setModels(models)
  }, [])

  useEffect(() => {
    getAiModels().catch(() => console.error('Failed to get AI models'))
  }, [getAiModels])

  return { models }
}
