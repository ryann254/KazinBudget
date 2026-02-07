import { useState } from 'react'
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
  Home, User, BarChart3, TrendingUp, Users,
  Zap, Star, AlertTriangle, ThumbsUp, ChevronRight
} from 'lucide-react'

type TabKey = 'input' | 'dashboard' | 'growth' | 'comparison'

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'input', label: 'INPUT', icon: <User size={18} /> },
  { key: 'dashboard', label: 'DASHBOARD', icon: <BarChart3 size={18} /> },
  { key: 'growth', label: 'GROWTH', icon: <TrendingUp size={18} /> },
  { key: 'comparison', label: 'COMPARE', icon: <Users size={18} /> },
]

const COLORS = {
  black: '#0D1B2A',
  cream: '#FEFAE0',
  red: '#E63946',
  blue: '#1D3557',
  yellow: '#F4D35E',
  white: '#FFFFFF',
  muted: '#457B9D',
  teal: '#2A9D8F',
} as const

const CHART_COLORS = [COLORS.red, COLORS.blue, COLORS.yellow, COLORS.muted, COLORS.teal, '#E76F51', '#264653', '#F4A261']

const brutalistCard = {
  border: `3px solid ${COLORS.black}`,
  boxShadow: `4px 4px 0 ${COLORS.black}`,
}

const brutalistCardHover = {
  border: `3px solid ${COLORS.black}`,
  boxShadow: `6px 6px 0 ${COLORS.black}`,
  transform: 'translate(-2px, -2px)',
}

