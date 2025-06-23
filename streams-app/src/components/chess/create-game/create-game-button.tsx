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
      border border-white/10 border-solid
      "
      {...props}
    />
  )
}

export function CreateGameButtonAlt({ className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className="
      inline-flex items-center justify-center gap-2 whitespace-nowrap
      text-lg font-extrabold transition-all 
      h-[64px] w-full rounded-md 
      bg-white/5 shadow-[0px_4px_8px_rgba(0,0,0,0.3)]
      backdrop-blur-3xl rounded-lg
      border border-white/20 border-solid
      cursor-pointer
      hover:opacity-90
      "
      {...props}
      style={{ background: 'radial-gradient(#C8C8C888 0%,  #FFFFFF16 100%)' }}
    />
  )
}
