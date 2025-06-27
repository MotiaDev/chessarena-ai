import { ChessGame } from '@/components/chess/chess-game'
import { Page } from '@/components/page'
import { useQueryParam } from '@/lib/use-query-param'
import { useNavigate, useParams } from 'react-router'

export const ChessGamePage = () => {
  const navigate = useNavigate()
  const { gameId } = useParams()
  const [password] = useQueryParam('pw')

  return (
    <Page className="w-screen">
      <ChessGame gameId={gameId!} password={password} onClose={() => navigate('/')} />
    </Page>
  )
}
