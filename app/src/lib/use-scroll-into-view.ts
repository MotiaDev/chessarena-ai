import { useEffect, useRef } from 'react'

export const useScrollIntoView = (shouldScroll: boolean = true) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (shouldScroll && ref.current) {
      ref.current.scrollIntoView({ behavior: 'instant', block: 'end' })
    }
  }, [shouldScroll])

  return ref
}
