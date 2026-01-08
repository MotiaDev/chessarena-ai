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
  ReferenceLine,
} from 'recharts'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BenchModelRow } from './bench-mock'
import { getPricingMap } from './model-pricing'

type Metric = 'motiaChessIndex' | 'legalMoveScore' | 'puzzleScore' | 'acplScore' | 'legalVsIllegal'

// Type for chart tooltip payload data
interface ChartTooltipData {
  provider: string
  label: string
  value?: number
  legal?: number
  illegal?: number
  rawAcpl?: number
}

export const providerColors: Record<string, string> = {
  openai: '#10b981',
  claude: '#a78bfa',
  gemini: '#3b82f6',
  grok: '#f59e0b',
}

const toAcplScore = (acpl: number) => {
  return Math.max(0, Math.min(100, 100 - acpl))
}

const metricLabel = (metric: Metric) => {
  switch (metric) {
    case 'motiaChessIndex':
      return 'Motia Index'
    case 'legalMoveScore':
      return 'Legal move score'
    case 'puzzleScore':
      return 'Puzzle accuracy'
    case 'acplScore':
      return 'ACPL score (inverted)'
    case 'legalVsIllegal':
      return 'Legal vs illegal'
  }
}

const metricHowToRead = (metric: Metric) => {
  switch (metric) {
    case 'motiaChessIndex':
      return 'Higher is better.'
    case 'legalMoveScore':
      return 'Higher is better.'
    case 'puzzleScore':
      return 'Higher is better.'
    case 'acplScore':
      return 'Bars are 100 - ACPL. Higher is better.'
    case 'legalVsIllegal':
      return 'Legal % vs the remainder.'
  }
}

// SVG Patterns for hatched bars
const HatchPatterns = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }}>
    <defs>
      {Object.entries(providerColors).map(([provider, color]) => (
        <pattern
          key={provider}
          id={`hatch-${provider}`}
          patternUnits="userSpaceOnUse"
          width="6"
          height="6"
          patternTransform="rotate(45)"
        >
          <rect width="6" height="6" fill={color} fillOpacity={0.15} />
          <line x1="0" y1="0" x2="0" y2="6" stroke={color} strokeWidth="2" strokeOpacity={0.4} />
        </pattern>
      ))}
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
  hiddenModels?: Set<string>
  showExpand?: boolean
  expanded?: boolean
  onExpandToggle?: () => void
  layout?: 'horizontal' | 'vertical' // Added layout prop
}

