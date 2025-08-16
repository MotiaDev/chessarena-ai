import { TokenData } from './chess/00-auth-api.step'
import { ApiRequest } from 'motia'

export type TokenData = {
  sub: string
}

declare module 'motia' {
  interface ApiRequest<TBody = unknown> {
    tokenInfo: TokenData | undefined
  }
}
