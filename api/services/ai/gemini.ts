import { GoogleGenAI } from '@google/genai'
import zodToJsonSchema from 'zod-to-json-schema'
import { models } from './models'
import { Handler } from './types'

export const gemini: Handler = async ({ prompt, zod, logger, model }) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  const completion = await ai.models.generateContent({
    model: model ?? models.gemini,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: zodToJsonSchema(zod),
    },
  })

  logger.info('Gemini response received', { model })

  const content = JSON.parse(completion.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}')

  return zod.parse(content)
}