export const BenchBarChart: React.FC<Props> = ({
  title,
  description,
  rows,
  metric,
  className,
  unit,
  topN,
  hiddenModels,
  showExpand,
  expanded,
  onExpandToggle,
  layout = 'vertical', // Default to vertical (horizontal bars)
}) => {
  const data = useMemo(() => {
    const filtered = hiddenModels ? rows.filter((r) => !hiddenModels.has(r.id)) : rows

    if (metric === 'legalVsIllegal') {
      return filtered
        .map((r) => ({
          id: r.id,
          label: r.model,
          provider: r.provider,
          legal: r.legalMoveScore,
          illegal: Math.max(0, 100 - r.legalMoveScore),
          value: r.legalMoveScore,
          lastUpdatedAt: r.lastUpdatedAt,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, expanded ? 100 : (topN || 100))
    }

    const mapped = filtered.map((r) => {
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
        label: r.model,
        provider: r.provider,
        value,
        rawAcpl: r.acpl,
        lastUpdatedAt: r.lastUpdatedAt,
      }
    })

    return mapped.sort((a, b) => b.value - a.value).slice(0, expanded ? 100 : (topN || 100))
  }, [rows, metric, topN, hiddenModels, expanded])

  const totalCount = useMemo(() => {
    const filtered = hiddenModels ? rows.filter((r) => !hiddenModels.has(r.id)) : rows
    return filtered.length
  }, [rows, hiddenModels])

  const isStacked = metric === 'legalVsIllegal'
  const isVertical = layout === 'horizontal' // Horizontal layout means vertical bars
  const chartHeight = isVertical ? 400 : Math.max(320, data.length * 32)

  const axisText = 'rgba(255,255,255,0.72)'
  const axisMuted = 'rgba(255,255,255,0.55)'
  const axisLine = 'rgba(255,255,255,0.10)'

  return (
    <div className={cn('relative rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden', className)}>
      <HatchPatterns />
      
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight font-sans">{title}</h3>
            {description && (
              <p className="text-sm text-white/40 mt-1 leading-relaxed font-normal">{description}</p>
            )}
          </div>
          {showExpand && totalCount > (topN || 10) && (
            <button
              onClick={onExpandToggle}
              className="px-3 py-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition-all tracking-tight"
            >
              {expanded ? 'Show Less' : `View All ${totalCount}`}
            </button>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-4" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={layout}
            margin={{ top: 0, right: isVertical ? 0 : 24, left: 0, bottom: isVertical ? 84 : 0 }}
            barCategoryGap={isVertical ? "15%" : "25%"}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.04)" horizontal={isVertical} vertical={!isVertical} strokeDasharray="3 3" />
            
            {isVertical ? (
              <>
                <XAxis
                  type="category"
                  dataKey="label"
                  tick={{ fill: axisMuted, fontSize: 10 }}
                  axisLine={{ stroke: axisLine }}
                  tickLine={false}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  label={{
                    value: 'Model →',
                    position: 'insideBottom',
                    offset: -6,
                    fill: axisText,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <YAxis
                  type="number"
                  tick={{ fill: axisMuted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                  label={{
                    value: `${metricLabel(metric)}${unit ? ` (${unit.replace('%', '%')})` : ''}`,
                    angle: -90,
                    position: 'insideLeft',
                    fill: axisText,
                    fontSize: 11,
                    fontWeight: 600,
                    dx: -8,
                  }}
                />
              </>
            ) : (
              <>
                <XAxis
                  type="number"
                  tick={{ fill: axisMuted, fontSize: 11 }}
                  axisLine={{ stroke: axisLine }}
                  tickLine={false}
                  domain={[0, 100]}
                  label={{
                    value: `${metricLabel(metric)} →`,
                    position: 'insideBottom',
                    offset: -2,
                    fill: axisText,
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={160}
                  tick={{ fill: axisText, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
              </>
            )}

            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null
                const p = payload[0].payload as ChartTooltipData
                const provider = String(p.provider ?? '')
                const model = String(p.label ?? '')

                const value = typeof p.value === 'number' ? p.value : undefined
                const legal = typeof p.legal === 'number' ? p.legal : undefined
                const illegal = typeof p.illegal === 'number' ? p.illegal : undefined

                return (
                  <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-xs shadow-2xl min-w-[220px]">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="font-semibold text-white text-sm">{model}</div>
                      <div className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/60 capitalize">
                        {provider}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-white/50">{metricLabel(metric)}</span>
                        {metric === 'legalVsIllegal' ? (
                          <span className="text-white font-medium">{Number(legal ?? 0).toFixed(1)}%</span>
                        ) : metric === 'acplScore' ? (
                          <span className="text-emerald-400 font-medium">
                            {Number(value ?? 0).toFixed(1)}
                            {unit ?? ''}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-medium">
                            {Number(value ?? 0).toFixed(1)}
                            {unit ?? ''}
                          </span>
                        )}
                      </div>

                      {metric === 'acplScore' && (
                        <div className="flex justify-between">
                          <span className="text-white/50">ACPL (raw)</span>
                          <span className="text-white/70">{typeof p.rawAcpl === 'number' ? p.rawAcpl.toFixed(1) : '-'}</span>
                        </div>
                      )}

                      {metric === 'legalVsIllegal' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-white/50">Legal</span>
                            <span className="text-white/70">{Number(legal ?? 0).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/50">Illegal / missed</span>
                            <span className="text-white/70">{Number(illegal ?? 0).toFixed(1)}%</span>
                          </div>
                        </>
                      )}

                      <div className="pt-2 mt-2 border-t border-white/10 text-[10px] text-white/40">
                        {metricHowToRead(metric)}
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            {isStacked ? (
              <>
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', opacity: 0.6, fontWeight: 600 }} />
                <Bar dataKey="legal" name="Legal" stackId="a" fill="#10b981" radius={isVertical ? [4, 4, 0, 0] : [0, 4, 4, 0]} />
                <Bar dataKey="illegal" name="Illegal" stackId="a" fill="#ef4444" radius={isVertical ? [0, 0, 4, 4] : [4, 0, 0, 4]} />
              </>
            ) : (
              <Bar dataKey="value" name="Score" radius={isVertical ? [6, 6, 0, 0] : [0, 6, 6, 0]} barSize={isVertical ? 40 : 20}>
                {data.map((d) => (
                  <Cell
                    key={d.id}
                    fill={`url(#hatch-${d.provider})`}
                    stroke={providerColors[d.provider]}
                    strokeWidth={1.5}
                  />
                ))}
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {metric === 'acplScore' && (
        <div className="px-6 pb-4 text-[10px] text-white/30 font-mono border-t border-white/5 pt-3">
          * Bars represent inverted score (100 - ACPL). Longer bar = Better play.
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------------------
// Cost vs Performance Scatter Plot
// ----------------------------------------------------------------------

type CostChartProps = {
  title: string
  description?: string
  rows: BenchModelRow[]
  className?: string
  hiddenModels?: Set<string>
}

export const CostVsPerformanceChart: React.FC<CostChartProps> = ({ title, description, rows, className, hiddenModels }) => {
  const pricingMap = useMemo(() => getPricingMap(), [])

  const data = useMemo(() => {
    const filtered = hiddenModels ? rows.filter((r) => !hiddenModels.has(r.id)) : rows
    return filtered
      .map((r) => {
        const pricing = pricingMap.get(r.id)
        return {
          id: r.id,
          x: pricing?.avgPrice ?? 10, // Cost (USD per 1M tokens)
          y: r.motiaChessIndex,
          provider: r.provider,
          label: r.model,
          inputPrice: pricing?.inputPrice ?? 0,
          outputPrice: pricing?.outputPrice ?? 0,
        }
      })
      .filter((d) => d.x > 0)
  }, [rows, hiddenModels, pricingMap])

  // Calculate average performance for reference line
  const avgPerformance = useMemo(() => {
    if (data.length === 0) return 50
    return data.reduce((sum, d) => sum + d.y, 0) / data.length
  }, [data])

  return (
    <div className={cn('relative rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden', className)}>
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
            {description && (
              <p className="text-sm text-white/50 mt-1 leading-relaxed">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/40 border border-white/10 px-2 py-1 rounded bg-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Top Left = Best Value
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pt-4 h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 50, left: 20 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="Cost"
              scale="log"
              domain={['auto', 'auto']}
              label={{
                value: 'Cost (USD / 1M tokens) →',
                position: 'insideBottom',
                offset: -5,
                fill: 'rgba(255,255,255,0.72)',
                fontSize: 11,
                fontWeight: 600,
              }}
              tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }}
              tickFormatter={(v) => `$${v}`}
              axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Index"
              label={{
                value: '← Motia Index',
                angle: -90,
                position: 'insideLeft',
                fill: 'rgba(255,255,255,0.72)',
                fontSize: 11,
                fontWeight: 600,
                dx: -5,
              }}
              tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }}
              domain={[0, 100]}
              axisLine={{ stroke: 'rgba(255,255,255,0.10)' }}
              tickLine={false}
            />
            <ReferenceLine
              y={avgPerformance}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="5 5"
              label={{
                value: 'Avg',
                position: 'right',
                fill: 'rgba(255,255,255,0.3)',
                fontSize: 10,
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload
                  return (
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-xs shadow-2xl min-w-[180px]">
                      <div className="font-semibold text-white mb-2 text-sm">{d.label}</div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-white/50">Motia Index</span>
                          <span className="text-emerald-400 font-medium">{d.y}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Input</span>
                          <span className="text-white/70">${d.inputPrice}/1M</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/50">Output</span>
                          <span className="text-white/70">${d.outputPrice}/1M</span>
                        </div>
                        <div className="pt-1.5 mt-1.5 border-t border-white/10 flex justify-between">
                          <span className="text-white/50">Provider</span>
                          <span className="text-white/70 capitalize">{d.provider}</span>
                        </div>
                      </div>
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
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={2}
                  r={8}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="px-6 pb-4 flex flex-wrap gap-4 border-t border-white/5 pt-3">
        {Object.entries(providerColors).map(([provider, color]) => (
          <div key={provider} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-white/50 capitalize">{provider}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ----------------------------------------------------------------------
// Model Filter Component
// ----------------------------------------------------------------------

type ModelFilterProps = {
  rows: BenchModelRow[]
  hiddenModels: Set<string>
  onToggle: (id: string) => void
  onShowAll: () => void
}

export const ModelFilter: React.FC<ModelFilterProps> = ({ rows, hiddenModels, onToggle, onShowAll }) => {
  const providers = useMemo(() => {
    const grouped: Record<string, BenchModelRow[]> = {}
    rows.forEach((r) => {
      if (!grouped[r.provider]) grouped[r.provider] = []
      grouped[r.provider].push(r)
    })
    return grouped
  }, [rows])

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden animate-in slide-in-from-top-4 duration-300">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Filter size={18} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Model Selection</h3>
            <p className="text-xs text-white/40 font-medium uppercase tracking-wider mt-0.5">Toggle models to compare performance</p>
          </div>
        </div>
        <button
          onClick={onShowAll}
          className="px-4 py-2 text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all shadow-lg shadow-emerald-500/5"
        >
          Reset All
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
        {Object.entries(providers).map(([provider, models]) => (
          <div key={provider} className="flex flex-col">
            <div
              className="flex items-center gap-2 mb-4 pb-2 border-b-2"
              style={{ borderColor: providerColors[provider] + '40' }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full ring-4 ring-offset-2 ring-offset-[#0a0a0a]"
                style={{ backgroundColor: providerColors[provider] }}
              />
              <span className="text-sm font-black text-white uppercase tracking-widest">{provider}</span>
              <span className="text-[10px] font-bold text-white/30 ml-auto bg-white/5 px-2 py-0.5 rounded-full">
                {models.filter((m) => !hiddenModels.has(m.id)).length}/{models.length}
              </span>
            </div>
            <div className="space-y-3">
              {models.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-3 cursor-pointer group select-none"
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={!hiddenModels.has(m.id)}
                      onChange={() => onToggle(m.id)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-white/10 bg-white/5 transition-all checked:border-emerald-500/50 checked:bg-emerald-500/10 hover:border-white/20"
                    />
                    <div className="pointer-events-none absolute text-emerald-500 opacity-0 transition-opacity peer-checked:opacity-100">
                      <svg className="h-3.5 w-3.5 stroke-[4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium transition-all duration-200',
                      hiddenModels.has(m.id)
                        ? 'text-white/20 line-through'
                        : 'text-white/70 group-hover:text-white group-hover:translate-x-0.5'
                    )}
                  >
                    {m.model}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


