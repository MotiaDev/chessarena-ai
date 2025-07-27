import { AiIcon } from '@/components/chess/ai-icon'
import { ChessIcon } from '@/components/chess/chess-icon'
import { Input } from '@/components/ui/input'
import { Selector } from '@/components/ui/selector'
import type { Player } from '@/lib/types'
import { useState } from 'react'
import { CreateGameButton } from './create-game-button'
import { AiProviderModelsSelect } from './ai-provider-models-select'
import { useGetAiModels } from '@/lib/use-get-ai-models'

type Props = {
  player: Player
  color: 'white' | 'black'
  onSubmit: (player: Player, color: 'white' | 'black') => void
  isAiEnabled: boolean
}

export const CreateGamePlayerForm: React.FC<Props> = ({ player, color, onSubmit, isAiEnabled }) => {
  const [ai, setAi] = useState<Player['ai']>(player.ai)
  const [model, setModel] = useState<string>(player.model ?? '')
  const [name, setName] = useState(player.name)

  const {models}  = useGetAiModels();

  const onSelectAiProvider = (ai: Player['ai']) => {
    setAi(ai)
    setModel('')
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full h-full">
      <div className="flex-1" />
      <ChessIcon color={color} size={80} />
      <Input
        type="text"
        placeholder="Enter your name"
        className="w-full"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex-1" />
      <Selector isSelected={!ai} className="w-full" onClick={() => setAi(undefined)}>
        Play as {color}
      </Selector>
      {isAiEnabled && (
        <>
          <div className="flex flex-row gap-2 items-center justify-center w-full text-muted-foreground text-md font-semibold">
            <div className="h-[1px] flex-1 bg-white/10" />
            Or set as
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>
          <div className="flex flex-row gap-2 items-center justify-center w-full">
            <Selector isSelected={ai === 'openai'} className="w-full flex flex-col" onClick={() => onSelectAiProvider('openai')}>
              <AiIcon ai="openai" color="white" />
              ChatGPT
            </Selector>
            <Selector isSelected={ai === 'gemini'} className="w-full flex flex-col" onClick={() => onSelectAiProvider('gemini')}>
              <AiIcon ai="gemini" />
              Gemini
            </Selector>
            <Selector isSelected={ai === 'claude'} className="w-full flex flex-col" onClick={() => onSelectAiProvider('claude')}>
              <AiIcon ai="claude" />
              Claude
            </Selector>
          </div>
          {ai && <div className="flex flex-row gap-2 items-center justify-center w-full">
            <AiProviderModelsSelect
              onModelSection={(model) => setModel(model)}
              models={models[ai]}
              value={model}
            />
          </div>}
        </>
      )}

      <CreateGameButton disabled={!name} onClick={() => onSubmit({ ...player, name, ai, model }, color)}>
        Save
      </CreateGameButton>
    </div>
  )
}
