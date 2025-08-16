import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'font-bold text-white bg-black/20 p-4 text-center rounded-md border-2 border-white/10',
        'outline-0 focus:border-[#3B6AD7]',
        className,
      )}
      autoComplete="off"
      data-1p-ignore
      {...props}
    />
  )
}

export { Input }
