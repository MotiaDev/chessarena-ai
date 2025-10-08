import { PageDialog } from '@/components/page-dialog'
import { usePageTitle } from '@/lib/use-page-title'
import { Leaderboard } from '../components/leaderboard/leaderboard'

export const LeaderboardPage = () => {
  usePageTitle('Leaderboard')

  return (
    <PageDialog>
      <Leaderboard showBackButton className="md:max-h-[min(calc(100dvh-64px),1480px)] my-auto mx-auto" />
    </PageDialog>
  )
}
