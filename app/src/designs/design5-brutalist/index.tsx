import { useState } from 'react'
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
  Home, User, BarChart3, TrendingUp, Users, ArrowLeft,
  Zap, Star, AlertTriangle, ThumbsUp
} from 'lucide-react'

type TabKey = 'input' | 'dashboard' | 'growth' | 'comparison'

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'input', label: 'INPUT', icon: <User size={18} /> },
  { key: 'dashboard', label: 'DASHBOARD', icon: <BarChart3 size={18} /> },
  { key: 'growth', label: 'GROWTH', icon: <TrendingUp size={18} /> },
  { key: 'comparison', label: 'COMPARE', icon: <Users size={18} /> },
]

const brutalistCard = {
  border: '3px solid #000',
  boxShadow: '4px 4px 0 #000',
}

const brutalistCardHover = {
  border: '3px solid #000',
  boxShadow: '6px 6px 0 #000',
  transform: 'translate(-2px, -2px)',
}

const BRIGHT_COLORS = ['#FDE047', '#F472B6', '#38BDF8', '#A3E635', '#FB923C']

export default function Design5Brutalist() {
  const [activeTab, setActiveTab] = useState<TabKey>('input')
  const navigate = useNavigate()
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const cardStyle = (id: string, bg: string = '#fff') => ({
    ...((hoveredCard === id) ? brutalistCardHover : brutalistCard),
    backgroundColor: bg,
    transition: 'all 0.15s ease',
    cursor: 'default',
  })

  // ─── INPUT TAB ────────────────────────────────────────────
  const renderInput = () => (
    <div className="space-y-10">
      {/* Personal Info */}
      <div className="relative">
        <div
          className="absolute -top-4 -left-2 px-3 py-1 font-black text-xs uppercase tracking-widest z-10"
          style={{
            border: '2px solid #000', backgroundColor: '#FDE047',
            transform: 'rotate(-2deg)', fontFamily: 'Archivo Black',
          }}
        >
          PERSONAL INFO
        </div>
        <div className="p-6 sm:p-8 pt-10" style={{ ...brutalistCard, backgroundColor: '#FFFBEB' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'FULL NAME', value: userData.name },
              { label: 'COMPANY', value: userData.company },
              { label: 'WORK LOCATION', value: userData.companyLocation },
              { label: 'HOME AREA', value: userData.residentialArea },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-xs font-black uppercase tracking-wider mb-2"
                  style={{ fontFamily: 'Archivo Black' }}>{field.label}</label>
                <input
                  type="text" readOnly value={field.value}
                  className="w-full px-4 py-3 font-semibold text-sm bg-white outline-none"
                  style={{ border: '3px solid #000', fontFamily: 'Work Sans' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salary Section */}
      <div className="relative">
        <div
          className="absolute -top-4 right-4 px-3 py-1 font-black text-xs uppercase tracking-widest z-10"
          style={{
            border: '2px solid #000', backgroundColor: '#F472B6',
            transform: 'rotate(1.5deg)', fontFamily: 'Archivo Black',
          }}
        >
          SALARY & TAX
        </div>
        <div className="p-6 sm:p-8 pt-10" style={{ ...brutalistCard, backgroundColor: '#FCE7F3' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2"
                style={{ fontFamily: 'Archivo Black' }}>GROSS SALARY (KES)</label>
              <input
                type="text" readOnly value={formatKES(userData.monthlySalary)}
                className="w-full px-4 py-3 font-bold text-lg bg-white outline-none"
                style={{ border: '3px solid #000', fontFamily: 'Work Sans' }}
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2"
                style={{ fontFamily: 'Archivo Black' }}>EXPERIENCE</label>
              <input
                type="text" readOnly value={`${userData.yearsOfExperience} years`}
                className="w-full px-4 py-3 font-bold text-lg bg-white outline-none"
                style={{ border: '3px solid #000', fontFamily: 'Work Sans' }}
              />
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'PAYE', amount: taxBreakdown.paye, bg: '#FDE047' },
              { label: 'NSSF', amount: taxBreakdown.nssf, bg: '#38BDF8' },
              { label: 'SHIF', amount: taxBreakdown.shif, bg: '#A3E635' },
              { label: 'HOUSING', amount: taxBreakdown.housingLevy, bg: '#FB923C' },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 text-center"
                style={{ border: '2px solid #000', backgroundColor: item.bg }}
              >
                <div className="text-xs font-black uppercase" style={{ fontFamily: 'Archivo Black' }}>
                  {item.label}
                </div>
                <div className="text-sm font-bold mt-1" style={{ fontFamily: 'Work Sans' }}>
                  {formatKES(item.amount)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 text-center font-black text-lg"
            style={{ border: '3px solid #000', backgroundColor: '#FDE047', fontFamily: 'Archivo Black' }}>
            NET AFTER TAX: {formatKES(taxBreakdown.netAfterTax)}
          </div>
        </div>
      </div>

      {/* Commute */}
      <div className="relative">
        <div
          className="absolute -top-4 left-8 px-3 py-1 font-black text-xs uppercase tracking-widest z-10"
          style={{
            border: '2px solid #000', backgroundColor: '#38BDF8',
            transform: 'rotate(-1deg)', fontFamily: 'Archivo Black',
          }}
        >
          COMMUTE
        </div>
        <div className="p-6 sm:p-8 pt-10" style={{ ...brutalistCard, backgroundColor: '#E0F2FE' }}>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="font-bold text-sm" style={{ fontFamily: 'Work Sans' }}>
              {travelDetails.origin}
            </span>
            <span className="font-black text-lg">&#8594;</span>
            <span className="font-bold text-sm" style={{ fontFamily: 'Work Sans' }}>
              {travelDetails.destination}
            </span>
            <span className="px-3 py-1 text-xs font-black"
              style={{ border: '2px solid #000', backgroundColor: '#FDE047', fontFamily: 'Archivo Black' }}>
              {travelDetails.distance}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {travelDetails.modes.map((mode, i) => (
              <div
                key={mode.mode}
                className="p-4"
                onMouseEnter={() => setHoveredCard(`travel-${i}`)}
                onMouseLeave={() => setHoveredCard(null)}
                style={cardStyle(`travel-${i}`, BRIGHT_COLORS[i % BRIGHT_COLORS.length])}
              >
                <div className="text-xs font-black uppercase" style={{ fontFamily: 'Archivo Black' }}>
                  {mode.mode}
                </div>
                <div className="text-sm font-bold mt-2" style={{ fontFamily: 'Work Sans' }}>
                  {formatKES(mode.monthly)}/mo
                </div>
                <div className="text-xs mt-1 opacity-70">{formatKES(mode.costPerTrip)}/trip</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses */}
      <div className="relative">
        <div
          className="absolute -top-4 right-8 px-3 py-1 font-black text-xs uppercase tracking-widest z-10"
          style={{
            border: '2px solid #000', backgroundColor: '#A3E635',
            transform: 'rotate(2deg)', fontFamily: 'Archivo Black',
          }}
        >
          MONTHLY EXPENSES
        </div>
        <div className="p-6 sm:p-8 pt-10" style={{ ...brutalistCard, backgroundColor: '#ECFCCB' }}>
          <div className="space-y-3">
            {[
              { name: expenseBreakdown.rent.label, amount: expenseBreakdown.rent.amount },
              { name: expenseBreakdown.food.label, amount: expenseBreakdown.food.amount },
              { name: expenseBreakdown.transport.label, amount: expenseBreakdown.transport.amount },
              ...expenseBreakdown.custom.map(c => ({ name: c.name, amount: c.amount })),
            ].map((item, i) => (
              <div
                key={item.name}
                className="flex justify-between items-center px-5 py-3 font-semibold text-sm"
                style={{
                  border: '2px solid #000',
                  backgroundColor: BRIGHT_COLORS[i % BRIGHT_COLORS.length],
                  fontFamily: 'Work Sans',
                }}
              >
                <span className="uppercase font-bold text-xs">{item.name}</span>
                <span className="font-black">{formatKES(item.amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 text-center font-black text-lg"
            style={{ border: '3px solid #000', backgroundColor: '#000', color: '#FDE047', fontFamily: 'Archivo Black' }}>
            TOTAL EXPENSES: {formatKES(dashboardSummary.totalExpenses)}
          </div>
        </div>
      </div>
    </div>
  )

  // ─── DASHBOARD TAB ────────────────────────────────────────
  const renderDashboard = () => (
    <div className="space-y-10">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'GROSS', amount: dashboardSummary.grossSalary, bg: '#FDE047', icon: <Zap size={20} /> },
          { label: 'DEDUCTIONS', amount: dashboardSummary.totalDeductions, bg: '#F472B6', icon: <AlertTriangle size={20} /> },
          { label: 'EXPENSES', amount: dashboardSummary.totalExpenses, bg: '#38BDF8', icon: <BarChart3 size={20} /> },
          { label: 'TAKE HOME', amount: dashboardSummary.takeHome, bg: '#A3E635', icon: <ThumbsUp size={20} /> },
        ].map((card, i) => (
          <div
            key={card.label}
            className="p-5 sm:p-6 relative overflow-hidden"
            onMouseEnter={() => setHoveredCard(`dash-${i}`)}
            onMouseLeave={() => setHoveredCard(null)}
            style={cardStyle(`dash-${i}`, card.bg)}
          >
            <div className="absolute -top-1 -right-1 opacity-20"
              style={{ transform: 'rotate(15deg)' }}>
              {card.icon}
            </div>
            <div className="text-xs font-black uppercase tracking-wider"
              style={{ fontFamily: 'Archivo Black' }}>{card.label}</div>
            <div className="text-xl md:text-2xl font-black mt-2"
              style={{ fontFamily: 'Archivo Black' }}>{formatKES(card.amount)}</div>
          </div>
        ))}
      </div>

      {/* Savings Rate Stamp */}
      <div className="flex justify-center py-2">
        <div
          className="px-10 py-5 text-center"
          style={{
            border: '4px solid #000', backgroundColor: '#FDE047',
            boxShadow: '6px 6px 0 #000', transform: 'rotate(-1.5deg)',
          }}
        >
          <div className="text-xs font-black uppercase tracking-widest"
            style={{ fontFamily: 'Archivo Black' }}>MONTHLY SAVINGS RATE</div>
          <div className="text-4xl font-black mt-1"
            style={{ fontFamily: 'Archivo Black' }}>
            {((dashboardSummary.takeHome / dashboardSummary.grossSalary) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Pie Chart + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="p-6"
          onMouseEnter={() => setHoveredCard('pie')}
          onMouseLeave={() => setHoveredCard(null)}
          style={cardStyle('pie', '#FFFBEB')}
        >
          <div className="text-sm font-black uppercase tracking-wider mb-5"
            style={{ fontFamily: 'Archivo Black' }}>WHERE YOUR MONEY GOES</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={expenseChartData}
                cx="50%" cy="50%"
                outerRadius={100}
                innerRadius={40}
                dataKey="value"
                stroke="#000"
                strokeWidth={2}
              >
                {expenseChartData.map((_, i) => (
                  <Cell key={i} fill={BRIGHT_COLORS[i % BRIGHT_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number) => formatKES(val)}
                contentStyle={{
                  border: '2px solid #000', borderRadius: 0,
                  fontFamily: 'Work Sans', fontWeight: 700,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Table */}
        <div
          className="p-6 overflow-auto"
          onMouseEnter={() => setHoveredCard('table')}
          onMouseLeave={() => setHoveredCard(null)}
          style={cardStyle('table', '#fff')}
        >
          <div className="text-sm font-black uppercase tracking-wider mb-5"
            style={{ fontFamily: 'Archivo Black' }}>EXPENSE BREAKDOWN</div>
          <table className="w-full text-sm" style={{ fontFamily: 'Work Sans', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '3px solid #000' }}>
                <th className="text-left py-3 px-4 font-black uppercase text-xs">Item</th>
                <th className="text-right py-3 px-4 font-black uppercase text-xs">Amount</th>
                <th className="text-right py-3 px-4 font-black uppercase text-xs">%</th>
              </tr>
            </thead>
            <tbody>
              {expenseChartData.map((item, i) => {
                const pct = ((item.value / dashboardSummary.grossSalary) * 100).toFixed(1)
                return (
                  <tr
                    key={item.name}
                    style={{
                      borderBottom: '2px solid #000',
                      backgroundColor: BRIGHT_COLORS[i % BRIGHT_COLORS.length],
                    }}
                  >
                    <td className="py-3 px-4 font-bold text-xs uppercase">{item.name}</td>
                    <td className="py-3 px-4 text-right font-bold">{formatKES(item.value)}</td>
                    <td className="py-3 px-4 text-right font-black">{pct}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rent + Food Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="p-6"
          onMouseEnter={() => setHoveredCard('rent')}
          onMouseLeave={() => setHoveredCard(null)}
          style={cardStyle('rent', '#E0F2FE')}
        >
          <div className="text-sm font-black uppercase tracking-wider mb-4"
            style={{ fontFamily: 'Archivo Black' }}>
            <Home size={16} className="inline mr-2" />RENT IN {rentDetails.area.toUpperCase()}
          </div>
          <div className="space-y-3">
            {rentDetails.options.map((opt) => (
              <div key={opt.type} className="flex justify-between items-center py-3 px-4"
                style={{ border: '2px solid #000', backgroundColor: '#fff' }}>
                <span className="font-bold text-xs uppercase" style={{ fontFamily: 'Work Sans' }}>{opt.type}</span>
                <span className="font-black text-sm">{formatKES(opt.median)}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="p-6"
          onMouseEnter={() => setHoveredCard('food')}
          onMouseLeave={() => setHoveredCard(null)}
          style={cardStyle('food', '#FEF3C7')}
        >
          <div className="text-sm font-black uppercase tracking-wider mb-4"
            style={{ fontFamily: 'Archivo Black' }}>
            <Star size={16} className="inline mr-2" />FOOD IN {foodDetails.area.toUpperCase()}
          </div>
          <div className="space-y-3">
            {foodDetails.nearbyRestaurants.map((r) => (
              <div key={r.name} className="flex justify-between items-center py-3 px-4"
                style={{ border: '2px solid #000', backgroundColor: '#fff' }}>
                <span className="font-bold text-xs" style={{ fontFamily: 'Work Sans' }}>{r.name}</span>
                <span className="font-black text-sm">{formatKES(r.avgMeal)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ─── GROWTH TAB ───────────────────────────────────────────
  const renderGrowth = () => (
    <div className="space-y-10">
      {/* Assumptions Banner */}
      <div
        className="p-5 sm:p-6 flex flex-wrap gap-4 items-center justify-center"
        style={{ ...brutalistCard, backgroundColor: '#FDE047' }}
      >
        <span className="font-black text-xs uppercase" style={{ fontFamily: 'Archivo Black' }}>
          ASSUMPTIONS:
        </span>
        {[
          { label: 'Salary Growth', val: `${growthAssumptions.salaryGrowthRate}%` },
          { label: 'Rent Inflation', val: `${growthAssumptions.rentInflation}%` },
          { label: 'Food Inflation', val: `${growthAssumptions.foodInflation}%` },
          { label: 'CPI', val: `${growthAssumptions.generalCPI}%` },
        ].map((a) => (
          <span
            key={a.label}
            className="px-3 py-1.5 text-xs font-bold"
            style={{ border: '2px solid #000', backgroundColor: '#fff', fontFamily: 'Work Sans' }}
          >
            {a.label}: {a.val}
          </span>
        ))}
      </div>

      {/* Growth Chart */}
      <div
        className="p-6"
        onMouseEnter={() => setHoveredCard('growth-chart')}
        onMouseLeave={() => setHoveredCard(null)}
        style={cardStyle('growth-chart', '#F0FDF4')}
      >
        <div className="text-sm font-black uppercase tracking-wider mb-5"
          style={{ fontFamily: 'Archivo Black' }}>10-YEAR SALARY PROJECTION</div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={growthChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.15} />
            <XAxis
              dataKey="year" tick={{ fontFamily: 'Work Sans', fontWeight: 700, fontSize: 12 }}
              tickFormatter={(y) => `Y${y}`} stroke="#000"
            />
            <YAxis
              tick={{ fontFamily: 'Work Sans', fontWeight: 700, fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="#000"
            />
            <Tooltip
              formatter={(val: number) => formatKES(val)}
              labelFormatter={(l) => `Year ${l}`}
              contentStyle={{
                border: '2px solid #000', borderRadius: 0,
                fontFamily: 'Work Sans', fontWeight: 700,
              }}
            />
            <Area type="monotone" dataKey="salary" stroke="#000" strokeWidth={3}
              fill="#FDE047" fillOpacity={0.7} name="Salary" />
            <Area type="monotone" dataKey="takeHome" stroke="#000" strokeWidth={2}
              fill="#A3E635" fillOpacity={0.5} name="Take Home" />
            <Area type="monotone" dataKey="expenses" stroke="#000" strokeWidth={2}
              fill="#F472B6" fillOpacity={0.4} name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Milestone Cards */}
      <div>
        <div className="text-sm font-black uppercase tracking-wider mb-5"
          style={{ fontFamily: 'Archivo Black' }}>MILESTONES</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { data: growthProjections.current, label: 'NOW', bg: '#FDE047', rotate: '-1deg' },
            { data: growthProjections.year3, label: 'YEAR 3', bg: '#F472B6', rotate: '1.5deg' },
            { data: growthProjections.year5, label: 'YEAR 5', bg: '#38BDF8', rotate: '-0.5deg' },
            { data: growthProjections.year10, label: 'YEAR 10', bg: '#A3E635', rotate: '1deg' },
          ].map((m, i) => (
            <div
              key={m.label}
              className="p-6 relative"
              onMouseEnter={() => setHoveredCard(`mile-${i}`)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                ...cardStyle(`mile-${i}`, m.bg),
                transform: hoveredCard === `mile-${i}`
                  ? `rotate(0deg) translate(-2px, -2px)`
                  : `rotate(${m.rotate})`,
              }}
            >
              <div
                className="absolute -top-3 -right-2 px-2 py-1 text-xs font-black"
                style={{
                  border: '2px solid #000', backgroundColor: '#fff',
                  fontFamily: 'Archivo Black', transform: 'rotate(3deg)',
                }}
              >
                {m.label}
              </div>
              <div className="mt-3 space-y-3" style={{ fontFamily: 'Work Sans' }}>
                <div>
                  <span className="text-xs font-bold uppercase opacity-70">Salary</span>
                  <div className="text-lg font-black">{formatKES(m.data.salary)}</div>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase opacity-70">Take Home</span>
                  <div className="text-base font-bold">{formatKES(m.data.takeHome)}</div>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase opacity-70">Expenses</span>
                  <div className="text-base font-bold">{formatKES(m.data.totalExpenses)}</div>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase opacity-70">Tax</span>
                  <div className="text-base font-bold">{formatKES(m.data.totalTax)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Line chart - Taxes vs Take Home */}
      <div
        className="p-6"
        onMouseEnter={() => setHoveredCard('growth-line')}
        onMouseLeave={() => setHoveredCard(null)}
        style={cardStyle('growth-line', '#FFF7ED')}
      >
        <div className="text-sm font-black uppercase tracking-wider mb-5"
          style={{ fontFamily: 'Archivo Black' }}>TAXES vs TAKE HOME OVER TIME</div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={growthChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.15} />
            <XAxis
              dataKey="year" tick={{ fontFamily: 'Work Sans', fontWeight: 700, fontSize: 12 }}
              tickFormatter={(y) => `Y${y}`} stroke="#000"
            />
            <YAxis
              tick={{ fontFamily: 'Work Sans', fontWeight: 700, fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="#000"
            />
            <Tooltip
              formatter={(val: number) => formatKES(val)}
              labelFormatter={(l) => `Year ${l}`}
              contentStyle={{
                border: '2px solid #000', borderRadius: 0,
                fontFamily: 'Work Sans', fontWeight: 700,
              }}
            />
            <Line type="monotone" dataKey="takeHome" stroke="#84CC16" strokeWidth={4}
              dot={{ r: 5, stroke: '#000', strokeWidth: 2, fill: '#A3E635' }} name="Take Home" />
            <Line type="monotone" dataKey="taxes" stroke="#EC4899" strokeWidth={4}
              dot={{ r: 5, stroke: '#000', strokeWidth: 2, fill: '#F472B6' }} name="Taxes" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // ─── COMPARISON TAB ───────────────────────────────────────
  const renderComparison = () => {
    const verdictColor = salaryComparison.verdict === 'slightly_below' ? '#FB923C' : '#A3E635'
    return (
      <div className="space-y-10">
        {/* Role Info */}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {[
            { label: salaryComparison.role, bg: '#FDE047' },
            { label: salaryComparison.location, bg: '#38BDF8' },
            { label: salaryComparison.experienceBand, bg: '#F472B6' },
            { label: `${salaryComparison.sampleSize} respondents`, bg: '#A3E635' },
          ].map((tag) => (
            <span
              key={tag.label}
              className="px-4 py-2 text-xs font-black uppercase"
              style={{ border: '2px solid #000', backgroundColor: tag.bg, fontFamily: 'Archivo Black' }}
            >
              {tag.label}
            </span>
          ))}
        </div>

        {/* Bell Curve */}
        <div
          className="p-6"
          onMouseEnter={() => setHoveredCard('bell')}
          onMouseLeave={() => setHoveredCard(null)}
          style={cardStyle('bell', '#FFFBEB')}
        >
          <div className="text-sm font-black uppercase tracking-wider mb-5"
            style={{ fontFamily: 'Archivo Black' }}>SALARY DISTRIBUTION</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salaryDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.15} />
              <XAxis
                dataKey="salary" tick={{ fontFamily: 'Work Sans', fontWeight: 700, fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="#000"
              />
              <YAxis
                tick={{ fontFamily: 'Work Sans', fontWeight: 700, fontSize: 11 }}
                stroke="#000"
              />
              <Tooltip
                formatter={(val: number) => val}
                labelFormatter={(l) => formatKES(Number(l))}
                contentStyle={{
                  border: '2px solid #000', borderRadius: 0,
                  fontFamily: 'Work Sans', fontWeight: 700,
                }}
              />
              <Area
                type="monotone" dataKey="frequency" stroke="#000" strokeWidth={3}
                fill="#38BDF8" fillOpacity={0.5} name="Frequency"
              />
              {/* User salary reference line */}
              <Area
                type="monotone" dataKey={() => null} stroke="none" fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-bold"
            style={{ fontFamily: 'Work Sans' }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4" style={{ border: '2px solid #000', backgroundColor: '#FDE047' }} />
              You: {formatKES(salaryComparison.userSalary)}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4" style={{ border: '2px solid #000', backgroundColor: '#EC4899' }} />
              Median: {formatKES(salaryComparison.marketMedian)}
            </div>
          </div>
        </div>

        {/* Percentile Bar */}
        <div
          className="p-6"
          onMouseEnter={() => setHoveredCard('pct')}
          onMouseLeave={() => setHoveredCard(null)}
          style={cardStyle('pct', '#F0FDF4')}
        >
          <div className="text-sm font-black uppercase tracking-wider mb-4"
            style={{ fontFamily: 'Archivo Black' }}>YOUR PERCENTILE</div>
          <div className="relative h-12 w-full" style={{ border: '3px solid #000', backgroundColor: '#fff' }}>
            {/* Fill */}
            <div
              className="absolute top-0 left-0 h-full flex items-center justify-end pr-3"
              style={{
                width: `${salaryComparison.percentile}%`,
                backgroundColor: '#FDE047',
                borderRight: '3px solid #000',
                transition: 'width 0.5s ease',
              }}
            >
              <span className="font-black text-lg" style={{ fontFamily: 'Archivo Black' }}>
                {salaryComparison.percentile}th
              </span>
            </div>
            {/* Markers */}
            <div className="absolute top-0 h-full" style={{ left: '25%', borderLeft: '2px dashed #000', opacity: 0.3 }} />
            <div className="absolute top-0 h-full" style={{ left: '50%', borderLeft: '2px dashed #000', opacity: 0.3 }} />
            <div className="absolute top-0 h-full" style={{ left: '75%', borderLeft: '2px dashed #000', opacity: 0.3 }} />
          </div>
          <div className="flex justify-between mt-3 text-xs font-bold" style={{ fontFamily: 'Work Sans' }}>
            <span>P25: {formatKES(salaryComparison.p25)}</span>
            <span>MEDIAN: {formatKES(salaryComparison.marketMedian)}</span>
            <span>P75: {formatKES(salaryComparison.p75)}</span>
          </div>
        </div>

        {/* Market Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'YOUR SALARY', val: salaryComparison.userSalary, bg: '#FDE047' },
            { label: 'MARKET MEDIAN', val: salaryComparison.marketMedian, bg: '#F472B6' },
            { label: 'MARKET MEAN', val: salaryComparison.marketMean, bg: '#38BDF8' },
            { label: 'P75 (TOP 25%)', val: salaryComparison.p75, bg: '#A3E635' },
          ].map((s, i) => (
            <div
              key={s.label}
              className="p-5"
              onMouseEnter={() => setHoveredCard(`stat-${i}`)}
              onMouseLeave={() => setHoveredCard(null)}
              style={cardStyle(`stat-${i}`, s.bg)}
            >
              <div className="text-xs font-black uppercase" style={{ fontFamily: 'Archivo Black' }}>{s.label}</div>
              <div className="text-lg font-black mt-2" style={{ fontFamily: 'Archivo Black' }}>{formatKES(s.val)}</div>
            </div>
          ))}
        </div>

        {/* Verdict Stamp */}
        <div className="flex justify-center py-2">
          <div
            className="px-10 py-6 text-center max-w-lg"
            style={{
              border: '4px solid #000',
              backgroundColor: verdictColor,
              boxShadow: '8px 8px 0 #000',
              transform: 'rotate(-2deg)',
            }}
          >
            <div className="text-xs font-black uppercase tracking-widest mb-2"
              style={{ fontFamily: 'Archivo Black' }}>VERDICT</div>
            <div className="text-xl md:text-2xl font-black uppercase"
              style={{ fontFamily: 'Archivo Black' }}>
              {salaryComparison.verdict === 'slightly_below' ? 'SLIGHTLY BELOW MARKET' : 'ON TRACK'}
            </div>
            <div className="text-sm font-bold mt-3" style={{ fontFamily: 'Work Sans' }}>
              {salaryComparison.verdictText}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs opacity-70">
              <AlertTriangle size={12} />
              <span className="font-bold">Confidence: {salaryComparison.confidence.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Gap to Median */}
        <div
          className="p-6"
          onMouseEnter={() => setHoveredCard('gap')}
          onMouseLeave={() => setHoveredCard(null)}
          style={cardStyle('gap', '#FEF3C7')}
        >
          <div className="text-sm font-black uppercase tracking-wider mb-5"
            style={{ fontFamily: 'Archivo Black' }}>GAP ANALYSIS</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 text-center" style={{ border: '2px solid #000', backgroundColor: '#fff' }}>
              <div className="text-xs font-bold uppercase opacity-70 mb-1">Monthly Gap</div>
              <div className="text-lg font-black" style={{ fontFamily: 'Archivo Black', color: '#EC4899' }}>
                {formatKES(salaryComparison.marketMedian - salaryComparison.userSalary)}
              </div>
            </div>
            <div className="p-5 text-center" style={{ border: '2px solid #000', backgroundColor: '#fff' }}>
              <div className="text-xs font-bold uppercase opacity-70 mb-1">Annual Gap</div>
              <div className="text-lg font-black" style={{ fontFamily: 'Archivo Black', color: '#EC4899' }}>
                {formatKES((salaryComparison.marketMedian - salaryComparison.userSalary) * 12)}
              </div>
            </div>
            <div className="p-5 text-center" style={{ border: '2px solid #000', backgroundColor: '#fff' }}>
              <div className="text-xs font-bold uppercase opacity-70 mb-1">To Reach P75</div>
              <div className="text-lg font-black" style={{ fontFamily: 'Archivo Black', color: '#0EA5E9' }}>
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
    <div className="min-h-screen" style={{ backgroundColor: '#FFFBEB', fontFamily: 'Work Sans' }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Work+Sans:wght@300;400;500;600;700;800&display=swap');`}
      </style>

      {/* Header */}
      <header
        className="sticky top-0 z-50 px-4 sm:px-6 lg:px-8 py-4"
        style={{ backgroundColor: '#000', borderBottom: '4px solid #FDE047' }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-2 font-black text-xs uppercase flex items-center gap-2"
              style={{
                border: '3px solid #FDE047', color: '#FDE047',
                backgroundColor: 'transparent', fontFamily: 'Archivo Black',
                boxShadow: '3px 3px 0 #FDE047', cursor: 'pointer',
              }}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '1px 1px 0 #FDE047';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translate(2px, 2px)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '3px 3px 0 #FDE047';
                (e.currentTarget as HTMLButtonElement).style.transform = 'none';
              }}
            >
              <ArrowLeft size={14} /> GO BACK
            </button>
            <h1
              className="text-lg md:text-xl font-black uppercase tracking-tight hidden sm:block"
              style={{ fontFamily: 'Archivo Black', color: '#FDE047' }}
            >
              KAZI<span style={{ color: '#F472B6' }}>BUDGET</span>
            </h1>
          </div>

          {/* User Badge */}
          <div
            className="px-3 py-1.5 text-xs font-bold hidden md:flex items-center gap-2"
            style={{
              border: '2px solid #FDE047', color: '#FDE047',
              fontFamily: 'Work Sans', transform: 'rotate(1deg)',
            }}
          >
            <User size={12} />
            {userData.name} &mdash; {userData.company}
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[64px] z-40 px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto"
        style={{ backgroundColor: '#FFFBEB', borderBottom: '3px solid #000' }}>
        <div className="max-w-4xl mx-auto flex gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key
            const bgMap: Record<TabKey, string> = {
              input: '#FDE047', dashboard: '#F472B6',
              growth: '#A3E635', comparison: '#38BDF8',
            }
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2 font-black text-xs uppercase tracking-wider whitespace-nowrap"
                style={{
                  border: '3px solid #000',
                  backgroundColor: isActive ? bgMap[tab.key] : '#fff',
                  boxShadow: isActive ? '4px 4px 0 #000' : '2px 2px 0 #000',
                  fontFamily: 'Archivo Black',
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
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === 'input' && renderInput()}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'growth' && renderGrowth()}
        {activeTab === 'comparison' && renderComparison()}
      </main>

      {/* Footer */}
      <footer
        className="mt-16 px-4 sm:px-6 lg:px-8 py-8"
        style={{ borderTop: '4px solid #000', backgroundColor: '#FDE047' }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs font-bold uppercase" style={{ fontFamily: 'Work Sans' }}>
            KaziBudget &mdash; Workplace Salary Calculator for Kenya
          </div>

          {/* Nairobi Stamp */}
          <div
            className="px-4 py-2 text-xs font-black uppercase"
            style={{
              border: '3px solid #000', backgroundColor: '#F472B6',
              transform: 'rotate(-3deg)', fontFamily: 'Archivo Black',
              boxShadow: '3px 3px 0 #000',
            }}
          >
            MADE IN NAIROBI &#127472;&#127466;
          </div>

          <div className="text-xs font-bold opacity-60" style={{ fontFamily: 'Work Sans' }}>
            Design 5 &mdash; Neo-Brutalist
          </div>
        </div>
      </footer>
    </div>
  )
}
