import * as React from 'react'
import { cn } from '@/lib/utils'

type ChatInputProps = React.InputHTMLAttributes<HTMLInputElement>

const ChatInput: React.FC<ChatInputProps> = ({ className, ...props }) => (
  <input
    autoComplete="off"
    type="text"
    name="message"
    className={cn(
      'bg-white/5 text-white hover:bg-white/10 font-medium rounded-full resize-none outline-0 px-4 py-3 flex-1 placeholder:text-white/50',
      className,
    )}
    {...props}
  />
)

export { ChatInput }
