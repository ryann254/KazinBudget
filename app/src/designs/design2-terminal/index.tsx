import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import {
  userData, taxBreakdown, expenseBreakdown, dashboardSummary,
  expenseChartData, growthProjections, growthChartData,
  salaryComparison, salaryDistributionData, travelDetails,
  rentDetails, foodDetails, formatKES, growthAssumptions
} from '../../data/dummy'
import {
  Terminal, Home, BarChart3, TrendingUp, Users,
  ArrowLeft, DollarSign, Cpu, Activity, Wifi
} from 'lucide-react'

type TabKey = 'input' | 'dashboard' | 'growth' | 'comparison'

const C = {
  bg: '#0a0a0a', bgLight: '#0D1117', bgCard: '#0f1318',
  green: '#00FF41', greenDim: '#00cc34', greenDark: '#003d10',
  amber: '#FFB000', cyan: '#00D4FF', red: '#ff4444',
  textDim: '#4a7a3b', borderDim: '#1a3a12',
}

const PIE_COLORS = [
  '#00FF41', '#00cc34', '#009926', '#006619', '#39FF14', '#2db811',
  '#FFB000', '#cc8d00', '#00D4FF', '#009bb8', '#1a7a3b', '#4aff6e', '#FFB000',
]

const tooltipStyle = {
  background: C.bgCard, border: `1px solid ${C.green}`, borderRadius: 4,
  fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.green,
}

const scanlineStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  pointerEvents: 'none', zIndex: 9999, opacity: 0.3,
  background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
}

