import { Select, SelectBody, SelectItem, SelectTrigger } from "@/components/ui/select"
import { useState } from "react";

type Props = {
  onModelSection: (model: string) => void;
  models: string[]
  value: string;
}

export const AiProviderModelsSelect: React.FC<Props> = ({ onModelSection, models, value }) => {
  const [isOpen, setIsOpen] = useState(false)

  console.log("value", value)

  return (
    <Select open={isOpen} onOpenChange={setIsOpen} value={value} onValueChange={onModelSection}>
      <SelectTrigger isOpen={isOpen} placeholder={"Select a model"} />
      <SelectBody>
        {models.map((model) => (
          <SelectItem key={model} value={model}>
            {model}
          </SelectItem>
        ))}
      </SelectBody>
    </Select>
  )
}