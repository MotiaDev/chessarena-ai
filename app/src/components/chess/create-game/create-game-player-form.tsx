import { AiIcon } from '@/components/chess/ai-icon'
import { ChessIcon } from '@/components/chess/chess-icon'
import { Selector } from '@/components/ui/selector'
import type { Player } from '@chessarena/types/game'
import { useGetAiModels } from '@/lib/use-get-ai-models'
import { useEffect, useState } from 'react'
import { AiProviderModelsSelect } from './ai-provider-models-select'
import { CreateGameButton } from './create-game-button'
import { Loader2 } from 'lucide-react'
import type { AiModelProvider } from '@chessarena/types/ai-models'
import { Separator } from '@/components/ui/separator'

type Props = {
  player: Player
  color: 'white' | 'black'
  onSubmit: (player: Player, color: 'white' | 'black') => void
  isAiEnabled: boolean
  isLoading?: boolean
}

export const CreateGamePlayerForm: React.FC<Props> = ({ player, color, onSubmit, isAiEnabled, isLoading }) => {
  const [ai, setAi] = useState<Player['ai']>(player.ai)
  const [model, setModel] = useState<string>(player.model ?? '')

  const { models } = useGetAiModels()

  const onSelectAiProvider = (ai: Player['ai']) => {
    setAi(ai)
    setModel('')
  }

  useEffect(() => {
    setAi(player.ai)
    setModel(player.model ?? '')
  }, [player])

  return (
    <div className="flex flex-col gap-4 items-center justify-center w-full h-full">
      <ChessIcon color={color} size={80} />
      <h2 className="text-2xl font-bold capitalize">{color}</h2>
      <Selector isSelected={!ai} className="w-full" onClick={() => setAi(undefined)}>
        Play as {color}
      </Selector>
      {isAiEnabled && (
        <>
          <div className="flex flex-row gap-2 items-center justify-center w-full text-muted-foreground text-md font-semibold">
            <Separator className="shrink-1" />
            <span className="min-w-fit">Or set model</span>
            <Separator className="shrink-1" />
          </div>
          <div className="flex flex-row gap-2 w-full overflow-x-auto">
            {Object.keys(models).map((key) => (
              <Selector
                key={key}
                isSelected={ai === key}
                className="w-full flex flex-col capitalize"
                onClick={() => onSelectAiProvider(key as AiModelProvider)}
              >
                <AiIcon ai={key as AiModelProvider} color="white" />
                {key}
              </Selector>
            ))}
          </div>
          {ai && (
            <>
              <Separator />
              <AiProviderModelsSelect onModelSection={(model) => setModel(model)} models={models[ai]} value={model} />
            </>
          )}
        </>
      )}

      <div className="flex flex-col justify-end grow w-full">
        {isLoading ? (
          <div className="flex flex-row gap-2 items-center justify-center w-full h-[64px] font-medium text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Your match is loading...
          </div>
        ) : (
          <CreateGameButton className="w-full" onClick={() => onSubmit({ ...player, ai, model }, color)}>
            {color === 'white' ? 'Continue' : 'Start match'}
          </CreateGameButton>
        )}
      </div>
    </div>
  )
}
