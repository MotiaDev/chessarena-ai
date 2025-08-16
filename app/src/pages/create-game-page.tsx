import { CreateGame } from '@/components/chess/create-game/create-game'
import { Page } from '@/components/page'
import { usePageTitle } from '@/lib/use-page-title'
import { useNavigate } from 'react-router'
import { AuthGuard } from '../components/auth/auth-guard'

export const CreateGamePage = () => {
  const navigate = useNavigate()
  const handleCreateGame = (gameId: string) => navigate(`/game/${gameId}`)

  usePageTitle('Create Game')

  return (
    <AuthGuard>
      <Page className="p-6 md:max-w-[500px] md:ml-auto md:border-l-2 md:border-white/5 backdrop-blur-lg">
        <CreateGame onGameCreated={handleCreateGame} onCancel={() => navigate('/')} />
      </Page>
    </AuthGuard>
  )
}
