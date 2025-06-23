import { GoogleGenAI } from '@google/genai'
import z, { ZodObject, ZodRawShape } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { Handler } from './types'
import { Logger } from 'motia'

export const gemini: Handler = async <T extends ZodRawShape>(
  prompt: string,
  zod: ZodObject<T>,
  logger: Logger,
): Promise<z.infer<typeof zod>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  const completion = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: zodToJsonSchema(zod),
    },
  })

  const content = JSON.parse(completion.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}')

  return zod.parse(content)
}
