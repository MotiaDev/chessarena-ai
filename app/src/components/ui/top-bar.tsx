import { ArrowLeft } from 'lucide-react'
import { MotiaPowered } from '../motia-powered'

type Props = {
  onBack?: () => void
}

export const TopBar: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="flex flex-row items-center justify-center w-full">
      {onBack ? <ArrowLeft className="size-6 shrink-0 cursor-pointer mr-2" onClick={onBack} /> : null}
      <MotiaPowered size="sm" className="grow mr-8" />
    </div>
  )
}
