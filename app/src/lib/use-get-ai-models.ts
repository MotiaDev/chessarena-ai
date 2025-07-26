import { useCallback, useEffect, useState } from 'react'
import { apiUrl } from './env'

export const useGetAiModels = () => {
  const [models, setModels] = useState<{ openai: string[]; gemini: string[]; claude: string[] }>({ openai: [], gemini: [], claude: [] })
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

  return {models}
}
