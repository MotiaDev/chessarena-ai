import { useNavigate } from 'react-router'
import { CreateGame } from '../components/chess/create-game/create-game'
import { Page } from '../components/page'

export const CreateGamePage = () => {
  const navigate = useNavigate()
  const handleCreateGame = (gameId: string, password: string) => navigate(`/game/${gameId}?pw=${password}`)

  return (
    <Page className="p-6 md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5 backdrop-blur-lg">
      <CreateGame onGameCreated={handleCreateGame} onCancel={() => navigate('/')} />
    </Page>
  )
}
