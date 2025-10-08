import { PageDialog } from '@/components/page-dialog'
import { usePageTitle } from '@/lib/use-page-title'
import { Leaderboard } from '../components/leaderboard/leaderboard'

export const LeaderboardPage = () => {
  usePageTitle('Leaderboard')

  return (
    <PageDialog>
      <Leaderboard showBackButton className="md:h-fit md:max-h-[min(calc(100dvh-64px),1280px)] my-auto mx-auto" />
    </PageDialog>
  )
}
