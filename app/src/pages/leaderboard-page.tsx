import { PageDialog } from '@/components/page-dialog'
import { usePageTitle } from '@/lib/use-page-title'
import { Leaderboard } from '../components/leaderboard/leaderboard'

export const LeaderboardPage = () => {
  usePageTitle('Leaderboard')

  return (
    <PageDialog>
      <Leaderboard showBackButton />
    </PageDialog>
  )
}
