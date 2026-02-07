import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts'
import {
  userData, taxBreakdown, expenseBreakdown, dashboardSummary,
  expenseChartData, growthProjections, growthChartData, salaryComparison,
  salaryDistributionData, travelDetails, rentDetails, foodDetails,
  formatKES, growthAssumptions,
} from '../../data/dummy'
import {
  Home, User, BarChart3, TrendingUp, Users, ArrowLeft,
  Sparkles, Gem, Crown, Star,
} from 'lucide-react'

// ============================================================
// Design 3 — Glassmorphism Luxe
// Premium frosted-glass UI for KaziBudget salary calculator
// ============================================================

type TabKey = 'input' | 'dashboard' | 'growth' | 'comparison'

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'input', label: 'Input', icon: <User size={16} /> },
  { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
  { key: 'growth', label: 'Growth', icon: <TrendingUp size={16} /> },
  { key: 'comparison', label: 'Comparison', icon: <Users size={16} /> },
]

/* ---------- glass utility classes ---------- */
const glassCard = 'backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl'
const glassCardDeep = 'backdrop-blur-xl bg-white/[0.07] border border-white/15 rounded-2xl shadow-2xl'
const glassInput =
  'w-full bg-white/[0.06] border-b border-white/25 rounded-t-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-400 focus:bg-white/10 transition-all duration-300'
const glassTooltip: React.CSSProperties = {
  backgroundColor: 'rgba(15, 10, 40, 0.85)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '13px',
  padding: '10px 14px',
}

/* ---------- chart palette ---------- */
const DONUT_COLORS = [
  '#F4A0A0', '#E8B4B8', '#C4B5FD', '#A78BFA', '#D4AF37',
  '#c084fc', '#f9a8d4', '#818cf8', '#6ee7b7', '#fcd34d',
  '#f87171', '#a5b4fc', '#67e8f9',
]

