import { PageDialog } from '@/components/page-dialog'
import { usePageTitle } from '@/lib/use-page-title'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Leaderboard } from '../components/leaderboard/leaderboard'

export const LeaderboardPage = () => {
  const navigate = useNavigate()
  const onBack = () => navigate('/')

  usePageTitle('Leaderboard')

  return (
    <PageDialog>
      <div className="relative flex flex-row items-center justify-center w-full mt-4">
        <ArrowLeft className="absolute left-6 top-0 size-6 cursor-pointer" onClick={onBack} />
        <h1 className="text-lg font-semibold text-white">Leaderboard</h1>
      </div>

      <Leaderboard />
    </PageDialog>
  )
}
