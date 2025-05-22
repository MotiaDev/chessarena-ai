import { useStreamItem } from '@motiadev/stream-client-react'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import MessageLoading from '../components/ui/chat/message-loading'

export const ChatAssistantMessage: React.FC<{ id: string }> = ({ id }) => {
  const { data } = useStreamItem<{ message: string }>({ streamName: 'message', id })

  return (
    <div className="chat-message flex flex-col gap-2 bg-[#dddddd0a] max-w-full rounded-md p-4">
      {!data?.message && <MessageLoading />}
      <Markdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')

            return !inline && match ? (
              <SyntaxHighlighter style={dracula} PreTag="div" language={match[1]} {...props}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {data?.message}
      </Markdown>
    </div>
  )
}