export default function Design5Brutalist() {
  const [activeTab, setActiveTab] = useState<TabKey>('input')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [showNavScroll, setShowNavScroll] = useState(true)

  const cardStyle = (id: string, bg: string = COLORS.white) => ({
    ...((hoveredCard === id) ? brutalistCardHover : brutalistCard),
    backgroundColor: bg,
    transition: 'all 0.15s ease',
    cursor: 'default',
  })

  // ─── INPUT TAB ────────────────────────────────────────────
  const renderInput = () => (
    <div className="space-y-12">
      {/* Personal Info */}
      <div className="relative">
        <div
          className="absolute -top-4 -left-2 px-3 py-1 font-extrabold text-xs uppercase z-10"
          style={{
            border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.yellow,
            transform: 'rotate(-2deg)', fontFamily: "'Work Sans', sans-serif",
            letterSpacing: '0.15em',
          }}
        >
          PERSONAL INFO
        </div>
        <div className="p-6 sm:p-8 pt-10" style={{ ...brutalistCard, backgroundColor: COLORS.white, borderLeft: `4px solid ${COLORS.blue}` }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'FULL NAME', value: userData.name },
              { label: 'COMPANY', value: userData.company },
              { label: 'WORK LOCATION', value: userData.companyLocation },
              { label: 'HOME AREA', value: userData.residentialArea },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-extrabold uppercase mb-2"
                  style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em' }}>{field.label}</label>
                <input
                  type="text" readOnly value={field.value}
                  className="w-full px-4 py-3 font-semibold text-sm outline-none"
                  style={{ border: `3px solid ${COLORS.black}`, backgroundColor: COLORS.white, fontFamily: "'Work Sans', sans-serif" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salary Section */}
      <div className="relative">
        <div
          className="absolute -top-4 right-4 px-3 py-1 font-extrabold text-xs uppercase z-10"
          style={{
            border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.red, color: COLORS.white,
            transform: 'rotate(1.5deg)', fontFamily: "'Work Sans', sans-serif",
            letterSpacing: '0.15em',
          }}
        >
          SALARY & TAX
        </div>
        <div className="p-6 sm:p-8 pt-10" style={{ ...brutalistCard, backgroundColor: COLORS.white, borderLeft: `4px solid ${COLORS.red}` }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2"
                style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em' }}>GROSS SALARY (KES)</label>
              <input
                type="text" readOnly value={formatKES(userData.monthlySalary)}
                className="w-full px-4 py-3 font-bold text-lg outline-none"
                style={{ border: `3px solid ${COLORS.black}`, backgroundColor: COLORS.white, fontFamily: "'Work Sans', sans-serif" }}
              />
            </div>
            <div>
              <label className="block text-xs font-extrabold uppercase mb-2"
                style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em' }}>EXPERIENCE</label>
              <input
                type="text" readOnly value={`${userData.yearsOfExperience} years`}
                className="w-full px-4 py-3 font-bold text-lg outline-none"
                style={{ border: `3px solid ${COLORS.black}`, backgroundColor: COLORS.white, fontFamily: "'Work Sans', sans-serif" }}
              />
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'PAYE', amount: taxBreakdown.paye, bg: COLORS.yellow },
              { label: 'NSSF', amount: taxBreakdown.nssf, bg: COLORS.blue },
              { label: 'SHIF', amount: taxBreakdown.shif, bg: COLORS.teal },
              { label: 'HOUSING', amount: taxBreakdown.housingLevy, bg: COLORS.muted },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 text-center"
                style={{
                  border: `2px solid ${COLORS.black}`, backgroundColor: item.bg,
                  color: item.bg === COLORS.yellow ? COLORS.black : COLORS.white,
                }}
              >
                <div className="text-xs font-extrabold uppercase" style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em' }}>
                  {item.label}
                </div>
                <div className="text-sm font-bold mt-1" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  {formatKES(item.amount)}
                </div>
              </div>
            ))}
          </div>

          {/* Calculate Budget Button */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full sm:w-auto px-10 py-4 font-extrabold text-sm uppercase"
              style={{
                border: `3px solid ${COLORS.black}`,
                backgroundColor: COLORS.red,
                color: COLORS.white,
                fontFamily: "'Work Sans', sans-serif",
                letterSpacing: '0.15em',
                boxShadow: `4px 4px 0 ${COLORS.black}`,
                cursor: 'pointer',
                transition: 'all 0.1s ease',
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `1px 1px 0 ${COLORS.black}`;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(3px, 3px)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `4px 4px 0 ${COLORS.black}`;
                (e.currentTarget as HTMLButtonElement).style.transform = 'none';
              }}
            >
              CALCULATE BUDGET
            </button>
          </div>

          <div className="mt-5 p-4 text-center font-bold text-lg"
            style={{ border: `3px solid ${COLORS.black}`, backgroundColor: COLORS.black, color: COLORS.yellow, fontFamily: "'Work Sans', sans-serif", fontWeight: 900 }}>
            NET AFTER TAX: {formatKES(taxBreakdown.netAfterTax)}
          </div>
        </div>
      </div>

      {/* Commute */}
      <div className="relative">
        <div
          className="absolute -top-4 left-8 px-3 py-1 font-extrabold text-xs uppercase z-10"
          style={{
            border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.blue, color: COLORS.white,
            transform: 'rotate(-1deg)', fontFamily: "'Work Sans', sans-serif",
            letterSpacing: '0.15em',
          }}
        >
          COMMUTE
        </div>
        <div className="p-6 sm:p-8 pt-10" style={{ ...brutalistCard, backgroundColor: COLORS.white, borderLeft: `4px solid ${COLORS.yellow}` }}>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="font-bold text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
              {travelDetails.origin}
            </span>
            <span className="font-black text-lg" style={{ color: COLORS.red }}>&#8594;</span>
            <span className="font-bold text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
              {travelDetails.destination}
            </span>
            <span className="px-3 py-1 text-xs font-extrabold"
              style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.yellow, fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em' }}>
              {travelDetails.distance}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {travelDetails.modes.map((mode, i) => {
              const topBorderColors = [COLORS.red, COLORS.blue, COLORS.yellow, COLORS.teal]
              return (
                <div
                  key={mode.mode}
                  className="p-4"
                  onMouseEnter={() => setHoveredCard(`travel-${i}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    ...cardStyle(`travel-${i}`, COLORS.white),
                    borderTop: `3px solid ${topBorderColors[i % topBorderColors.length]}`,
                  }}
                >
                  <div className="text-xs font-extrabold uppercase" style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em', color: COLORS.black }}>
                    {mode.mode}
                  </div>
                  <div className="text-sm font-bold mt-2" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    {formatKES(mode.monthly)}/mo
                  </div>
                  <div className="text-xs mt-1" style={{ color: COLORS.muted }}>{formatKES(mode.costPerTrip)}/trip</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Expenses */}
      <div className="relative">
        <div
          className="absolute -top-4 right-8 px-3 py-1 font-extrabold text-xs uppercase z-10"
          style={{
            border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.teal, color: COLORS.white,
            transform: 'rotate(2deg)', fontFamily: "'Work Sans', sans-serif",
            letterSpacing: '0.15em',
          }}
        >
          MONTHLY EXPENSES
        </div>
        <div className="p-6 sm:p-8 pt-10" style={{ ...brutalistCard, backgroundColor: COLORS.white, borderLeft: `4px solid ${COLORS.teal}` }}>
          <div className="space-y-0">
            {[
              { name: expenseBreakdown.rent.label, amount: expenseBreakdown.rent.amount },
              { name: expenseBreakdown.food.label, amount: expenseBreakdown.food.amount },
              { name: expenseBreakdown.transport.label, amount: expenseBreakdown.transport.amount },
              ...expenseBreakdown.custom.map(c => ({ name: c.name, amount: c.amount })),
            ].map((item, i) => {
              const leftBorderColors = [COLORS.red, COLORS.blue, COLORS.yellow, COLORS.teal, COLORS.muted]
              return (
                <div
                  key={item.name}
                  className="flex justify-between items-center px-5 py-3 font-semibold text-sm"
                  style={{
                    borderLeft: `3px solid ${leftBorderColors[i % leftBorderColors.length]}`,
                    borderBottom: `2px solid ${COLORS.black}`,
                    backgroundColor: COLORS.white,
                    fontFamily: "'Work Sans', sans-serif",
                  }}
                >
                  <span className="uppercase font-bold text-xs" style={{ letterSpacing: '0.05em' }}>— {item.name}</span>
                  <span className="font-bold">{formatKES(item.amount)}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-5 p-4 text-center font-bold text-lg"
            style={{ border: `3px solid ${COLORS.black}`, backgroundColor: COLORS.black, color: COLORS.yellow, fontFamily: "'Work Sans', sans-serif", fontWeight: 900 }}>
            TOTAL EXPENSES: {formatKES(dashboardSummary.totalExpenses)}
          </div>
        </div>
      </div>

      {/* Take-Home Summary */}
      <div
        className="p-6 sm:p-8 text-center"
        style={{
          ...brutalistCard,
          backgroundColor: COLORS.teal,
          boxShadow: `6px 6px 0 ${COLORS.black}`,
          transform: 'rotate(-0.5deg)',
        }}
      >
        <div className="text-xs font-extrabold uppercase mb-2"
          style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em', color: COLORS.white, opacity: 0.85 }}>
          MONTHLY TAKE-HOME
        </div>
        <div className="text-3xl sm:text-4xl font-black"
          style={{ fontFamily: "'Work Sans', sans-serif", color: COLORS.white }}>
          {formatKES(dashboardSummary.takeHome)}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-bold"
          style={{ color: COLORS.white, opacity: 0.8 }}>
          <span>Gross: {formatKES(dashboardSummary.grossSalary)}</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>Deductions: {formatKES(dashboardSummary.totalDeductions)}</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>Expenses: {formatKES(dashboardSummary.totalExpenses)}</span>
        </div>
      </div>
    </div>
  )

  // ─── DASHBOARD TAB ────────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-12">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-3">
        {[
          { label: 'GROSS', amount: dashboardSummary.grossSalary, color: COLORS.blue, icon: <Zap size={20} /> },
          { label: 'DEDUCTIONS', amount: dashboardSummary.totalDeductions, color: COLORS.red, icon: <AlertTriangle size={20} /> },
          { label: 'EXPENSES', amount: dashboardSummary.totalExpenses, color: COLORS.yellow, icon: <BarChart3 size={20} /> },
          { label: 'TAKE HOME', amount: dashboardSummary.takeHome, color: COLORS.teal, icon: <ThumbsUp size={20} /> },
        ].map((card, i) => (
          <div
            key={card.label}
            className="p-5 sm:p-6 relative overflow-hidden"
            onMouseEnter={() => setHoveredCard(`dash-${i}`)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              ...cardStyle(`dash-${i}`, COLORS.white),
              borderLeft: `4px solid ${card.color}`,
            }}
          >
            <div
              className="w-8 h-8 flex items-center justify-center mb-3"
              style={{ backgroundColor: card.color, color: COLORS.white }}
            >
              {card.icon}
            </div>
            <div className="text-xs font-extrabold uppercase tracking-wider"
              style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em', color: COLORS.muted }}>{card.label}</div>
            <div className="text-xl md:text-2xl font-black mt-1"
              style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>{formatKES(card.amount)}</div>
          </div>
        ))}
      </div>

      {/* Savings Rate Stamp */}
      <div className="flex justify-center py-2">
        <div
          className="px-10 py-5 text-center"
          style={{
            border: `4px solid ${COLORS.black}`, backgroundColor: COLORS.yellow,
            boxShadow: `6px 6px 0 ${COLORS.black}`, transform: 'rotate(-1.5deg)',
          }}
        >
          <div className="text-xs font-extrabold uppercase"
            style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em' }}>MONTHLY SAVINGS RATE</div>
          <div className="text-4xl font-black mt-1"
            style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>
            {((dashboardSummary.takeHome / dashboardSummary.grossSalary) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Pie Chart + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="p-4 sm:p-6"
          onMouseEnter={() => setHoveredCard('pie')}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            ...cardStyle('pie', COLORS.white),
            borderLeft: `4px solid ${COLORS.red}`,
          }}
        >
          <div className="mb-5">
            <span style={{ color: COLORS.muted, fontFamily: "'Work Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 800 }}>— </span>
            <span className="text-lg font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>Where Your Money Goes</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expenseChartData}
                cx="50%" cy="50%"
                outerRadius={100}
                innerRadius={40}
                dataKey="value"
                stroke={COLORS.black}
                strokeWidth={2}
              >
                {expenseChartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number) => formatKES(val)}
                contentStyle={{
                  border: `2px solid ${COLORS.black}`, borderRadius: 0,
                  fontFamily: "'Work Sans', sans-serif", fontWeight: 700,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Table */}
        <div
          className="p-4 sm:p-6 overflow-auto"
          onMouseEnter={() => setHoveredCard('table')}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            ...cardStyle('table', COLORS.white),
            borderLeft: `4px solid ${COLORS.blue}`,
          }}
        >
          <div className="mb-5">
            <span style={{ color: COLORS.muted, fontFamily: "'Work Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 800 }}>— </span>
            <span className="text-lg font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>Expense Breakdown</span>
          </div>
          <div className="space-y-0" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {/* Header row - hidden on very small screens, shown as table header on sm+ */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto] items-center pb-2 mb-1"
              style={{ borderBottom: `3px solid ${COLORS.black}` }}>
              <span className="font-extrabold uppercase text-xs" style={{ letterSpacing: '0.15em' }}>Item</span>
              <span className="font-extrabold uppercase text-xs w-24 text-right" style={{ letterSpacing: '0.15em' }}>Amount</span>
              <span className="font-extrabold uppercase text-xs w-14 text-right" style={{ letterSpacing: '0.15em' }}>%</span>
            </div>
            {expenseChartData.map((item, i) => {
              const pct = ((item.value / dashboardSummary.grossSalary) * 100).toFixed(1)
              return (
                <div
                  key={item.name}
                  className="flex flex-wrap sm:grid sm:grid-cols-[1fr_auto_auto] items-center py-3 gap-y-1"
                  style={{ borderBottom: `1px solid ${COLORS.black}20` }}
                >
                  <div className="w-full sm:w-auto font-bold text-xs uppercase flex items-center gap-2" style={{ color: COLORS.black }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, flexShrink: 0, backgroundColor: CHART_COLORS[i % CHART_COLORS.length], border: `1px solid ${COLORS.black}` }} />
                    {item.name}
                  </div>
                  <span className="font-bold text-sm sm:w-24 sm:text-right">{formatKES(item.value)}</span>
                  <span className="font-bold text-xs sm:w-14 sm:text-right ml-2 sm:ml-0" style={{ color: COLORS.muted }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Rent + Food Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="p-6"
          onMouseEnter={() => setHoveredCard('rent')}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            ...cardStyle('rent', COLORS.white),
            borderLeft: `4px solid ${COLORS.blue}`,
          }}
        >
          <div className="mb-4">
            <Home size={16} className="inline mr-2" style={{ color: COLORS.blue }} />
            <span className="text-lg font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>
              Rent in {rentDetails.area}
            </span>
          </div>
          <div className="space-y-3">
            {rentDetails.options.map((opt) => (
              <div key={opt.type} className="flex justify-between items-center py-3 px-4"
                style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.white }}>
                <span className="font-bold text-xs uppercase" style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.05em' }}>— {opt.type}</span>
                <span className="font-bold text-sm" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900 }}>{formatKES(opt.median)}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="p-6"
          onMouseEnter={() => setHoveredCard('food')}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            ...cardStyle('food', COLORS.white),
            borderTop: `4px solid ${COLORS.yellow}`,
          }}
        >
          <div className="mb-4">
            <Star size={16} className="inline mr-2" style={{ color: COLORS.yellow }} />
            <span className="text-lg font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>
              Food in {foodDetails.area}
            </span>
          </div>
          <div className="space-y-3">
            {foodDetails.nearbyRestaurants.map((r) => (
              <div key={r.name} className="flex justify-between items-center py-3 px-4"
                style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.white }}>
                <span className="font-bold text-xs" style={{ fontFamily: "'Work Sans', sans-serif" }}>— {r.name}</span>
                <span className="font-bold text-sm" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900 }}>{formatKES(r.avgMeal)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ─── GROWTH TAB ───────────────────────────────────────────
  const renderGrowth = () => (
    <div className="space-y-12">
      {/* Assumptions */}
      <div style={{ ...brutalistCard, backgroundColor: COLORS.white, overflow: 'hidden' }}>
        <div className="px-5 sm:px-6 py-3" style={{ borderBottom: `2px solid ${COLORS.black}20` }}>
          <span className="font-extrabold text-xs uppercase" style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em', color: COLORS.black }}>
            ASSUMPTIONS
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {[
            { label: 'Salary Growth', val: `${growthAssumptions.salaryGrowthRate}%`, color: COLORS.teal },
            { label: 'Rent Inflation', val: `${growthAssumptions.rentInflation}%`, color: COLORS.red },
            { label: 'Food Inflation', val: `${growthAssumptions.foodInflation}%`, color: COLORS.yellow },
            { label: 'CPI', val: `${growthAssumptions.generalCPI}%`, color: COLORS.muted },
          ].map((a) => (
            <div
              key={a.label}
              className="px-4 sm:px-5 py-4"
              style={{ borderRight: `1px solid ${COLORS.black}15`, borderBottom: `1px solid ${COLORS.black}15` }}
            >
              <div className="text-xs font-bold uppercase mb-1" style={{ color: COLORS.muted, fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.05em' }}>
                {a.label}
              </div>
              <div className="text-xl font-black" style={{ color: a.color, fontFamily: "'Work Sans', sans-serif" }}>
                {a.val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Chart */}
      <div
        className="p-4 sm:p-6"
        onMouseEnter={() => setHoveredCard('growth-chart')}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          ...cardStyle('growth-chart', COLORS.white),
          borderLeft: `4px solid ${COLORS.teal}`,
        }}
      >
        <div className="mb-5">
          <span style={{ color: COLORS.muted, fontFamily: "'Work Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 800 }}>— </span>
          <span className="text-lg font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>10-Year Salary Projection</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={growthChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.black} strokeOpacity={0.15} />
            <XAxis
              dataKey="year" tick={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, fontSize: 12 }}
              tickFormatter={(y) => `Y${y}`} stroke={COLORS.black}
            />
            <YAxis
              tick={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke={COLORS.black}
            />
            <Tooltip
              formatter={(val: number) => formatKES(val)}
              labelFormatter={(l) => `Year ${l}`}
              contentStyle={{
                border: `2px solid ${COLORS.black}`, borderRadius: 0,
                fontFamily: "'Work Sans', sans-serif", fontWeight: 700,
              }}
            />
            <Area type="monotone" dataKey="salary" stroke={COLORS.black} strokeWidth={3}
              fill={COLORS.yellow} fillOpacity={0.7} name="Salary" />
            <Area type="monotone" dataKey="takeHome" stroke={COLORS.black} strokeWidth={2}
              fill={COLORS.teal} fillOpacity={0.5} name="Take Home" />
            <Area type="monotone" dataKey="expenses" stroke={COLORS.black} strokeWidth={2}
              fill={COLORS.red} fillOpacity={0.4} name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Milestone Cards */}
      <div>
        <div className="mb-5">
          <span style={{ color: COLORS.muted, fontFamily: "'Work Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 800 }}>— </span>
          <span className="text-lg font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>Milestones</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { data: growthProjections.current, label: 'NOW', borderColor: COLORS.red, rotate: '-1deg' },
            { data: growthProjections.year3, label: 'YEAR 3', borderColor: COLORS.blue, rotate: '1.5deg' },
            { data: growthProjections.year5, label: 'YEAR 5', borderColor: COLORS.yellow, rotate: '-0.5deg' },
            { data: growthProjections.year10, label: 'YEAR 10', borderColor: COLORS.teal, rotate: '1deg' },
          ].map((m, i) => (
            <div
              key={m.label}
              className="p-6 relative"
              onMouseEnter={() => setHoveredCard(`mile-${i}`)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...cardStyle(`mile-${i}`, COLORS.white),
                borderTop: `4px solid ${m.borderColor}`,
                transform: hoveredCard === `mile-${i}`
                  ? `rotate(0deg) translate(-2px, -2px)`
                  : `rotate(${m.rotate})`,
              }}
            >
              <div
                className="absolute -top-3 -right-2 px-2 py-1 text-xs font-extrabold"
                style={{
                  border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.white,
                  fontFamily: "'Work Sans', sans-serif", transform: 'rotate(3deg)',
                  letterSpacing: '0.15em',
                }}
              >
                {m.label}
              </div>
              <div className="mt-3 space-y-3" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                <div>
                  <span className="text-xs font-bold uppercase" style={{ color: COLORS.muted, letterSpacing: '0.05em' }}>Salary</span>
                  <div className="text-lg font-black" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>{formatKES(m.data.salary)}</div>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase" style={{ color: COLORS.muted, letterSpacing: '0.05em' }}>Take Home</span>
                  <div className="text-base font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900 }}>{formatKES(m.data.takeHome)}</div>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase" style={{ color: COLORS.muted, letterSpacing: '0.05em' }}>Expenses</span>
                  <div className="text-base font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900 }}>{formatKES(m.data.totalExpenses)}</div>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase" style={{ color: COLORS.muted, letterSpacing: '0.05em' }}>Tax</span>
                  <div className="text-base font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900 }}>{formatKES(m.data.totalTax)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Line chart - Taxes vs Take Home */}
      <div
        className="p-4 sm:p-6"
        onMouseEnter={() => setHoveredCard('growth-line')}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          ...cardStyle('growth-line', COLORS.white),
          borderLeft: `4px solid ${COLORS.red}`,
        }}
      >
        <div className="mb-5">
          <span style={{ color: COLORS.muted, fontFamily: "'Work Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 800 }}>— </span>
          <span className="text-lg font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>Taxes vs Take Home Over Time</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={growthChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.black} strokeOpacity={0.15} />
            <XAxis
              dataKey="year" tick={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, fontSize: 12 }}
              tickFormatter={(y) => `Y${y}`} stroke={COLORS.black}
            />
            <YAxis
              tick={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke={COLORS.black}
            />
            <Tooltip
              formatter={(val: number) => formatKES(val)}
              labelFormatter={(l) => `Year ${l}`}
              contentStyle={{
                border: `2px solid ${COLORS.black}`, borderRadius: 0,
                fontFamily: "'Work Sans', sans-serif", fontWeight: 700,
              }}
            />
            <Line type="monotone" dataKey="takeHome" stroke={COLORS.teal} strokeWidth={4}
              dot={{ r: 5, stroke: COLORS.black, strokeWidth: 2, fill: COLORS.teal }} name="Take Home" />
            <Line type="monotone" dataKey="taxes" stroke={COLORS.red} strokeWidth={4}
              dot={{ r: 5, stroke: COLORS.black, strokeWidth: 2, fill: COLORS.red }} name="Taxes" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // ─── COMPARISON TAB ───────────────────────────────────────
  const renderComparison = () => {
    const isBelow = salaryComparison.verdict === 'slightly_below'
    const verdictColor = isBelow ? COLORS.red : COLORS.teal
    return (
      <div className="space-y-12">
        {/* Role Info */}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {[
            { label: salaryComparison.role, bg: COLORS.yellow },
            { label: salaryComparison.location, bg: COLORS.blue },
            { label: salaryComparison.experienceBand, bg: COLORS.red },
            { label: `${salaryComparison.sampleSize} respondents`, bg: COLORS.teal },
          ].map((tag) => (
            <span
              key={tag.label}
              className="px-4 py-2 text-xs font-extrabold uppercase"
              style={{
                border: `2px solid ${COLORS.black}`, backgroundColor: tag.bg,
                fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em',
                color: tag.bg === COLORS.yellow ? COLORS.black : COLORS.white,
              }}
            >
              {tag.label}
            </span>
          ))}
        </div>

        {/* Bell Curve */}
        <div
          className="p-4 sm:p-6"
          onMouseEnter={() => setHoveredCard('bell')}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            ...cardStyle('bell', COLORS.white),
            borderLeft: `4px solid ${COLORS.red}`,
          }}
        >
          <div className="mb-5">
            <span style={{ color: COLORS.muted, fontFamily: "'Work Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 800 }}>— </span>
            <span className="text-lg font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>Salary Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salaryDistributionData}>
              <defs>
                <linearGradient id="bellGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.black} strokeOpacity={0.15} />
              <XAxis
                dataKey="salary" tick={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke={COLORS.black}
              />
              <YAxis
                tick={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, fontSize: 11 }}
                stroke={COLORS.black}
              />
              <Tooltip
                formatter={(val: number) => val}
                labelFormatter={(l) => formatKES(Number(l))}
                contentStyle={{
                  border: `2px solid ${COLORS.black}`, borderRadius: 0,
                  fontFamily: "'Work Sans', sans-serif", fontWeight: 700,
                }}
              />
              <Area
                type="monotone" dataKey="frequency" stroke={COLORS.black} strokeWidth={3}
                fill="url(#bellGradient)" name="Frequency"
              />
              {/* User salary reference line */}
              <Area
                type="monotone" dataKey={() => null} stroke="none" fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-bold"
            style={{ fontFamily: "'Work Sans', sans-serif" }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4" style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.yellow }} />
              You: {formatKES(salaryComparison.userSalary)}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4" style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.red }} />
              Median: {formatKES(salaryComparison.marketMedian)}
            </div>
          </div>
        </div>

        {/* Percentile Bar */}
        <div
          className="p-4 sm:p-6"
          onMouseEnter={() => setHoveredCard('pct')}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            ...cardStyle('pct', COLORS.white),
            borderLeft: `4px solid ${COLORS.yellow}`,
          }}
        >
          <div className="mb-4">
            <span style={{ color: COLORS.muted, fontFamily: "'Work Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 800 }}>— </span>
            <span className="text-lg font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>Your Percentile</span>
          </div>
          <div className="relative h-12 w-full" style={{ border: `3px solid ${COLORS.black}`, backgroundColor: COLORS.white }}>
            {/* Fill */}
            <div
              className="absolute top-0 left-0 h-full flex items-center justify-end pr-3"
              style={{
                width: `${salaryComparison.percentile}%`,
                backgroundColor: COLORS.yellow,
                borderRight: `3px solid ${COLORS.black}`,
                transition: 'width 0.5s ease',
              }}
            >
              <span className="font-black text-lg" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>
                {salaryComparison.percentile}th
              </span>
            </div>
            {/* Markers */}
            <div className="absolute top-0 h-full" style={{ left: '25%', borderLeft: `2px dashed ${COLORS.black}`, opacity: 0.3 }} />
            <div className="absolute top-0 h-full" style={{ left: '50%', borderLeft: `2px dashed ${COLORS.black}`, opacity: 0.3 }} />
            <div className="absolute top-0 h-full" style={{ left: '75%', borderLeft: `2px dashed ${COLORS.black}`, opacity: 0.3 }} />
          </div>
          <div className="flex justify-between mt-3 text-xs font-bold" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            <span>P25: {formatKES(salaryComparison.p25)}</span>
            <span>MEDIAN: {formatKES(salaryComparison.marketMedian)}</span>
            <span>P75: {formatKES(salaryComparison.p75)}</span>
          </div>
        </div>

        {/* Market Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'YOUR SALARY', val: salaryComparison.userSalary, color: COLORS.blue },
            { label: 'MARKET MEDIAN', val: salaryComparison.marketMedian, color: COLORS.red },
            { label: 'MARKET MEAN', val: salaryComparison.marketMean, color: COLORS.yellow },
            { label: 'P75 (TOP 25%)', val: salaryComparison.p75, color: COLORS.teal },
          ].map((s, i) => (
            <div
              key={s.label}
              className="p-5"
              onMouseEnter={() => setHoveredCard(`stat-${i}`)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...cardStyle(`stat-${i}`, COLORS.white),
                borderLeft: `4px solid ${s.color}`,
              }}
            >
              <div className="text-xs font-extrabold uppercase" style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em', color: COLORS.muted }}>{s.label}</div>
              <div className="text-lg font-black mt-2" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>{formatKES(s.val)}</div>
            </div>
          ))}
        </div>

        {/* Verdict Stamp */}
        <div className="flex justify-center py-2">
          <div
            className="px-10 py-6 text-center max-w-lg"
            style={{
              border: `4px solid ${COLORS.black}`,
              backgroundColor: verdictColor,
              boxShadow: `8px 8px 0 ${COLORS.black}`,
              transform: 'rotate(-2deg)',
              color: COLORS.white,
            }}
          >
            <div className="text-xs font-extrabold uppercase mb-2"
              style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em' }}>VERDICT</div>
            <div className="text-xl md:text-2xl font-black uppercase"
              style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900 }}>
              {salaryComparison.verdict === 'slightly_below' ? 'SLIGHTLY BELOW MARKET' : 'ON TRACK'}
            </div>
            <div className="text-sm font-bold mt-3" style={{ fontFamily: "'Work Sans', sans-serif", opacity: 0.9 }}>
              {salaryComparison.verdictText}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs" style={{ opacity: 0.8 }}>
              <AlertTriangle size={12} />
              <span className="font-bold">Confidence: {salaryComparison.confidence.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Gap to Median */}
        <div
          className="p-4 sm:p-6"
          onMouseEnter={() => setHoveredCard('gap')}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            ...cardStyle('gap', COLORS.white),
            borderLeft: `4px solid ${COLORS.muted}`,
          }}
        >
          <div className="mb-5">
            <span style={{ color: COLORS.muted, fontFamily: "'Work Sans', sans-serif", fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 800 }}>— </span>
            <span className="text-lg font-bold" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>Gap Analysis</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 text-center" style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.white }}>
              <div className="text-xs font-bold uppercase mb-1" style={{ color: COLORS.muted, letterSpacing: '0.05em' }}>Monthly Gap</div>
              <div className="text-lg font-black" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.red }}>
                {formatKES(salaryComparison.marketMedian - salaryComparison.userSalary)}
              </div>
            </div>
            <div className="p-5 text-center" style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.white }}>
              <div className="text-xs font-bold uppercase mb-1" style={{ color: COLORS.muted, letterSpacing: '0.05em' }}>Annual Gap</div>
              <div className="text-lg font-black" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.red }}>
                {formatKES((salaryComparison.marketMedian - salaryComparison.userSalary) * 12)}
              </div>
            </div>
            <div className="p-5 text-center" style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.white }}>
              <div className="text-xs font-bold uppercase mb-1" style={{ color: COLORS.muted, letterSpacing: '0.05em' }}>To Reach P75</div>
              <div className="text-lg font-black" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.blue }}>
                {formatKES(salaryComparison.p75 - salaryComparison.userSalary)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── MAIN RENDER ──────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.cream, fontFamily: "'Work Sans', sans-serif" }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700;800;900&display=swap');
.scrollbar-hide::-webkit-scrollbar { display: none; }`}
      </style>

      {/* Header */}
      <header
        className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-4"
        style={{ backgroundColor: COLORS.black, borderBottom: `4px solid ${COLORS.red}` }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1
            className="text-xl md:text-2xl font-black tracking-tight"
            style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.white }}
          >
            KAZI<span style={{ color: COLORS.red }}>&amp;BUDGET</span>
          </h1>

          {/* User Badge */}
          <div
            className="px-3 py-1.5 text-xs font-bold hidden md:flex items-center gap-2"
            style={{
              border: `2px solid ${COLORS.yellow}`, color: COLORS.yellow,
              fontFamily: "'Work Sans', sans-serif", transform: 'rotate(1deg)',
            }}
          >
            <User size={12} />
            {userData.name} &mdash; {userData.company}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[64px] z-40 overflow-hidden"
        style={{ backgroundColor: COLORS.cream, borderBottom: `3px solid ${COLORS.black}` }}>
        <div className="relative">
          <div
            className="px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
            onScroll={(e) => {
              const el = e.currentTarget
              if (el.scrollLeft > 20) setShowNavScroll(false)
            }}
          >
            <div className="max-w-4xl mx-auto flex gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key
                const bgMap: Record<TabKey, string> = {
                  input: COLORS.red, dashboard: COLORS.blue,
                  growth: COLORS.yellow, comparison: COLORS.teal,
                }
                const textColorMap: Record<TabKey, string> = {
                  input: COLORS.white, dashboard: COLORS.white,
                  growth: COLORS.black, comparison: COLORS.white,
                }
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="flex items-center gap-2 px-4 py-2 font-extrabold text-xs uppercase whitespace-nowrap"
                    style={{
                      border: `3px solid ${COLORS.black}`,
                      backgroundColor: isActive ? bgMap[tab.key] : COLORS.white,
                      color: isActive ? textColorMap[tab.key] : COLORS.black,
                      boxShadow: isActive ? `4px 4px 0 ${COLORS.black}` : `2px 2px 0 ${COLORS.black}`,
                      fontFamily: "'Work Sans', sans-serif",
                      letterSpacing: '0.15em',
                      transform: isActive ? 'translate(-1px, -1px)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.1s ease',
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
          {/* Mobile scroll indicator */}
          {showNavScroll && (
            <div
              className="absolute right-0 top-0 bottom-0 flex items-center pr-1 md:hidden pointer-events-none"
              style={{
                background: `linear-gradient(to right, transparent, ${COLORS.cream} 60%)`,
                width: 48,
              }}
            >
              <div
                className="ml-auto flex items-center justify-center pointer-events-auto"
                style={{
                  width: 28, height: 28,
                  border: `2px solid ${COLORS.black}`,
                  backgroundColor: COLORS.yellow,
                  boxShadow: `2px 2px 0 ${COLORS.black}`,
                }}
              >
                <ChevronRight size={14} strokeWidth={3} />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-5 py-8 sm:py-10">
        {activeTab === 'input' && renderInput()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'growth' && renderGrowth()}
        {activeTab === 'comparison' && renderComparison()}
      </main>

      {/* Footer */}
      <footer
        className="mt-16 px-5 sm:px-6 lg:px-8 py-6 sm:py-8"
        style={{ borderTop: `4px solid ${COLORS.red}`, backgroundColor: COLORS.black }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs font-bold uppercase" style={{ fontFamily: "'Work Sans', sans-serif", color: COLORS.cream, letterSpacing: '0.05em' }}>
            Kazi&amp;Budget &mdash; Workplace Salary Calculator for Kenya
          </div>

          {/* Nairobi Stamp */}
          <div
            className="px-4 py-2 text-xs font-extrabold uppercase"
            style={{
              border: `3px solid ${COLORS.black}`, backgroundColor: COLORS.red, color: COLORS.white,
              transform: 'rotate(-3deg)', fontFamily: "'Work Sans', sans-serif",
              letterSpacing: '0.15em',
              boxShadow: `3px 3px 0 ${COLORS.yellow}`,
            }}
          >
            MADE IN NAIROBI &#127472;&#127466;
          </div>

          <div className="text-xs font-bold" style={{ fontFamily: "'Work Sans', sans-serif", color: COLORS.muted }}>
            Design 5 &mdash; Editorial Brutalist
          </div>
        </div>
      </footer>
    </div>
  )
}
