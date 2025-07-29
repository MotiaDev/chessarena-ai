import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'

import { cn } from '@/lib/utils'
import { CheckIcon, ChevronDown, ChevronUp } from 'lucide-react'

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Select>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectContent({ ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return <SelectPrimitive.Content {...props} />
}

function SelectViewport({ ...props }: React.ComponentProps<typeof SelectPrimitive.Viewport>) {
  return <SelectPrimitive.Viewport {...props} />
}

function SelectPortal({ ...props }: React.ComponentProps<typeof SelectPrimitive.Portal>) {
  return <SelectPrimitive.Portal {...props} />
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value {...props} />
}

function SelectIcon({ ...props }: React.ComponentProps<typeof SelectPrimitive.Icon>) {
  return <SelectPrimitive.Icon {...props} />
}

const SelectTrigger = ({ className, placeholder, isOpen, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger> & { placeholder?: string; isOpen: boolean }) => {
  return (
    <SelectPrimitive.Trigger 
      className={cn(
        'w-full text-md font-bold text-white bg-black/20 p-2 text-center rounded-md border-2 border-white/10',
        'outline-0',
        'flex flex-row gap-2 items-center justify-between',
        className,
      )} 
      {...props}>
      <SelectValue placeholder={placeholder} />
      <SelectIcon>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </SelectIcon>
    </SelectPrimitive.Trigger>
  )
}

const SelectItem = React.forwardRef(
	({ children, className, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>, forwardedRef: React.Ref<HTMLDivElement>) => {
		return (
			<SelectPrimitive.Item
				className={cn("w-full flex flex-row items-center justify-between px-0 py-2 hover:cursor-pointer", className)}
				{...props}
				ref={forwardedRef}
			>
				<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
				<SelectPrimitive.ItemIndicator className="SelectItemIndicator">
					<CheckIcon />
				</SelectPrimitive.ItemIndicator>
			</SelectPrimitive.Item>
		);
	},
);

const SelectBody = ({ children, className, ...props }: React.ComponentProps<typeof SelectPrimitive.SelectContent>) => {
  return (
    <SelectPortal>
      <SelectPrimitive.SelectContent 
        position='popper' 
        align='start'
        side='bottom'
        sideOffset={1}
        style={{
          width: 'var(--radix-select-trigger-width)',
          maxHeight: 'var(--radix-select-content-available-height)',
        }}
        asChild 
        className={cn(
          'w-full text-md font-semibold text-white bg-black/90 p-2 text-left rounded-md border-2 border-white/10 shadow-xl',
          'outline-0 focus:border-[#3B6AD7]',
          className,
        )}  {...props}>
        <SelectPrimitive.SelectViewport>
          {children}
        </SelectPrimitive.SelectViewport>
      </SelectPrimitive.SelectContent>
    </SelectPortal>
  );
}

export { Select, SelectIcon, SelectTrigger, SelectContent, SelectViewport, SelectItem, SelectPortal, SelectValue, SelectBody }