export default function Design2Terminal() {
  const [activeTab, setActiveTab] = useState<TabKey>('input')
  const [bootDone, setBootDone] = useState(false)
  const [time, setTime] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => setBootDone(true), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(i)
  }, [])

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; cmd: string }[] = [
    { key: 'input', label: 'USER_INPUT', icon: <Terminal size={14} />, cmd: '$ cd /input' },
    { key: 'dashboard', label: 'SYS_DASHBOARD', icon: <BarChart3 size={14} />, cmd: '$ cd /dashboard' },
    { key: 'growth', label: 'GROWTH_PROJ', icon: <TrendingUp size={14} />, cmd: '$ cd /growth' },
    { key: 'comparison', label: 'MARKET_INTEL', icon: <Users size={14} />, cmd: '$ cd /comparison' },
  ]

  const sessionId = 'KB-' + Math.random().toString(36).substring(2, 8).toUpperCase()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Fira+Code:wght@300;400;500;600;700&display=swap');
        @keyframes blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
        @keyframes glowPulse {
          0%,100%{text-shadow:0 0 4px #00FF41,0 0 8px #00FF4180}
          50%{text-shadow:0 0 8px #00FF41,0 0 20px #00FF4160}
        }
        .cursor-blink::after { content:'█'; animation:blink 1s step-end infinite; color:#00FF41; margin-left:2px }
        .glow-text { animation:glowPulse 3s ease-in-out infinite }
        .term-card { background:#0f1318; border:1px dashed #00FF41; font-family:'IBM Plex Mono','Fira Code',monospace }
        .term-scrollbar::-webkit-scrollbar { width:6px }
        .term-scrollbar::-webkit-scrollbar-track { background:#0a0a0a }
        .term-scrollbar::-webkit-scrollbar-thumb { background:#1a3a12; border-radius:3px }
        .term-scrollbar::-webkit-scrollbar-thumb:hover { background:#00FF41 }
        .recharts-text { fill:#00FF41 !important; font-family:'IBM Plex Mono',monospace !important; font-size:10px !important }
        .recharts-cartesian-grid line { stroke:#1a3a12 !important }
      `}</style>

      <div style={scanlineStyle} />

      <div
        className="min-h-screen w-full term-scrollbar"
        style={{
          background: C.bg, fontFamily: "'IBM Plex Mono', 'Fira Code', monospace", color: C.green,
          boxShadow: '0 0 60px rgba(0,255,65,0.08), inset 0 0 60px rgba(0,255,65,0.03)',
        }}
      >
        {/* Title Bar */}
        <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-2"
          style={{ background: '#161b22', borderBottom: `1px solid ${C.borderDim}` }}>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: C.red }} />
              <div className="w-3 h-3 rounded-full" style={{ background: C.amber }} />
              <div className="w-3 h-3 rounded-full" style={{ background: C.green }} />
            </div>
            <span className="ml-3 text-xs" style={{ color: C.textDim }}>
              <span style={{ color: C.green }}>kazibudget</span>@<span style={{ color: C.cyan }}>nairobi</span>:~$
            </span>
            <span className="text-xs cursor-blink" style={{ color: C.green }} />
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1 text-xs" style={{ color: C.textDim }}>
              <Cpu size={12} /><span>v2.0.1</span>
            </div>
            <button onClick={() => navigate('/')}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:opacity-80"
              style={{ color: C.amber, border: `1px solid ${C.borderDim}`, background: 'transparent' }}>
              <ArrowLeft size={12} /><span>$ cd /home</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-0 border-b" style={{ background: C.bgLight, borderColor: C.borderDim }}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs transition-all"
              style={{
                color: activeTab === tab.key ? C.green : C.textDim,
                background: activeTab === tab.key ? C.bg : 'transparent',
                borderBottom: activeTab === tab.key ? `2px solid ${C.green}` : '2px solid transparent',
              }}>
              {tab.icon}
              <span className="hidden md:inline">{tab.cmd}</span>
              <span className="md:hidden">{tab.label}</span>
              {activeTab === tab.key && <span style={{ animation: 'blink 1s step-end infinite', color: C.green }}>_</span>}
            </button>
          ))}
        </div>

        {!bootDone && (
          <div className="p-4 text-xs" style={{ color: C.textDim }}>
            <p>[BOOT] Loading KaziBudget Terminal v2.0.1...</p>
            <p>[INIT] Connecting to salary database...</p>
            <p>[OK] Session established.</p>
          </div>
        )}

        <div className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto pb-16">
          {activeTab === 'input' && <InputTab />}
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'growth' && <GrowthTab />}
          {activeTab === 'comparison' && <ComparisonTab />}
        </div>

        {/* Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between px-4 py-1.5 text-xs z-50"
          style={{ background: '#161b22', borderTop: `1px solid ${C.borderDim}`, color: C.textDim }}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Wifi size={10} style={{ color: C.green }} />
              <span style={{ color: C.green }}>CONNECTED</span>
            </span>
            <span className="hidden sm:inline">| SID: {sessionId}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1"><Activity size={10} /> LATENCY: 12ms</span>
            <span>{time.toISOString().replace('T', ' ').substring(0, 19)} EAT</span>
          </div>
        </div>
      </div>
    </>
  )
}

/* ── Helpers ────────────────────────────────────────────── */

function Header({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm font-bold glow-text tracking-wider" style={{ color: C.green }}>
          {'═'.repeat(3)} {title} {'═'.repeat(3)}
        </span>
      </div>
      <div className="text-xs" style={{ color: C.textDim }}>{'─'.repeat(50)}</div>
    </div>
  )
}

function AsciiTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  const w = headers.map((h, i) => Math.max(h.length, ...rows.map(r => (r[i] || '').length)) + 2)
  const sep = '+' + w.map(n => '-'.repeat(n)).join('+') + '+'
  const fmt = (cells: string[]) => '|' + cells.map((c, i) => c.padEnd(w[i])).join('|') + '|'
  return (
    <pre className="text-xs overflow-x-auto" style={{ color: C.green }}>
      {sep + '\n' + fmt(headers) + '\n' + sep + '\n' + rows.map(r => fmt(r) + '\n').join('') + sep}
    </pre>
  )
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span style={{ color: C.amber }}>$</span>
      <span style={{ color: C.textDim }}>{label}=</span>
      <span className={highlight ? 'glow-text font-bold' : ''} style={{ color: highlight ? C.green : C.cyan }}>
        "{value}"
      </span>
    </div>
  )
}

function Sys({ text }: { text: string }) {
  return (
    <div className="text-xs mb-2" style={{ color: C.textDim }}>
      <span style={{ color: C.amber }}>[SYS]</span> {text}
    </div>
  )
}

function Cmd({ text }: { text: string }) {
  return <div className="text-xs mb-2" style={{ color: C.textDim }}>$ {text}</div>
}

function AmberLabel({ text }: { text: string }) {
  return <div className="text-xs font-bold mb-3" style={{ color: C.amber }}>{'// '}--- {text} ---</div>
}

/* ── INPUT TAB ──────────────────────────────────────────── */

function InputTab() {
  return (
    <div className="space-y-6">
      <Header title="USER_INPUT" icon={<Terminal size={16} style={{ color: C.green }} />} />
      <Sys text='Enter your salary configuration below. Fields prefixed with $ accept user input.' />

      <div className="term-card rounded p-4 space-y-3">
        <AmberLabel text="PROFILE CONFIG" />
        <Field label="USER_NAME" value={userData.name} />
        <Field label="COMPANY" value={userData.company} />
        <Field label="WORK_LOCATION" value={userData.companyLocation} />
        <Field label="HOME_LOCATION" value={userData.residentialArea} />
        <Field label="EXPERIENCE_YRS" value={String(userData.yearsOfExperience)} />
        <Field label="MONTHLY_SALARY" value={formatKES(userData.monthlySalary)} highlight />
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="TAX DEDUCTIONS (AUTO-CALCULATED)" />
        <pre className="text-xs leading-relaxed" style={{ color: C.green }}>
{`  $ calc --paye          => ${formatKES(taxBreakdown.paye)}
  $ calc --nssf          => ${formatKES(taxBreakdown.nssf)}
  $ calc --shif          => ${formatKES(taxBreakdown.shif)}
  $ calc --housing_levy  => ${formatKES(taxBreakdown.housingLevy)}
  $ calc --relief        => -${formatKES(taxBreakdown.personalRelief)}
  ${'─'.repeat(42)}
  $ calc --total_tax     => `}<span style={{ color: C.amber }}>{formatKES(taxBreakdown.totalDeductions)}</span>{`
  $ calc --net_after_tax => `}<span style={{ color: C.cyan }}>{formatKES(taxBreakdown.netAfterTax)}</span>
        </pre>
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="MONTHLY EXPENSES" />
        <div className="text-xs mb-2" style={{ color: C.textDim }}>[AUTO-DETECTED]</div>
        <pre className="text-xs leading-relaxed" style={{ color: C.green }}>
{`  > rent     --type="1BR" --area="${rentDetails.area}"    => ${formatKES(expenseBreakdown.rent.amount)}
  > food     --zone="${foodDetails.area}"                => ${formatKES(expenseBreakdown.food.amount)}
  > transport --mode="Matatu"                     => ${formatKES(expenseBreakdown.transport.amount)}`}
        </pre>
        <div className="text-xs mt-4 mb-2" style={{ color: C.textDim }}>[USER-DEFINED]</div>
        <pre className="text-xs leading-relaxed" style={{ color: C.green }}>
          {expenseBreakdown.custom.map(e => `  $ add_expense --name="${e.name}" --amt=${e.amount}`).join('\n')}
        </pre>
        <div className="mt-4 pt-3" style={{ borderTop: `1px dashed ${C.borderDim}` }}>
          <pre className="text-xs" style={{ color: C.green }}>
{`  ${'─'.repeat(42)}
  $ sum --all_expenses   => `}<span style={{ color: C.amber }}>{formatKES(dashboardSummary.totalExpenses)}</span>{`
  $ calc --take_home     => `}<span className="glow-text">{formatKES(dashboardSummary.takeHome)}</span>
          </pre>
        </div>
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="COMMUTE DATA" />
        <Cmd text={`route --from="${travelDetails.origin}" --to="${travelDetails.destination}"`} />
        <pre className="text-xs leading-relaxed mb-2" style={{ color: C.green }}>
{`  DISTANCE: ${travelDetails.distance}
  ETA:      ${travelDetails.duration}`}
        </pre>
        <AsciiTable
          headers={[' MODE ', ' TRIP_COST ', ' MONTHLY ']}
          rows={travelDetails.modes.map(m => [` ${m.mode} `, ` ${formatKES(m.costPerTrip)} `, ` ${formatKES(m.monthly)} `])}
        />
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="FOOD RECON" />
        <Cmd text={`scan --area="${foodDetails.area}" --type=food`} />
        <AsciiTable
          headers={[' VENDOR ', ' AVG_MEAL ']}
          rows={foodDetails.nearbyRestaurants.map(r => [` ${r.name} `, ` ${formatKES(r.avgMeal)} `])}
        />
        <pre className="text-xs mt-2" style={{ color: C.textDim }}>
{`  [INFO] Avg daily: ${formatKES(foodDetails.dailyCost)} x ${foodDetails.workingDays} days = ${formatKES(foodDetails.monthlyCost)}/mo`}
        </pre>
      </div>
    </div>
  )
}

/* ── DASHBOARD TAB ──────────────────────────────────────── */

function DashboardTab() {
  const summaryRows = [
    ['Gross Salary', formatKES(dashboardSummary.grossSalary), 'INPUT'],
    ['Total Deductions', `-${formatKES(dashboardSummary.totalDeductions)}`, 'TAX'],
    ['Total Expenses', `-${formatKES(dashboardSummary.totalExpenses)}`, 'EXPENSE'],
    ['Take Home', formatKES(dashboardSummary.takeHome), 'NET'],
  ]

  return (
    <div className="space-y-6">
      <Header title="SYS_DASHBOARD" icon={<BarChart3 size={16} style={{ color: C.green }} />} />
      <Sys text={`Financial overview for ${userData.name} @ ${userData.company}`} />

      <div className="term-card rounded p-4">
        <pre className="text-xs mb-3" style={{ color: C.amber }}>
{`  ╔══════════════════════════════════════╗
  ║   MONTHLY FINANCIAL SUMMARY          ║
  ╚══════════════════════════════════════╝`}
        </pre>
        <AsciiTable headers={[' ITEM ', ' AMOUNT ', ' TYPE ']}
          rows={summaryRows.map(r => [` ${r[0]} `, ` ${r[1]} `, ` ${r[2]} `])} />
        <div className="mt-3 text-xs" style={{ color: C.textDim }}>
          [INFO] Savings rate: {((dashboardSummary.takeHome / dashboardSummary.grossSalary) * 100).toFixed(1)}% of gross
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="term-card rounded p-4">
          <AmberLabel text="ALLOCATION CHART" />
          <Cmd text="render --chart=pie --dataset=expenses" />
          <div className="w-full" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                  dataKey="value" stroke={C.bg} strokeWidth={2}>
                  {expenseChartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatKES(v), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="term-card rounded p-4">
          <AmberLabel text="EXPENSE LOG" />
          <Cmd text="cat /var/log/expenses.log | sort -k2 -rn" />
          <div className="space-y-1 max-h-52 overflow-y-auto term-scrollbar">
            {[...expenseChartData].sort((a, b) => b.value - a.value).map((item, i) => {
              const pct = ((item.value / dashboardSummary.grossSalary) * 100).toFixed(1)
              const barLen = Math.round((item.value / dashboardSummary.grossSalary) * 20)
              return (
                <div key={i} className="text-xs flex items-center gap-2">
                  <span style={{ color: C.textDim }}>[{String(i + 1).padStart(2, '0')}]</span>
                  <span style={{ color: PIE_COLORS[i % PIE_COLORS.length], minWidth: 125, display: 'inline-block' }}>
                    {item.name.padEnd(15)}
                  </span>
                  <span style={{ color: C.green }}>{'\u2588'.repeat(barLen) + '\u2591'.repeat(20 - barLen)}</span>
                  <span style={{ color: C.amber, minWidth: 40, textAlign: 'right', display: 'inline-block' }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="TAX DEDUCTION BREAKDOWN" />
        <Cmd text="kra --status --verbose" />
        <AsciiTable headers={[' DEDUCTION ', ' AMOUNT ', ' % OF GROSS ']}
          rows={[
            [' PAYE ', ` ${formatKES(taxBreakdown.paye)} `, ` ${((taxBreakdown.paye / taxBreakdown.grossSalary) * 100).toFixed(1)}% `],
            [' NSSF ', ` ${formatKES(taxBreakdown.nssf)} `, ` ${((taxBreakdown.nssf / taxBreakdown.grossSalary) * 100).toFixed(1)}% `],
            [' SHIF ', ` ${formatKES(taxBreakdown.shif)} `, ` ${((taxBreakdown.shif / taxBreakdown.grossSalary) * 100).toFixed(1)}% `],
            [' Housing Levy ', ` ${formatKES(taxBreakdown.housingLevy)} `, ` ${((taxBreakdown.housingLevy / taxBreakdown.grossSalary) * 100).toFixed(1)}% `],
            [' Personal Relief ', ` -${formatKES(taxBreakdown.personalRelief)} `, ` -${((taxBreakdown.personalRelief / taxBreakdown.grossSalary) * 100).toFixed(1)}% `],
          ]} />
        <pre className="text-xs mt-2" style={{ color: C.green }}>
{`  TOTAL_DEDUCTIONS: `}<span style={{ color: C.amber }}>{formatKES(taxBreakdown.totalDeductions)}</span>{` (${((taxBreakdown.totalDeductions / taxBreakdown.grossSalary) * 100).toFixed(1)}% effective rate)`}
        </pre>
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="RENT DATABASE" />
        <Cmd text={`query --db=rent --area="${rentDetails.area}" --zone="${rentDetails.zone}"`} />
        <AsciiTable headers={[' TYPE ', ' MEDIAN ', ' RANGE ']}
          rows={rentDetails.options.map(o => [` ${o.type} `, ` ${formatKES(o.median)} `, ` KES ${o.range} `])} />
        <div className="text-xs mt-2" style={{ color: C.textDim }}>
          [SRC] {rentDetails.source} | Updated: {rentDetails.lastUpdated}
        </div>
      </div>
    </div>
  )
}

/* ── GROWTH TAB ─────────────────────────────────────────── */

function GrowthTab() {
  const milestones = [
    { key: 'current', data: growthProjections.current },
    { key: 'year3', data: growthProjections.year3 },
    { key: 'year5', data: growthProjections.year5 },
    { key: 'year7', data: growthProjections.year7 },
    { key: 'year10', data: growthProjections.year10 },
  ]

  return (
    <div className="space-y-6">
      <Header title="GROWTH_PROJECTIONS" icon={<TrendingUp size={16} style={{ color: C.green }} />} />
      <div className="text-xs" style={{ color: C.textDim }}>
        <span style={{ color: C.amber }}>[SYS]</span> Running salary growth simulation...
        <span style={{ color: C.green }}> DONE</span>
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="SIMULATION PARAMS" />
        <pre className="text-xs leading-relaxed" style={{ color: C.green }}>
{`  $ set SALARY_GROWTH   = ${growthAssumptions.salaryGrowthRate}%/yr
  $ set RENT_INFLATION   = ${growthAssumptions.rentInflation}%/yr
  $ set FOOD_INFLATION   = ${growthAssumptions.foodInflation}%/yr
  $ set TRANSPORT_INFL   = ${growthAssumptions.transportInflation}%/yr
  $ set GENERAL_CPI      = ${growthAssumptions.generalCPI}%/yr
  ${'─'.repeat(42)}
  $ simulate --years=10 --mode=compound`}
        </pre>
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="SALARY TRAJECTORY" />
        <Cmd text="plot --type=line --data=growth --glow=on" />
        <div className="w-full" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderDim} />
              <XAxis dataKey="year" tickFormatter={(v) => `Y${v}`} stroke={C.borderDim}
                tick={{ fill: C.green, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} stroke={C.borderDim}
                tick={{ fill: C.green, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle}
                formatter={(v: number, n: string) => [formatKES(v), n]} labelFormatter={(v) => `Year ${v}`} />
              <Line type="monotone" dataKey="salary" stroke={C.green} strokeWidth={2} name="Salary"
                dot={{ fill: C.green, r: 3, strokeWidth: 0 }} style={{ filter: 'drop-shadow(0 0 4px #00FF41)' }} />
              <Line type="monotone" dataKey="takeHome" stroke={C.cyan} strokeWidth={2} name="Take Home"
                dot={{ fill: C.cyan, r: 3, strokeWidth: 0 }} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="expenses" stroke={C.amber} strokeWidth={2} name="Expenses"
                dot={{ fill: C.amber, r: 3, strokeWidth: 0 }} strokeDasharray="3 3" />
              <Line type="monotone" dataKey="taxes" stroke={C.red} strokeWidth={1.5} name="Taxes"
                dot={{ fill: C.red, r: 2, strokeWidth: 0 }} strokeDasharray="2 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-xs">
          {[['Salary', C.green], ['Take Home', C.cyan], ['Expenses', C.amber], ['Taxes', C.red]].map(([l, c]) => (
            <span key={l}><span style={{ color: c as string }}>{'\u2588'}</span> {l}</span>
          ))}
        </div>
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="MILESTONE LOG" />
        <Cmd text="cat /var/log/milestones.log" />
        <div className="space-y-2">
          {milestones.map(({ key, data }) => {
            const yearLabel = `YEAR_${String(data.year).padStart(2, '0')}`
            const growth = data.year === 0 ? 0 : ((data.salary - growthProjections.current.salary) / growthProjections.current.salary * 100)
            return (
              <div key={key} className="text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span style={{ color: C.textDim }}>[{new Date().toISOString().split('T')[0]}]</span>
                  <span style={{ color: C.cyan }}>[{yearLabel}]</span>
                  <span style={{ color: C.green }}>SALARY: {formatKES(data.salary)}</span>
                  <span style={{ color: C.amber }}>NET: {formatKES(data.takeHome)}</span>
                  {data.year > 0 && <span style={{ color: C.green }}>(+{growth.toFixed(1)}%)</span>}
                </div>
                <div className="ml-4" style={{ color: C.textDim }}>
                  {'\u2514'} TAX: {formatKES(data.totalTax)} | EXP: {formatKES(data.totalExpenses)} | DISPOSABLE: {formatKES(data.takeHome)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="STACKED COMPOSITION" />
        <Cmd text="plot --type=area --stacked --data=growth_breakdown" />
        <div className="w-full" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderDim} />
              <XAxis dataKey="year" tickFormatter={(v) => `Y${v}`} stroke={C.borderDim}
                tick={{ fill: C.green, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} stroke={C.borderDim}
                tick={{ fill: C.green, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle}
                formatter={(v: number, n: string) => [formatKES(v), n]} labelFormatter={(v) => `Year ${v}`} />
              <Area type="monotone" dataKey="takeHome" stackId="1" stroke={C.green}
                fill={C.greenDark} fillOpacity={0.6} name="Take Home" />
              <Area type="monotone" dataKey="expenses" stackId="1" stroke={C.amber}
                fill="#3d2e00" fillOpacity={0.5} name="Expenses" />
              <Area type="monotone" dataKey="taxes" stackId="1" stroke={C.red}
                fill="#3d0000" fillOpacity={0.4} name="Taxes" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* ── COMPARISON TAB ─────────────────────────────────────── */

function ComparisonTab() {
  const pct = salaryComparison.percentile
  const barFilled = Math.round(pct / 5)
  const progressBar = '\u2588'.repeat(barFilled) + '\u2591'.repeat(20 - barFilled)

  return (
    <div className="space-y-6">
      <Header title="MARKET_INTEL" icon={<Users size={16} style={{ color: C.green }} />} />
      <div className="text-xs" style={{ color: C.textDim }}>
        <span style={{ color: C.amber }}>[SYS]</span> Querying Nairobi salary database...
        <span style={{ color: C.green }}> {salaryComparison.sampleSize} records found</span>
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="YOUR MARKET POSITION" />
        <pre className="text-xs leading-loose" style={{ color: C.green }}>
{`  ROLE:        ${salaryComparison.role}
  LOCATION:    ${salaryComparison.location}
  EXPERIENCE:  ${salaryComparison.experienceBand}
  SAMPLE_SIZE: ${salaryComparison.sampleSize} respondents
  CONFIDENCE:  ${salaryComparison.confidence.toUpperCase()}
  ${'─'.repeat(42)}
  YOUR_SALARY: ${formatKES(salaryComparison.userSalary)}`}
        </pre>
        <div className="mt-4 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: C.textDim }}>PERCENTILE:</span>
            <span style={{ color: C.green }}>[{progressBar}]</span>
            <span style={{ color: C.amber, fontWeight: 'bold' }}>{pct}%</span>
          </div>
          <div style={{ color: C.amber }}>[VERDICT] {salaryComparison.verdictText}</div>
        </div>
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="MARKET STATISTICS" />
        <Cmd text="analyze --mode=distribution --verbose" />
        <AsciiTable headers={[' METRIC ', ' VALUE ', ' VS YOU ']}
          rows={[
            [' 25th Percentile ', ` ${formatKES(salaryComparison.p25)} `, ` ${salaryComparison.userSalary > salaryComparison.p25 ? '+' : ''}${formatKES(salaryComparison.userSalary - salaryComparison.p25)} `],
            [' Median ', ` ${formatKES(salaryComparison.marketMedian)} `, ` ${salaryComparison.userSalary > salaryComparison.marketMedian ? '+' : ''}${formatKES(salaryComparison.userSalary - salaryComparison.marketMedian)} `],
            [' Mean ', ` ${formatKES(salaryComparison.marketMean)} `, ` ${salaryComparison.userSalary > salaryComparison.marketMean ? '+' : ''}${formatKES(salaryComparison.userSalary - salaryComparison.marketMean)} `],
            [' 75th Percentile ', ` ${formatKES(salaryComparison.p75)} `, ` ${salaryComparison.userSalary > salaryComparison.p75 ? '+' : ''}${formatKES(salaryComparison.userSalary - salaryComparison.p75)} `],
          ]} />
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="SALARY DISTRIBUTION SCAN" />
        <Cmd text="render --chart=area --data=distribution --highlight=user" />
        <div className="w-full" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salaryDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.borderDim} />
              <XAxis dataKey="salary" tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} stroke={C.borderDim}
                tick={{ fill: C.green, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }} />
              <YAxis stroke={C.borderDim}
                tick={{ fill: C.green, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle}
                formatter={(v: number) => [v, 'Frequency']} labelFormatter={(v) => formatKES(v)} />
              <defs>
                <linearGradient id="termGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.green} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="frequency" stroke={C.green} strokeWidth={2}
                fill="url(#termGreenGrad)" name="Frequency" style={{ filter: 'drop-shadow(0 0 6px #00FF4180)' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-xs">
          <span><span style={{ color: C.cyan }}>{'\u25C6'}</span> YOU: {formatKES(salaryComparison.userSalary)}</span>
          <span><span style={{ color: C.amber }}>{'\u25C6'}</span> MEDIAN: {formatKES(salaryComparison.marketMedian)}</span>
          <span><span style={{ color: C.textDim }}>{'\u25C6'}</span> P25: {formatKES(salaryComparison.p25)}</span>
          <span><span style={{ color: C.textDim }}>{'\u25C6'}</span> P75: {formatKES(salaryComparison.p75)}</span>
        </div>
      </div>

      <div className="term-card rounded p-4">
        <AmberLabel text="TARGET ANALYSIS" />
        <Cmd text="calc --target-gaps --verbose" />
        <div className="space-y-3">
          {[
            { label: 'REACH MEDIAN', target: salaryComparison.marketMedian, pctile: '50th' },
            { label: 'REACH P75', target: salaryComparison.p75, pctile: '75th' },
            { label: 'REACH 200K', target: 200000, pctile: '~80th' },
          ].map((t, i) => {
            const gap = t.target - salaryComparison.userSalary
            const gapPct = ((gap / salaryComparison.userSalary) * 100).toFixed(1)
            const filled = Math.min(20, Math.round((salaryComparison.userSalary / t.target) * 20))
            const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(20 - filled)
            return (
              <div key={i} className="text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: C.amber }}>[{t.pctile}]</span>
                  <span style={{ color: C.green }}>{t.label}: {formatKES(t.target)}</span>
                </div>
                <div className="ml-4 flex flex-wrap items-center gap-2">
                  <span style={{ color: C.textDim }}>PROGRESS:</span>
                  <span style={{ color: gap > 0 ? C.amber : C.green }}>[{bar}]</span>
                  <span style={{ color: C.textDim }}>
                    GAP: {gap > 0 ? `+${formatKES(gap)} (+${gapPct}%)` : 'TARGET MET'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="term-card rounded p-4">
        <div className="text-xs" style={{ color: C.textDim }}>
          <div className="mb-1"><span style={{ color: C.amber }}>[INTEL]</span> Data sourced from {salaryComparison.sampleSize} anonymous salary reports</div>
          <div className="mb-1"><span style={{ color: C.amber }}>[CONF]</span> Confidence level: <span style={{ color: C.cyan }}>{salaryComparison.confidence.toUpperCase()}</span></div>
          <div><span style={{ color: C.amber }}>[SYNC]</span> Last updated: {salaryComparison.lastUpdated}</div>
        </div>
      </div>
    </div>
  )
}
