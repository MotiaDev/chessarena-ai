import * as React from 'react'
import { cn } from '../../../lib/utils'

export function CreateGameButton({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap
      text-lg font-extrabold transition-all 
      h-[64px] w-full rounded-md 
      px-6 bg-gradient-to-b from-[#3B6AD7] to-[#1F2B71] text-white
      hover:opacity-90 cursor-pointer
      shadow-[0_0_0_2px_#394FF740]
      disabled:opacity-50 disabled:cursor-not-allowed
      border border-white/10 border-solid
      "
      {...props}
    />
  )
}

export function CreateGameButtonAlt({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        `
      inline-flex items-center justify-center gap-2 whitespace-nowrap
      text-lg font-extrabold transition-all 
      h-[64px] rounded-md px-8
       shadow-[0px_4px_8px_rgba(0,0,0,0.3)]
      border-1 border-[#C8C8C8]/60 border-solid
      cursor-pointer
      bg-[#C8C8C8]/40
      hover:bg-[#C8C8C8]/50
      active:bg-[#C8C8C8]/30
      `,
        className,
      )}
      {...props}
    />
  )
}
