import React, { useRef } from 'react'
import { Input } from './input'

type Props = {
  value: string
  onChange: (value: string) => void
}

export const OtpInput: React.FC<Props> = ({ value, onChange }) => {
  const ref1 = useRef<HTMLInputElement>(null)
  const ref2 = useRef<HTMLInputElement>(null)
  const ref3 = useRef<HTMLInputElement>(null)
  const ref4 = useRef<HTMLInputElement>(null)
  const ref5 = useRef<HTMLInputElement>(null)
  const ref6 = useRef<HTMLInputElement>(null)

  const inputRefs = [ref1, ref2, ref3, ref4, ref5, ref6]

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, '')

    if (newValue.length > 1) return

    const newOtp = value.split('')
    newOtp[index] = newValue
    onChange(newOtp.join(''))

    // Move to next input if value entered
    if (newValue && index < 5) {
      inputRefs[index + 1]?.current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/[^0-9]/g, '')
      .slice(0, 6)
    onChange(pastedData.padEnd(6, ''))
  }

  return (
    <div className="flex flex-row gap-2 items-center justify-center">
      {Array(6)
        .fill(null)
        .map((_, index) => (
          <Input
            key={index}
            type="text"
            ref={inputRefs[index]}
            className="max-w-1/6 w-[50px] text-4xl p-2 text-center"
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            maxLength={1}
            inputMode="numeric"
          />
        ))}
    </div>
  )
}
