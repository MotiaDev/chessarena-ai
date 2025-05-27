import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '../components/ui/chat/chat-bubble'

type Props = { message: string }

export const ChatUserMessage: React.FC<Props> = ({ message }) => {
  return (
    <ChatBubble variant="sent">
      <ChatBubbleAvatar fallback="US" />
      <ChatBubbleMessage variant="sent">{message}</ChatBubbleMessage>
    </ChatBubble>
  )
}
