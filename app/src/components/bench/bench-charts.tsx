import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { BenchTimeseriesPoint } from './bench-mock'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

type MiniAreaProps = {
  points: BenchTimeseriesPoint[]
  className?: string
  stroke?: string
  height?: number
}

export const MiniArea: React.FC<MiniAreaProps> = ({ points, className, stroke = '#34d399', height = 64 }) => {
  const data = useMemo(() => points.map((p) => ({ t: p.t, v: p.v })), [points])

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`benchGrad-${stroke.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="t" hide />
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Tooltip
            cursor={{ stroke: 'rgba(255,255,255,0.12)' }}
            contentStyle={{
              background: 'rgba(9,9,11,0.92)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12,
              color: 'rgba(255,255,255,0.85)',
            }}
            labelFormatter={(t) => new Date(Number(t)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            formatter={(v) => [Number(v).toFixed(1), '']}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#benchGrad-${stroke.replace('#', '')})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