/* ---------- custom tooltip ---------- */
const GlassTooltipContent = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={glassTooltip}>
      {label !== undefined && <p className="mb-1 text-white/60 text-xs">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color ?? '#fff' }} className="text-sm font-medium">
          {p.name}: {formatKES(p.value)}
        </p>
      ))}
    </div>
  )
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function Design3Glass() {
  const [activeTab, setActiveTab] = useState<TabKey>('input')
  const navigate = useNavigate()

  // ---- form state (dummy prefilled) ----
  const [salary, setSalary] = useState(userData.monthlySalary.toString())
  const [company, setCompany] = useState(userData.company)
  const [companyLocation, setCompanyLocation] = useState(userData.companyLocation)
  const [residence, setResidence] = useState(userData.residentialArea)
  const [experience, setExperience] = useState(userData.yearsOfExperience.toString())

  // ---- helpers ----
  const totalExpenses = expenseChartData.reduce((s, e) => s + e.value, 0)

  return (
    <>
      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Nunito+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <div
        className="min-h-screen w-full relative overflow-x-hidden"
        style={{
          fontFamily: "'Nunito Sans', sans-serif",
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #1e293b 100%)',
        }}
      >
        {/* ---- animated background blobs ---- */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 -right-20 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute top-3/4 left-1/3 w-72 h-72 bg-indigo-500/25 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '4s' }}
          />
          {/* small decorative orbs */}
          <div className="absolute top-[12%] right-[18%] w-14 h-14 bg-white/[0.06] rounded-full blur-sm" />
          <div className="absolute bottom-[15%] left-[10%] w-10 h-10 bg-violet-300/10 rounded-full blur-sm" />
          <div className="absolute top-[55%] right-[8%] w-8 h-8 bg-rose-300/10 rounded-full blur-sm" />
        </div>

        {/* ---- page wrapper ---- */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-28">
          {/* ---- header ---- */}
          <header className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:text-white ${glassCard} hover:shadow-violet-500/20 transition-all duration-300`}
            >
              <ArrowLeft size={16} /> Home
            </button>

            <div className="flex items-center gap-2">
              <Gem size={20} className="text-violet-300" />
              <h1
                className="text-2xl sm:text-3xl font-light text-white tracking-wide"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                KaziBudget
              </h1>
            </div>
          </header>

          {/* ---- tab navigation ---- */}
          <nav className={`flex justify-center gap-1 p-1.5 mb-8 mx-auto w-fit ${glassCard}`}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === t.key
                    ? 'bg-white/20 text-white shadow-lg shadow-violet-500/20'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>

          {/* ---- tab content ---- */}
          <div className="transition-all duration-500">
            {activeTab === 'input' && <InputTab {...{ salary, setSalary, company, setCompany, companyLocation, setCompanyLocation, residence, setResidence, experience, setExperience }} />}
            {activeTab === 'dashboard' && <DashboardTab totalExpenses={totalExpenses} />}
            {activeTab === 'growth' && <GrowthTab />}
            {activeTab === 'comparison' && <ComparisonTab />}
          </div>
        </div>
      </div>
    </>
  )
}

/* ============================================================
   INPUT TAB
   ============================================================ */
interface InputProps {
  salary: string; setSalary: (v: string) => void
  company: string; setCompany: (v: string) => void
  companyLocation: string; setCompanyLocation: (v: string) => void
  residence: string; setResidence: (v: string) => void
  experience: string; setExperience: (v: string) => void
}

function InputTab({ salary, setSalary, company, setCompany, companyLocation, setCompanyLocation, residence, setResidence, experience, setExperience }: InputProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* hero */}
      <div className="text-center mb-10">
        <Crown size={36} className="mx-auto mb-3 text-amber-300/80" />
        <h2
          className="text-3xl sm:text-4xl text-white font-light mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Your Salary Details
        </h2>
        <p className="text-white/50 text-sm">Enter your information to unlock premium insights</p>
      </div>

      {/* form card */}
      <div className={`${glassCard} p-6 sm:p-8 space-y-6`}>
        {/* salary */}
        <div className="space-y-1.5">
          <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">
            Monthly Gross Salary (KES)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">KES</span>
            <input
              type="text"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className={`${glassInput} pl-14`}
            />
          </div>
        </div>

        {/* company + location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Company</label>
            <input value={company} onChange={(e) => setCompany(e.target.value)} className={glassInput} placeholder="e.g. Safaricom" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Office Location</label>
            <input value={companyLocation} onChange={(e) => setCompanyLocation(e.target.value)} className={glassInput} placeholder="e.g. Westlands" />
          </div>
        </div>

        {/* residence + experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Residential Area</label>
            <input value={residence} onChange={(e) => setResidence(e.target.value)} className={glassInput} placeholder="e.g. Juja" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Years of Experience</label>
            <input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} className={glassInput} placeholder="e.g. 3" />
          </div>
        </div>
      </div>

      {/* quick expense cards */}
      <div className={`${glassCardDeep} p-6 sm:p-8`}>
        <h3
          className="text-lg text-white/90 mb-1 font-medium"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Auto-Estimated Expenses
        </h3>
        <p className="text-white/40 text-xs mb-5">Based on your residential area</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* rent */}
          <div className={`${glassCard} p-4 hover:bg-white/15 transition-all duration-300 group`}>
            <div className="flex items-center gap-2 mb-2">
              <Home size={16} className="text-violet-300 group-hover:text-violet-200" />
              <span className="text-white/60 text-xs uppercase tracking-wider">Rent</span>
            </div>
            <p className="text-white text-xl font-semibold">{formatKES(expenseBreakdown.rent.amount)}</p>
            <p className="text-white/40 text-xs mt-1">{rentDetails.options[1].type} &mdash; {rentDetails.area}</p>
          </div>

          {/* food */}
          <div className={`${glassCard} p-4 hover:bg-white/15 transition-all duration-300 group`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-rose-300 group-hover:text-rose-200" />
              <span className="text-white/60 text-xs uppercase tracking-wider">Food</span>
            </div>
            <p className="text-white text-xl font-semibold">{formatKES(expenseBreakdown.food.amount)}</p>
            <p className="text-white/40 text-xs mt-1">{foodDetails.workingDays} days &times; {formatKES(foodDetails.avgLunchCost)}</p>
          </div>

          {/* transport */}
          <div className={`${glassCard} p-4 hover:bg-white/15 transition-all duration-300 group`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-amber-300 group-hover:text-amber-200" />
              <span className="text-white/60 text-xs uppercase tracking-wider">Transport</span>
            </div>
            <p className="text-white text-xl font-semibold">{formatKES(expenseBreakdown.transport.amount)}</p>
            <p className="text-white/40 text-xs mt-1">{travelDetails.modes[0].mode} &mdash; {travelDetails.distance}</p>
          </div>
        </div>
      </div>

      {/* custom expenses */}
      <div className={`${glassCardDeep} p-6 sm:p-8`}>
        <h3
          className="text-lg text-white/90 mb-1 font-medium"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Custom Expenses
        </h3>
        <p className="text-white/40 text-xs mb-5">Additional monthly obligations</p>
        <div className="space-y-3">
          {expenseBreakdown.custom.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <span className="text-white/80 text-sm">{item.name}</span>
              <span className="text-white font-semibold text-sm">{formatKES(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   DASHBOARD TAB
   ============================================================ */
function DashboardTab({ totalExpenses }: { totalExpenses: number }) {
  const summaryCards = [
    { label: 'Gross Salary', value: dashboardSummary.grossSalary, icon: <Crown size={22} />, accent: 'text-amber-300' },
    { label: 'Tax & Deductions', value: dashboardSummary.totalDeductions, icon: <BarChart3 size={22} />, accent: 'text-rose-300' },
    { label: 'Total Expenses', value: dashboardSummary.totalExpenses, icon: <Star size={22} />, accent: 'text-violet-300' },
    { label: 'Take-Home', value: dashboardSummary.takeHome, icon: <Sparkles size={22} />, accent: 'text-emerald-300' },
  ]

  return (
    <div className="space-y-6">
      {/* section title */}
      <div className="text-center mb-2">
        <h2
          className="text-3xl text-white font-light"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Financial Overview
        </h2>
        <p className="text-white/40 text-sm mt-1">Your monthly salary breakdown at a glance</p>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c) => (
          <div
            key={c.label}
            className={`${glassCard} p-5 hover:bg-white/15 hover:shadow-violet-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}
          >
            {/* icon bg */}
            <div className="absolute -top-3 -right-3 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
              {c.icon && <div className="scale-[3]">{c.icon}</div>}
            </div>
            <div className={`mb-2 ${c.accent}`}>{c.icon}</div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{c.label}</p>
            <p className="text-white text-xl font-bold">{formatKES(c.value)}</p>
          </div>
        ))}
      </div>

      {/* chart + table row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* donut chart */}
        <div className={`${glassCard} p-6`}>
          <h3
            className="text-lg text-white/90 mb-4 font-medium"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Expense Distribution
          </h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseChartData.map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<GlassTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* centre label */}
          <div className="text-center -mt-4">
            <p className="text-white/40 text-xs uppercase">Total</p>
            <p className="text-white text-lg font-bold">{formatKES(totalExpenses)}</p>
          </div>
        </div>

        {/* tax breakdown table */}
        <div className={`${glassCard} p-6`}>
          <h3
            className="text-lg text-white/90 mb-4 font-medium"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Tax & Statutory Deductions
          </h3>
          <div className="space-y-3">
            {([
              { label: 'PAYE', value: taxBreakdown.paye },
              { label: 'NSSF', value: taxBreakdown.nssf },
              { label: 'SHIF', value: taxBreakdown.shif },
              { label: 'Housing Levy', value: taxBreakdown.housingLevy },
              { label: 'Personal Relief', value: -taxBreakdown.personalRelief },
            ]).map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10"
              >
                <span className="text-white/60 text-sm">{row.label}</span>
                <span className={`font-semibold text-sm ${row.value < 0 ? 'text-emerald-400' : 'text-white'}`}>
                  {row.value < 0 ? `- ${formatKES(Math.abs(row.value))}` : formatKES(row.value)}
                </span>
              </div>
            ))}
            {/* total */}
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 border border-white/20">
              <span className="text-white font-semibold text-sm">Net Deductions</span>
              <span className="text-rose-300 font-bold text-sm">{formatKES(taxBreakdown.totalDeductions)}</span>
            </div>
          </div>

          {/* net after tax */}
          <div className="mt-5 text-center p-4 rounded-xl bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-400/20">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Net After Tax</p>
            <p className="text-white text-2xl font-bold">{formatKES(taxBreakdown.netAfterTax)}</p>
          </div>
        </div>
      </div>

      {/* full expense table */}
      <div className={`${glassCardDeep} p-6`}>
        <h3
          className="text-lg text-white/90 mb-4 font-medium"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          All Expenses
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/40 text-xs uppercase tracking-wider border-b border-white/10">
                <th className="pb-3 pr-4">Expense</th>
                <th className="pb-3 pr-4">Category</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {expenseChartData.map((e, i) => (
                <tr key={i} className="border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors">
                  <td className="py-3 pr-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                    <span className="text-white/80">{e.name}</span>
                  </td>
                  <td className="py-3 pr-4 text-white/40 capitalize">{e.category}</td>
                  <td className="py-3 text-right text-white font-medium">{formatKES(e.value)}</td>
                  <td className="py-3 text-right text-white/50">{((e.value / totalExpenses) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   GROWTH TAB
   ============================================================ */
function GrowthTab() {
  const milestones = [
    { year: 3, data: growthProjections.year3, icon: <Star size={18} />, depth: 'bg-white/10' },
    { year: 5, data: growthProjections.year5, icon: <Sparkles size={18} />, depth: 'bg-white/[0.12]' },
    { year: 7, data: growthProjections.year7, icon: <Gem size={18} />, depth: 'bg-white/[0.08]' },
    { year: 10, data: growthProjections.year10, icon: <Crown size={18} />, depth: 'bg-white/[0.14]' },
  ]

  return (
    <div className="space-y-6">
      {/* title */}
      <div className="text-center mb-2">
        <h2
          className="text-3xl text-white font-light"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Growth Projections
        </h2>
        <p className="text-white/40 text-sm mt-1">
          Based on {growthAssumptions.salaryGrowthRate}% annual salary growth &amp; {growthAssumptions.generalCPI}% inflation
        </p>
      </div>

      {/* area chart */}
      <div className={`${glassCard} p-6`}>
        <h3
          className="text-lg text-white/90 mb-4 font-medium"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          10-Year Salary Trajectory
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={growthChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="glassSalary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4B5FD" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#C4B5FD" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="glassTakeHome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6EE7B7" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6EE7B7" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="glassExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F4A0A0" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F4A0A0" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickFormatter={(v) => `Yr ${v}`} />
            <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<GlassTooltipContent />} />
            <Area type="monotone" dataKey="salary" name="Gross Salary" stroke="#C4B5FD" fill="url(#glassSalary)" strokeWidth={2} />
            <Area type="monotone" dataKey="takeHome" name="Take Home" stroke="#6EE7B7" fill="url(#glassTakeHome)" strokeWidth={2} />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#F4A0A0" fill="url(#glassExpenses)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>

        {/* chart legend */}
        <div className="flex justify-center gap-6 mt-4">
          {[
            { color: '#C4B5FD', label: 'Gross Salary' },
            { color: '#6EE7B7', label: 'Take Home' },
            { color: '#F4A0A0', label: 'Expenses' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-xs text-white/50">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* milestone cards — varying depth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {milestones.map((m) => (
          <div
            key={m.year}
            className={`backdrop-blur-xl ${m.depth} border border-white/15 rounded-2xl shadow-2xl p-5 hover:-translate-y-2 hover:shadow-violet-500/15 transition-all duration-500 group`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-amber-300/80 group-hover:text-amber-300 transition-colors">{m.icon}</span>
              <span
                className="text-white/70 text-sm font-medium"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Year {m.year}
              </span>
            </div>
            <p className="text-white text-2xl font-bold mb-1">{formatKES(m.data.salary)}</p>
            <p className="text-white/40 text-xs">Gross Salary</p>
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Take Home</span>
                <span className="text-emerald-400 font-medium">{formatKES(m.data.takeHome)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Expenses</span>
                <span className="text-rose-300 font-medium">{formatKES(m.data.totalExpenses)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Taxes</span>
                <span className="text-violet-300 font-medium">{formatKES(m.data.totalTax)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* assumptions card */}
      <div className={`${glassCardDeep} p-6`}>
        <h3
          className="text-lg text-white/90 mb-4 font-medium"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Growth Assumptions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            { label: 'Salary Growth', value: `${growthAssumptions.salaryGrowthRate}%` },
            { label: 'Rent Inflation', value: `${growthAssumptions.rentInflation}%` },
            { label: 'Food Inflation', value: `${growthAssumptions.foodInflation}%` },
            { label: 'General CPI', value: `${growthAssumptions.generalCPI}%` },
          ]).map((a) => (
            <div key={a.label} className="text-center p-3 rounded-xl bg-white/[0.04] border border-white/10">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{a.label}</p>
              <p className="text-white text-lg font-bold">{a.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   COMPARISON TAB
   ============================================================ */
function ComparisonTab() {
  const sc = salaryComparison
  const maxFreq = Math.max(...salaryDistributionData.map((d) => d.frequency))

  // verdict styling
  const verdictMap: Record<string, { label: string; color: string; glow: string }> = {
    below: { label: 'Below Market', color: 'text-rose-300', glow: 'shadow-rose-500/20' },
    slightly_below: { label: 'Slightly Below', color: 'text-amber-300', glow: 'shadow-amber-500/20' },
    average: { label: 'Market Average', color: 'text-violet-300', glow: 'shadow-violet-500/20' },
    above: { label: 'Above Market', color: 'text-emerald-300', glow: 'shadow-emerald-500/20' },
  }
  const v = verdictMap[sc.verdict] ?? verdictMap.average

  return (
    <div className="space-y-6">
      {/* title */}
      <div className="text-center mb-2">
        <h2
          className="text-3xl text-white font-light"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Market Comparison
        </h2>
        <p className="text-white/40 text-sm mt-1">
          {sc.role} &middot; {sc.experienceBand} &middot; {sc.location}
        </p>
      </div>

      {/* verdict hero card */}
      <div className={`${glassCard} p-8 text-center ${v.glow} shadow-2xl`}>
        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 border border-white/20 mb-4 ${v.color}`}>
          <Gem size={16} />
          <span className="font-semibold text-sm">{v.label}</span>
        </div>
        <p className="text-white/60 text-sm mb-3">{sc.verdictText}</p>

        {/* percentile bar */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>0th</span>
            <span>50th</span>
            <span>100th</span>
          </div>
          <div className="relative h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${sc.percentile}%`,
                background: 'linear-gradient(90deg, #C4B5FD, #D4AF37)',
              }}
            />
            {/* marker */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-violet-400 shadow-lg shadow-violet-500/40"
              style={{ left: `calc(${sc.percentile}% - 8px)` }}
            />
          </div>
          <p className="text-white/70 text-sm mt-2 font-semibold">{sc.percentile}th Percentile</p>
        </div>
      </div>

      {/* stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Your Salary', value: sc.userSalary, accent: 'text-white' },
          { label: 'Market Median', value: sc.marketMedian, accent: 'text-violet-300' },
          { label: '25th Percentile', value: sc.p25, accent: 'text-white/70' },
          { label: '75th Percentile', value: sc.p75, accent: 'text-amber-300' },
        ]).map((s) => (
          <div key={s.label} className={`${glassCard} p-5 text-center hover:bg-white/15 transition-all duration-300`}>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.accent}`}>{formatKES(s.value)}</p>
          </div>
        ))}
      </div>

      {/* bell curve (area chart) */}
      <div className={`${glassCard} p-6`}>
        <h3
          className="text-lg text-white/90 mb-4 font-medium"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Salary Distribution &mdash; {sc.sampleSize} responses
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={salaryDistributionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="glassBell" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="salary"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              hide
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div style={glassTooltip}>
                    <p className="text-white/60 text-xs mb-1">Salary: {formatKES(d.salary)}</p>
                    <p className="text-white text-sm font-medium">Respondents: {d.frequency}</p>
                  </div>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="frequency"
              name="Frequency"
              stroke="#A78BFA"
              fill="url(#glassBell)"
              strokeWidth={2}
            />
            {/* reference line for user salary */}
            <Line
              type="monotone"
              dataKey={() => maxFreq}
              stroke="transparent"
              dot={false}
              activeDot={false}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* user indicator */}
        <div className="flex justify-center mt-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs text-white/70">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Your salary: {formatKES(sc.userSalary)} &mdash; {sc.percentile}th percentile
          </div>
        </div>
      </div>

      {/* detailed comparison */}
      <div className={`${glassCardDeep} p-6`}>
        <h3
          className="text-lg text-white/90 mb-4 font-medium"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Detailed Breakdown
        </h3>
        <div className="space-y-4">
          {/* visual bar comparisons */}
          {([
            { label: 'Your Salary', amount: sc.userSalary, color: '#D4AF37', max: sc.p75 },
            { label: 'Market Median', amount: sc.marketMedian, color: '#A78BFA', max: sc.p75 },
            { label: 'Market Mean', amount: sc.marketMean, color: '#C4B5FD', max: sc.p75 },
            { label: '75th Percentile', amount: sc.p75, color: '#F4A0A0', max: sc.p75 },
          ]).map((bar) => (
            <div key={bar.label}>
              <div className="flex justify-between mb-1">
                <span className="text-white/60 text-sm">{bar.label}</span>
                <span className="text-white font-semibold text-sm">{formatKES(bar.amount)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min((bar.amount / bar.max) * 100, 100)}%`,
                    backgroundColor: bar.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* meta */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-white/40">
          <span>Sample: {sc.sampleSize} responses</span>
          <span>Confidence: {sc.confidence}</span>
          <span>Updated: {sc.lastUpdated}</span>
        </div>
      </div>
    </div>
  )
}
