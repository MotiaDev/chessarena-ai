import { Card } from '@/components/ui/card'
import type React from 'react'

export const LeaderboardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-2 w-full text-sm">
      <Card className="flex flex-row gap-2 items-center justify-between w-full p-4">
        <div className="font-bold text-white/20 animate-pulse">1</div>
        <div className="flex flex-row gap-2 items-center flex-1">
          <div className="w-5 h-5 rounded-full bg-white/20 animate-pulse" />
          <div className="w-32 h-4 rounded bg-white/20 animate-pulse" />
        </div>
        <div className="flex flex-col gap-1 items-start">
          <div className="font-semibold text-white/60">G</div>
          <div className="w-8 h-4 rounded bg-white/20 animate-pulse" />
        </div>
        <div className="flex flex-col gap-1 items-start">
          <div className="font-semibold text-white/60">W</div>
          <div className="w-6 h-4 rounded bg-white/20 animate-pulse" />
        </div>
        <div className="flex flex-col gap-1 items-start">
          <div className="font-semibold text-white/60">W%</div>
          <div className="w-12 h-4 rounded bg-white/20 animate-pulse" />
        </div>
      </Card>
    </div>
  )
}
