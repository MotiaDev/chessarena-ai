import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import MessageLoading from '../components/ui/chat/message-loading'

type Props = {
  message: string
}

export const ChatAssistantMessage: React.FC<Props> = ({ message }) => {
  return (
    <div className="chat-message flex flex-col gap-2 bg-[#dddddd0a] max-w-full rounded-md p-4">
      {!message && <MessageLoading />}
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
        {message}
      </Markdown>
    </div>
  )
}
