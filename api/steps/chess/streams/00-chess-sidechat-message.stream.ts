import { SidechatMessageSchema } from '@chessarena/types/sidechat-message'
import { StreamConfig } from 'motia'

export const config: StreamConfig = {
  name: 'chessSidechatMessage',
  schema: SidechatMessageSchema,
  baseConfig: { storageType: 'default' },
}
