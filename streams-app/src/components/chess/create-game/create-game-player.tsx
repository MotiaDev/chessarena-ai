import { ChessIcon } from '../chess-icon'

type Props = {
  name: string
  ai?: 'openai' | 'gemini'
  color: 'white' | 'black'
}

export const CreateGamePlayer: React.FC<Props> = ({ name, ai, color }) => {
  return (
    <div className="flex flex-row gap-4 items-center justify-between border rounded-lg py-4 px-8 w-full border-white/20 hover:bg-white/10 transition-colors cursor-pointer">
      <div className="flex flex-row gap-4 items-center">
        <ChessIcon color={color} />
        <div className="flex flex-col gap-1">
          <p className="text-md font-semibold">{name}</p>
        </div>
      </div>
      <div className="flex flex-row gap-4 items-center">
        <p className="text-sm text-muted-foreground">{ai ? `AI: ${ai}` : 'Human'}</p>
      </div>
    </div>
  )
}
