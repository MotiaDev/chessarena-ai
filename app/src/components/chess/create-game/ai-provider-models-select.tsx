import { Selector } from '@/components/ui/selector'

type Props = {
  onModelSection: (model: string) => void
  models: string[]
  value: string
}

export const AiProviderModelsSelect: React.FC<Props> = ({ onModelSection, models, value }) => {
  return (
    <div className="w-full max-h-[150px] overflow-y-auto flex flex-col gap-2">
      {models.map((model) => (
        <Selector className="w-full" key={model} isSelected={value === model} onClick={() => onModelSection(model)}>
          {model}
        </Selector>
      ))}
    </div>
  )
}
