import { CreateGame } from '@/components/chess/create-game/create-game'
import { PageGrid, PageGridRightColumn } from '@/components/page-grid'
import { usePageTitle } from '@/lib/use-page-title'
import { useNavigate } from 'react-router'
import { AuthGuard } from '../components/auth/auth-guard'

export const CreateGamePage = () => {
  const navigate = useNavigate()
  const handleCreateGame = (gameId: string) => navigate(`/game/${gameId}`)

  usePageTitle('Create Game')

  return (
    <AuthGuard>
      <PageGrid>
        <PageGridRightColumn>
          <CreateGame onGameCreated={handleCreateGame} onCancel={() => navigate('/')} />
        </PageGridRightColumn>
      </PageGrid>
    </AuthGuard>
  )
}
