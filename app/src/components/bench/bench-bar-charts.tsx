import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
} from 'recharts'
import { cn } from '@/lib/utils'
import type { BenchModelRow } from './bench-mock'

type Metric = 'motiaChessIndex' | 'legalMoveScore' | 'puzzleScore' | 'acplScore' | 'legalVsIllegal'

const providerColors: Record<string, string> = {
  openai: '#34d399',
  claude: '#a78bfa',
  gemini: '#38bdf8',
  grok: '#fbbf24',
}

const toAcplScore = (acpl: number) => {
  return Math.max(0, Math.min(100, 100 - acpl))
}

const Patterns = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      <pattern id="pattern-openai" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
        <rect width="4" height="8" transform="translate(0,0)" fill={providerColors.openai} fillOpacity={0.2} />
        <rect width="8" height="8" fill={providerColors.openai} fillOpacity={0.1} />
      </pattern>
      <pattern id="pattern-claude" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
        <rect width="4" height="8" transform="translate(0,0)" fill={providerColors.claude} fillOpacity={0.2} />
        <rect width="8" height="8" fill={providerColors.claude} fillOpacity={0.1} />
      </pattern>
      <pattern id="pattern-gemini" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
        <rect width="4" height="8" transform="translate(0,0)" fill={providerColors.gemini} fillOpacity={0.2} />
        <rect width="8" height="8" fill={providerColors.gemini} fillOpacity={0.1} />
      </pattern>
      <pattern id="pattern-grok" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
        <rect width="4" height="8" transform="translate(0,0)" fill={providerColors.grok} fillOpacity={0.2} />
        <rect width="8" height="8" fill={providerColors.grok} fillOpacity={0.1} />
      </pattern>
    </defs>
  </svg>
)

type Props = {
  title: string
  description?: string
  rows: BenchModelRow[]
  metric: Metric
  className?: string
  unit?: string
  topN?: number
}

export const BenchBarChart: React.FC<Props> = ({ title, description, rows, metric, className, unit, topN }) => {
  const data = useMemo(() => {
    if (metric === 'legalVsIllegal') {
      return rows
        .map((r) => ({
          id: r.id,
          label: `${r.provider}/${r.model}`,
          shortModel: r.model.replace(/^(gpt-|claude-|gemini-|grok-)/, ''),
          provider: r.provider,
          legal: r.legalMoveScore,
          illegal: Math.max(0, 100 - r.legalMoveScore),
          value: r.legalMoveScore,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, topN || 100)
    }

    const mapped = rows.map((r) => {
      const value =
        metric === 'acplScore'
          ? toAcplScore(r.acpl)
          : metric === 'motiaChessIndex'
          ? r.motiaChessIndex
          : metric === 'legalMoveScore'
          ? r.legalMoveScore
          : r.puzzleScore
      return {
        id: r.id,
        label: `${r.provider}/${r.model}`,
        shortModel: r.model.replace(/^(gpt-|claude-|gemini-|grok-)/, ''),
        provider: r.provider,
        value,
        rawAcpl: r.acpl,
      }
    })

    return mapped.sort((a, b) => b.value - a.value).slice(0, topN || 100)
  }, [rows, metric, topN])

  const isStacked = metric === 'legalVsIllegal'

  return (
    <div className={cn('relative rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 hover:bg-white/[0.02] transition-colors', className)}>
      <Patterns />
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
          {description ? <div className="text-sm text-white/50 mt-1 font-light leading-relaxed">{description}</div> : null}
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
            barCategoryGap="25%"
          >
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="shortModel"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
              interval={0}
              height={40}
              angle={-25}
              textAnchor="end"
            />
            <YAxis
              type="number"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{
                background: '#09090b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              }}
              formatter={(v: any, name: any, item: any) => {
                if (metric === 'acplScore' && name === 'Score') return [`${item?.payload?.rawAcpl ?? '-'} ACPL`, 'ACPL (Actual)']
                if (metric === 'legalVsIllegal') return [`${Number(v).toFixed(1)}%`, name === 'legal' ? 'Legal' : 'Illegal']
                return [`${Number(v).toFixed(0)}${unit ?? ''}`, 'Score']
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
            />
            {isStacked ? (
              <>
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', opacity: 0.7 }} />
                <Bar dataKey="legal" name="Legal" stackId="a" fill="#34d399" radius={[0, 0, 4, 4]} />
                <Bar dataKey="illegal" name="Illegal" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </>
            ) : (
              <Bar dataKey="value" name="Score" radius={[4, 4, 0, 0]}>
                {data.map((d) => (
                  <Cell 
                    key={d.id} 
                    fill={`url(#pattern-${d.provider})`}
                    stroke={providerColors[d.provider]}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {metric === 'acplScore' ? (
        <div className="mt-4 text-[10px] text-white/30 text-center font-mono border-t border-white/5 pt-2">
          * Bars represent inverted score (100 - ACPL). Higher bar = Better play.
        </div>
      ) : null}
    </div>
  )
}

// ----------------------------------------------------------------------
// NEW CHART: Pareto / Scatter Plot
// ----------------------------------------------------------------------

type ParetoProps = {
  title: string
  description?: string
  rows: BenchModelRow[]
  className?: string
}

export const ParetoChart: React.FC<ParetoProps> = ({ title, description, rows, className }) => {
  // Use ACPL as "Cost" (x-axis) vs Motia Index as "Performance" (y-axis)
  // Or: ACPL (x) vs Legal Move Score (y)
  // Lower ACPL is better, so we might want to invert X or just label it "Quality Cost"
  // Let's do: X-Axis = ACPL (Lower is better, so left is better)
  //           Y-Axis = Motia Chess Index (Higher is better)
  
  const data = useMemo(() => {
    return rows.map((r) => ({
      id: r.id,
      x: r.acpl, // Lower is better
      y: r.motiaChessIndex, // Higher is better
      provider: r.provider,
      label: r.model.replace(/^(gpt-|claude-|gemini-|grok-)/, ''),
    }))
  }, [rows])

  return (
    <div className={cn('relative rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 hover:bg-white/[0.02] transition-colors', className)}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
          {description ? <div className="text-sm text-white/50 mt-1 font-light leading-relaxed">{description}</div> : null}
        </div>
        <div className="text-[10px] text-white/40 border border-white/10 px-2 py-1 rounded bg-white/5">
          Top Right = Better
        </div>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="ACPL"
              reversed // Lower ACPL is better, so put 0 on the right? No, typically "Cost" is on X (low cost left). 
                       // Let's keep normal: 0 on left (better) -> 100 on right (worse).
              label={{ value: 'ACPL (Lower is better)', position: 'insideBottom', offset: -10, fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              tickCount={5}
              domain={[0, 'auto']}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Index"
              label={{ value: 'Motia Index', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              domain={[0, 100]}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload
                  return (
                    <div className="bg-[#09090b] border border-white/10 rounded-lg p-3 text-xs shadow-xl">
                      <div className="font-semibold text-white mb-1">{d.label}</div>
                      <div className="text-emerald-400">Index: {d.y}</div>
                      <div className="text-amber-400">ACPL: {d.x}</div>
                      <div className="text-white/40 mt-1 capitalize">{d.provider}</div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Scatter name="Models" data={data}>
              {data.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={providerColors[entry.provider] ?? '#fff'} 
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth={1}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
