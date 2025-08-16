import { adjectives, animals, uniqueNamesGenerator } from 'unique-names-generator'

export const randomUserName = (): string => {
  return uniqueNamesGenerator({ dictionaries: [adjectives, animals], separator: ' ' })
}
