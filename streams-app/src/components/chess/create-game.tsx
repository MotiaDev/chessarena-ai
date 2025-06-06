import { useState } from 'react'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { Button } from '../ui/button'
import { useCreateGame } from '../../lib/use-create-game'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'

type Props = {
  onGameCreated: (gameId: string, password: string) => void
}

export const CreateGame: React.FC<Props> = ({ onGameCreated }) => {
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false)
  const createGame = useCreateGame()
  const [whiteName, setWhiteName] = useState('White')
  const [blackName, setBlackName] = useState('Black')
  const [isAiEnabled, setIsAiEnabled] = useState(false)
  const isFormValid = whiteName && blackName

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!isFormValid) {
      return
    }

    const game = await createGame({
      white: { name: whiteName },
      black: { name: blackName, ai: isAiEnabled ? 'openai' : undefined },
    })

    onGameCreated(game.id, game.passwords.root)
  }

  return (
    <div>
      <Button onClick={() => setIsCreateGameOpen(true)}>Create Game</Button>
      <Drawer open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Create Game</DrawerTitle>
            <DrawerDescription>Create a new game</DrawerDescription>
          </DrawerHeader>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2 w-full p-4">
              <Input
                type="text"
                placeholder="White Name"
                value={whiteName}
                onChange={(e) => setWhiteName(e.target.value)}
              />
              <div className="flex flex-row gap-2 items-center">
                <Input
                  type="text"
                  placeholder="Black Name"
                  value={blackName}
                  onChange={(e) => setBlackName(e.target.value)}
                />
                <Label className="hover:bg-accent/50 flex items-start gap-2 rounded-lg border p-2 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:border-blue-900 has-[[aria-checked=true]]:bg-blue-950">
                  <Checkbox
                    id="ai-enabled"
                    checked={isAiEnabled}
                    onCheckedChange={() => setIsAiEnabled(!isAiEnabled)}
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                  />
                  OpenAI
                </Label>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full p-4">
              <Button variant="default" disabled={!isFormValid}>
                Create Game
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
