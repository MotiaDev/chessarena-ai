import { useStreamItem } from '@motiadev/stream-client-react'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '../components/ui/chat/chat-bubble'

export const ChatUserMessage: React.FC<{ id: string }> = ({ id }) => {
  const { data } = useStreamItem<{ message: string }>({ streamName: 'message', id })

  return (
    <ChatBubble variant="sent">
      <ChatBubbleAvatar fallback="US" />
      <ChatBubbleMessage variant="sent">{data?.message}</ChatBubbleMessage>
    </ChatBubble>
  )
}
