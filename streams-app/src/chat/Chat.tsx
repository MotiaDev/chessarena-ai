import { useStreamGroup } from '@motiadev/stream-client-react'
import { useCallback, useState, type KeyboardEvent } from 'react'
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from '../components/ui/chat/chat-bubble'
import { ChatInput } from '../components/ui/chat/chat-input'
import { ChatAssistantMessage } from './ChatAssistantMessage'
import { ChatUserMessage } from './ChatUserMessage'
import { useQueryParam } from './hooks/useQueryParam'
import type { Message } from './types'

export const Chat = () => {
  const [threadId, setThreadId] = useQueryParam('threadId')
  const [loadingMessage, setLoadingMessage] = useState('')
  const { data: messages } = useStreamGroup<Message>(
    threadId ? { streamName: 'message', groupId: threadId } : undefined,
  )

  const sendMessage = useCallback(
    async (message: string) => {
      setLoadingMessage(message)

      // send message to motia backend
      const result = await fetch('http://localhost:3000/open-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, threadId }),
      })
      const data = await result.json()

      // create new thread if none exists
      if (!threadId) {
        setThreadId(data.threadId)
      }

      setLoadingMessage('')
    },
    [threadId],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
        sendMessage(event.currentTarget.value)
        event.currentTarget.value = ''
        event.stopPropagation()
        event.preventDefault()
      }
    },
    [sendMessage],
  )

  const hasThread = messages.length > 0

  return (
    <div className="flex flex-col h-screen max-w-[800px] min-h-screen mx-auto gap-4 p-4">
      {threadId && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => setThreadId(undefined)}
            className="fixed top-4 left-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-3 shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 justify-end">
        {!hasThread && (
          <div className="flex flex-col flex-1 gap-4 items-center justify-center">
            <img src="https://www.motia.dev/logos/logo-white.svg" alt="Motia Logo" className="h-8" />
            <p className="font-medium text-center">
              Welcome to Motia! I'm here to assist you with any questions regarding Motia Framework.
            </p>
          </div>
        )}

        {messages.map((message) =>
          message.from === 'assistant' ? (
            <ChatAssistantMessage key={message.id} message={message.message} />
          ) : (
            <ChatUserMessage key={message.id} message={message.message} />
          ),
        )}

        {loadingMessage && (
          <ChatBubble variant="sent">
            <ChatBubbleAvatar fallback="US" />
            <ChatBubbleMessage variant="sent">{loadingMessage}</ChatBubbleMessage>
          </ChatBubble>
        )}
      </div>
      <div className="py-4 sticky bottom-0 backdrop-blur-sm bg-background/80">
        <ChatInput placeholder="I need help creating CRON step in motia with TypeScript" onKeyDown={onKeyDown} />
      </div>
    </div>
  )
}
