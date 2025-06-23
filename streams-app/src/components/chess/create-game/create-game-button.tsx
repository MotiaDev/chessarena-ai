import * as React from 'react'

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
      "
      {...props}
    />
  )
}
