import * as React from 'react'
import { cn } from '@/lib/utils'

interface ChatInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const ChatInput = React.forwardRef<HTMLInputElement, ChatInputProps>(({ className, ...props }, ref) => (
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
))
ChatInput.displayName = 'ChatInput'

export { ChatInput }
