import { ChessGame } from '@/components/chess/chess-game'
import { Page } from '@/components/page'
import { usePageTitle } from '@/lib/use-page-title'
import { useNavigate, useParams } from 'react-router'

export const ChessGamePage = () => {
  const navigate = useNavigate()
  const { gameId } = useParams()

  usePageTitle('Game')

  return (
    <Page className="w-screen">
      <ChessGame gameId={gameId!} onClose={() => navigate('/')} />
    </Page>
  )
}
