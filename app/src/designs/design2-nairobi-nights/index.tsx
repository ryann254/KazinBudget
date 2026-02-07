import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts'
import {
  userData,
  nairobiAreas,
  taxBreakdown,
  expenseBreakdown,
  dashboardSummary,
  expenseChartData,
  growthProjections,
  growthChartData,
  salaryComparison,
  salaryDistributionData,
  travelDetails,
  rentDetails,
  foodDetails,
  formatKES,
  quickAddExpenses,
  growthAssumptions,
} from '../../data/dummy'

// Neon chart colors for the Nairobi Nights theme
const NEON_COLORS = [
  '#22d3ee', // cyan-400
  '#d946ef', // fuchsia-500
  '#8b5cf6', // violet-500
  '#34d399', // emerald-400
  '#f472b6', // pink-400
  '#a78bfa', // violet-400
  '#67e8f9', // cyan-300
  '#c084fc', // purple-400
  '#2dd4bf', // teal-400
  '#fb923c', // orange-400
  '#e879f9', // fuchsia-400
  '#818cf8', // indigo-400
  '#fbbf24', // amber-400
]

type TabKey = 'input' | 'dashboard' | 'growth' | 'comparison'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'input', label: 'Salary Input' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'growth', label: 'Growth' },
  { key: 'comparison', label: 'Compare' },
]

// Custom tooltip component for Recharts
function NeonTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      {label && <p className="mb-1 text-xs text-slate-400">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {formatKES(entry.value)}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="text-sm font-medium" style={{ color: payload[0].payload.color }}>
        {payload[0].name}: {formatKES(payload[0].value)}
      </p>
    </div>
  )
}

// ----------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------
export default function Design2NairobiNights() {
  const [activeTab, setActiveTab] = useState<TabKey>('input')
  const [formName, setFormName] = useState(userData.name)
  const [formCompany, setFormCompany] = useState(userData.company)
  const [formCompanyLocation, setFormCompanyLocation] = useState(userData.companyLocation)
  const [formResidential, setFormResidential] = useState(userData.residentialArea)
  const [formExperience, setFormExperience] = useState(String(userData.yearsOfExperience))
  const [formSalary, setFormSalary] = useState(String(userData.monthlySalary))
  const [showAddExpense, setShowAddExpense] = useState(false)

  // Group all expenses into a single flat list for the table
  const allExpenses = [
    { name: expenseBreakdown.rent.label, category: expenseBreakdown.rent.category, amount: expenseBreakdown.rent.amount, source: expenseBreakdown.rent.source },
    { name: expenseBreakdown.food.label, category: expenseBreakdown.food.category, amount: expenseBreakdown.food.amount, source: expenseBreakdown.food.source },
    { name: expenseBreakdown.transport.label, category: expenseBreakdown.transport.category, amount: expenseBreakdown.transport.amount, source: expenseBreakdown.transport.source },
    ...expenseBreakdown.custom.map((c) => ({ name: c.name, category: c.category, amount: c.amount, source: c.source })),
  ]

  const growthMilestones = [
    { label: 'Year 3', data: growthProjections.year3 },
    { label: 'Year 5', data: growthProjections.year5 },
    { label: 'Year 7', data: growthProjections.year7 },
    { label: 'Year 10', data: growthProjections.year10 },
  ]

  const comparisonGrowthTable = [
    { label: 'Current', ...growthProjections.current },
    { label: 'Year 3', ...growthProjections.year3 },
    { label: 'Year 5', ...growthProjections.year5 },
    { label: 'Year 7', ...growthProjections.year7 },
    { label: 'Year 10', ...growthProjections.year10 },
  ]

  // Determine verdict styling
  const verdictColorClass =
    salaryComparison.verdict === 'above'
      ? 'from-emerald-600 to-emerald-400'
      : salaryComparison.verdict === 'at_market'
        ? 'from-cyan-600 to-cyan-400'
        : 'from-fuchsia-700 to-rose-500'

  const categoryColor: Record<string, string> = {
    rent: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    food: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    transport: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    fitness: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    utilities: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    entertainment: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    savings: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    giving: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    fees: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  }

  // ----------------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------------
  return (
    <div className="relative min-h-screen bg-slate-950 text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Ambient background glow effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-cyan-500/5 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-fuchsia-500/5 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      {/* ============================================================ */}
      {/* TOP NAVIGATION BAR */}
      {/* ============================================================ */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Left: back link + brand */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="group flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-cyan-400"
            >
              <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">All Designs</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-fuchsia-500">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <span
                className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-lg font-bold tracking-tight text-transparent"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                NightShift
              </span>
            </div>
          </div>

          {/* Center: Tabs */}
          <div className="hidden items-center gap-1 md:flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? 'text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                )}
              </button>
            ))}
          </div>

          {/* Right: dot indicators (mobile) + avatar */}
          <div className="flex items-center gap-3">
            {/* Mobile dot indicators */}
            <div className="flex items-center gap-1.5 md:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    activeTab === tab.key
                      ? 'scale-125 bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]'
                      : 'bg-slate-600 hover:bg-slate-400'
                  }`}
                  aria-label={tab.label}
                />
              ))}
            </div>
            {/* Avatar */}
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-slate-300 lg:inline">{userData.name}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 ring-2 ring-cyan-400/60 shadow-[0_0_12px_rgba(34,211,238,0.3)]">
                <span className="text-sm font-semibold text-cyan-300">
                  {userData.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile tabs below nav */}
        <div className="flex border-t border-white/5 md:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'border-b-2 border-cyan-400 text-cyan-400'
                  : 'text-slate-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ============================================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================================ */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ============================================================ */}
        {/* SECTION 1: USER INPUT FORM */}
        {/* ============================================================ */}
        {activeTab === 'input' && (
          <section className="mx-auto max-w-2xl">
            {/* Hero heading */}
            <div className="mb-10 text-center">
              <h1
                className="mb-3 bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Your Salary, Decoded.
              </h1>
              <p className="text-lg text-slate-400">
                Built for Nairobi hustlers
              </p>
              {/* Decorative line */}
              <div className="mx-auto mt-4 h-px w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            </div>

            {/* Glassmorphism form card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Amani Wanjiku"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Safaricom PLC"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                  />
                </div>

                {/* Company Location + Residential Area side by side */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                      Company Location
                    </label>
                    <select
                      value={formCompanyLocation}
                      onChange={(e) => setFormCompanyLocation(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                    >
                      <option value="" className="bg-slate-900">Select area...</option>
                      {nairobiAreas.map((area) => (
                        <option key={area} value={area} className="bg-slate-900">
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                      Where You Live
                    </label>
                    <select
                      value={formResidential}
                      onChange={(e) => setFormResidential(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
                    >
                      <option value="" className="bg-slate-900">Select area...</option>
                      {nairobiAreas.map((area) => (
                        <option key={area} value={area} className="bg-slate-900">
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience + Salary */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={formExperience}
                      onChange={(e) => setFormExperience(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">
                      Monthly Salary (KES)
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                        KES
                      </span>
                      <input
                        type="number"
                        value={formSalary}
                        onChange={(e) => setFormSalary(e.target.value)}
                        placeholder="120,000"
                        className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-3 pl-14 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="group relative mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-xl hover:shadow-cyan-500/30"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Decode My Salary
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-fuchsia-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </div>

              {/* Supported areas pills */}
              <div className="mt-8 border-t border-white/5 pt-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Supported Nairobi Areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {nairobiAreas.slice(0, 12).map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-xs text-cyan-400/80 shadow-[0_0_4px_rgba(34,211,238,0.1)]"
                    >
                      {area}
                    </span>
                  ))}
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-500">
                    +{nairobiAreas.length - 12} more
                  </span>
                </div>
              </div>
            </div>

            {/* Travel/Rent/Food info cards */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {/* Travel info */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-slate-400">Commute</span>
                </div>
                <p className="text-sm font-semibold text-white">{travelDetails.distance}</p>
                <p className="text-xs text-slate-500">{travelDetails.duration}</p>
              </div>
              {/* Rent info */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-slate-400">Rent ({rentDetails.area})</span>
                </div>
                <p className="text-sm font-semibold text-white">{formatKES(rentDetails.options[1].median)}</p>
                <p className="text-xs text-slate-500">{rentDetails.options[1].type}</p>
              </div>
              {/* Food info */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                    <svg className="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-slate-400">Avg Lunch ({foodDetails.area})</span>
                </div>
                <p className="text-sm font-semibold text-white">{formatKES(foodDetails.avgLunchCost)}</p>
                <p className="text-xs text-slate-500">{foodDetails.workingDays} working days/mo</p>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* SECTION 2: EXPENSES DASHBOARD */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <section>
            {/* Page title */}
            <div className="mb-8">
              <h2
                className="mb-1 text-2xl font-bold text-white sm:text-3xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Expense Dashboard
              </h2>
              <p className="text-sm text-slate-400">
                {userData.name} &middot; {userData.company} &middot; {formatKES(userData.monthlySalary)}/mo
              </p>
            </div>

            {/* 4 stat cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: 'Gross Salary',
                  value: dashboardSummary.grossSalary,
                  border: 'border-t-cyan-400',
                  shadow: 'shadow-cyan-500/5',
                  icon: (
                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  label: 'Tax Deductions',
                  value: dashboardSummary.totalDeductions,
                  border: 'border-t-fuchsia-500',
                  shadow: 'shadow-fuchsia-500/5',
                  icon: (
                    <svg className="h-5 w-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                    </svg>
                  ),
                },
                {
                  label: 'Living Expenses',
                  value: dashboardSummary.totalExpenses,
                  border: 'border-t-violet-500',
                  shadow: 'shadow-violet-500/5',
                  icon: (
                    <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                  ),
                },
                {
                  label: 'Take-Home',
                  value: dashboardSummary.takeHome,
                  border: 'border-t-emerald-400',
                  shadow: 'shadow-emerald-500/5',
                  icon: (
                    <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  ),
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className={`rounded-2xl border border-white/10 border-t-2 ${card.border} bg-white/5 p-5 backdrop-blur-xl transition-all hover:bg-white/[0.07] hover:shadow-lg ${card.shadow}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      {card.label}
                    </span>
                    {card.icon}
                  </div>
                  <p
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {formatKES(card.value)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {Math.round((card.value / dashboardSummary.grossSalary) * 100)}% of gross
                  </p>
                </div>
              ))}
            </div>

            {/* Chart + Expense table layout */}
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Donut chart */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:col-span-2">
                <h3
                  className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Breakdown
                </h3>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {expenseChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={NEON_COLORS[index % NEON_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend below chart */}
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {expenseChartData.slice(0, 8).map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: NEON_COLORS[i % NEON_COLORS.length] }}
                      />
                      <span className="truncate text-slate-400">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense table */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider text-slate-300"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    All Expenses
                  </h3>
                  <button
                    onClick={() => setShowAddExpense(!showAddExpense)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-110 hover:shadow-cyan-500/40"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Quick-add chips */}
                {showAddExpense && (
                  <div className="mb-4 rounded-xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="mb-2 text-xs font-medium text-slate-400">Quick Add</p>
                    <div className="flex flex-wrap gap-2">
                      {quickAddExpenses.map((qe) => (
                        <button
                          key={qe.name}
                          className="rounded-full border border-cyan-500/30 bg-cyan-500/5 px-3 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                        >
                          {qe.name} &middot; {formatKES(qe.defaultAmount)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Category</th>
                        <th className="pb-3 text-right font-medium">Amount</th>
                        <th className="hidden pb-3 text-right font-medium sm:table-cell">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allExpenses.map((exp, i) => (
                        <tr
                          key={i}
                          className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                        >
                          <td className="py-3 font-medium text-slate-200">{exp.name}</td>
                          <td className="py-3">
                            <span
                              className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                categoryColor[exp.category] || 'bg-white/10 text-slate-300 border-white/20'
                              }`}
                            >
                              {exp.category}
                            </span>
                          </td>
                          <td className="py-3 text-right font-medium tabular-nums text-white">
                            {formatKES(exp.amount)}
                          </td>
                          <td className="hidden py-3 text-right text-xs text-slate-500 sm:table-cell">
                            {exp.source === 'auto' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 px-2 py-0.5 text-cyan-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.6)]" />
                                auto
                              </span>
                            ) : (
                              <span className="text-slate-500">manual</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-white/10">
                        <td colSpan={2} className="pt-3 text-sm font-semibold text-slate-300">
                          Total Expenses
                        </td>
                        <td className="pt-3 text-right text-sm font-bold tabular-nums text-emerald-400">
                          {formatKES(dashboardSummary.totalExpenses)}
                        </td>
                        <td className="hidden sm:table-cell" />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Tax breakdown details */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3
                className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Tax Deduction Details
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { label: 'PAYE', value: taxBreakdown.paye, color: 'text-fuchsia-400' },
                  { label: 'NSSF', value: taxBreakdown.nssf, color: 'text-violet-400' },
                  { label: 'SHIF', value: taxBreakdown.shif, color: 'text-pink-400' },
                  { label: 'Housing Levy', value: taxBreakdown.housingLevy, color: 'text-rose-400' },
                  { label: 'Personal Relief', value: -taxBreakdown.personalRelief, color: 'text-emerald-400' },
                ].map((tax) => (
                  <div
                    key={tax.label}
                    className="rounded-xl border border-white/5 bg-slate-900/40 px-4 py-3"
                  >
                    <p className="text-xs text-slate-500">{tax.label}</p>
                    <p className={`text-lg font-bold tabular-nums ${tax.color}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      {tax.value < 0 ? '-' : ''}{formatKES(Math.abs(tax.value))}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3">
                <span className="text-sm font-medium text-slate-300">Net After Tax</span>
                <span
                  className="text-xl font-bold text-cyan-400"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {formatKES(taxBreakdown.netAfterTax)}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* SECTION 3: GROWTH PROJECTIONS */}
        {/* ============================================================ */}
        {activeTab === 'growth' && (
          <section>
            {/* Title */}
            <div className="mb-8">
              <h2
                className="mb-1 bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Growth Projections
              </h2>
              <p className="text-sm text-slate-400">
                Estimated salary trajectory over the next decade
              </p>
            </div>

            {/* Milestone cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {growthMilestones.map((milestone, idx) => (
                <div
                  key={milestone.label}
                  className="group relative overflow-hidden rounded-2xl p-px"
                >
                  {/* Gradient border */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 opacity-40 transition-opacity group-hover:opacity-70" />
                  {/* Inner content */}
                  <div className="relative rounded-2xl bg-slate-950 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span
                        className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400"
                      >
                        {milestone.label}
                      </span>
                      <span className="text-xs text-emerald-400">
                        +{Math.round(((milestone.data.salary - growthProjections.current.salary) / growthProjections.current.salary) * 100)}%
                      </span>
                    </div>
                    <p
                      className="mb-1 text-2xl font-bold text-white"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {formatKES(milestone.data.salary)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Take-Home: <span className="text-emerald-400">{formatKES(milestone.data.takeHome)}</span>
                    </p>
                    <div className="mt-3 flex items-center gap-3 border-t border-white/5 pt-3">
                      <div className="text-xs">
                        <span className="text-slate-500">Tax: </span>
                        <span className="text-fuchsia-400">{formatKES(milestone.data.totalTax)}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500">Exp: </span>
                        <span className="text-violet-400">{formatKES(milestone.data.totalExpenses)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Line chart */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3
                className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                10-Year Trajectory
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={growthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="year"
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                    tickFormatter={(v) => `Yr ${v}`}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<NeonTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: 16, fontSize: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="salary"
                    name="Gross Salary"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#22d3ee', stroke: '#0e7490', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="takeHome"
                    name="Take-Home"
                    stroke="#34d399"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#34d399', stroke: '#059669', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#d946ef"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={false}
                    activeDot={{ r: 5, fill: '#d946ef', stroke: '#a21caf', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="taxes"
                    name="Taxes"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    strokeDasharray="6 3"
                    dot={false}
                    activeDot={{ r: 5, fill: '#8b5cf6', stroke: '#6d28d9', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Assumptions + Comparison table */}
            <div className="grid gap-6 lg:grid-cols-5">
              {/* Assumptions panel */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:col-span-2">
                <h3
                  className="mb-5 text-sm font-semibold uppercase tracking-wider text-slate-300"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Assumptions
                </h3>
                <div className="space-y-5">
                  {[
                    { label: 'Salary Growth', value: growthAssumptions.salaryGrowthRate, max: 20, color: 'cyan' },
                    { label: 'Rent Inflation', value: growthAssumptions.rentInflation, max: 15, color: 'violet' },
                    { label: 'Food Inflation', value: growthAssumptions.foodInflation, max: 15, color: 'fuchsia' },
                    { label: 'Transport Inflation', value: growthAssumptions.transportInflation, max: 15, color: 'emerald' },
                    { label: 'General CPI', value: growthAssumptions.generalCPI, max: 15, color: 'amber' },
                  ].map((a) => {
                    const accentMap: Record<string, { track: string; thumb: string; text: string }> = {
                      cyan: { track: 'bg-cyan-400', thumb: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]', text: 'text-cyan-400' },
                      violet: { track: 'bg-violet-500', thumb: 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]', text: 'text-violet-400' },
                      fuchsia: { track: 'bg-fuchsia-500', thumb: 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.6)]', text: 'text-fuchsia-400' },
                      emerald: { track: 'bg-emerald-400', thumb: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]', text: 'text-emerald-400' },
                      amber: { track: 'bg-amber-400', thumb: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]', text: 'text-amber-400' },
                    }
                    const accent = accentMap[a.color] || accentMap.cyan
                    const pct = (a.value / a.max) * 100
                    return (
                      <div key={a.label}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm text-slate-400">{a.label}</span>
                          <span className={`text-sm font-semibold tabular-nums ${accent.text}`}>
                            {a.value}%
                          </span>
                        </div>
                        <div className="relative h-2 w-full rounded-full bg-white/5">
                          <div
                            className={`h-full rounded-full ${accent.track}`}
                            style={{ width: `${pct}%` }}
                          />
                          <div
                            className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full ${accent.thumb}`}
                            style={{ left: `calc(${pct}% - 8px)` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Comparison table */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:col-span-3">
                <h3
                  className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Year-by-Year Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-slate-500">
                        <th className="pb-3 font-medium">Period</th>
                        <th className="pb-3 text-right font-medium">Salary</th>
                        <th className="hidden pb-3 text-right font-medium sm:table-cell">Tax</th>
                        <th className="hidden pb-3 text-right font-medium sm:table-cell">Expenses</th>
                        <th className="pb-3 text-right font-medium">Take-Home</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonGrowthTable.map((row, idx) => (
                        <tr
                          key={row.label}
                          className={`border-b border-white/5 transition-colors hover:bg-white/[0.03] ${
                            idx % 2 === 1 ? 'bg-white/[0.02]' : ''
                          }`}
                        >
                          <td className="py-3 font-medium text-slate-300">{row.label}</td>
                          <td className="py-3 text-right tabular-nums text-white">
                            {formatKES(row.salary)}
                          </td>
                          <td className="hidden py-3 text-right tabular-nums text-fuchsia-400 sm:table-cell">
                            {formatKES(row.totalTax)}
                          </td>
                          <td className="hidden py-3 text-right tabular-nums text-violet-400 sm:table-cell">
                            {formatKES(row.totalExpenses)}
                          </td>
                          <td className="py-3 text-right font-semibold tabular-nums text-emerald-400">
                            {formatKES(row.takeHome)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ============================================================ */}
        {/* SECTION 4: SALARY COMPARISON */}
        {/* ============================================================ */}
        {activeTab === 'comparison' && (
          <section>
            {/* Title */}
            <div className="mb-8">
              <h2
                className="mb-1 text-2xl font-bold text-white sm:text-3xl"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Salary Comparison
              </h2>
              <p className="text-sm text-slate-400">
                How does your salary stack up against the market?
              </p>
            </div>

            {/* Verdict banner */}
            <div
              className={`mb-8 overflow-hidden rounded-2xl bg-gradient-to-r ${verdictColorClass} p-px`}
            >
              <div className="rounded-2xl bg-slate-950/90 px-6 py-5 backdrop-blur-xl sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                      Market Verdict
                    </p>
                    <p
                      className="text-xl font-bold text-white sm:text-2xl"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {salaryComparison.verdictText}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
                      {salaryComparison.percentile}th percentile
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
                      n={salaryComparison.sampleSize}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat boxes */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Your Salary', value: salaryComparison.userSalary, glow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]', border: 'border-cyan-500/30' },
                { label: 'Market Median', value: salaryComparison.marketMedian, glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]', border: 'border-violet-500/30' },
                { label: '25th Percentile', value: salaryComparison.p25, glow: 'shadow-[0_0_20px_rgba(217,70,239,0.15)]', border: 'border-fuchsia-500/30' },
                { label: '75th Percentile', value: salaryComparison.p75, glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]', border: 'border-emerald-500/30' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl border ${stat.border} bg-white/5 p-5 backdrop-blur-xl transition-all hover:bg-white/[0.07] ${stat.glow}`}
                >
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                    {stat.label}
                  </p>
                  <p
                    className="text-2xl font-bold tabular-nums text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {formatKES(stat.value)}
                  </p>
                </div>
              ))}
            </div>

            {/* Bell curve / distribution chart */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3
                className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Salary Distribution
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={salaryDistributionData}>
                  <defs>
                    <linearGradient id="neonGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#d946ef" stopOpacity={0.4} />
                    </linearGradient>
                    <linearGradient id="neonStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="salary"
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null
                      return (
                        <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                          <p className="text-sm text-cyan-400">
                            {formatKES(payload[0].payload.salary)}
                          </p>
                          <p className="text-xs text-slate-400">
                            Frequency: {payload[0].value}
                          </p>
                        </div>
                      )
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="frequency"
                    stroke="url(#neonStroke)"
                    strokeWidth={2.5}
                    fill="url(#neonGradient)"
                  />
                  {/* User position reference line (rendered as a second area with a single data point to create a vertical effect) */}
                  {/* We'll use the ReferenceLine-like approach via CartesianGrid + custom element */}
                </AreaChart>
              </ResponsiveContainer>

              {/* User position indicator */}
              <div className="mt-4 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                  <span className="text-xs text-slate-400">
                    Your Salary: <span className="font-semibold text-cyan-400">{formatKES(salaryComparison.userSalary)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                  <span className="text-xs text-slate-400">
                    Median: <span className="font-semibold text-violet-400">{formatKES(salaryComparison.marketMedian)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Info badges */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  label: 'Role',
                  value: salaryComparison.role,
                  icon: (
                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  accent: 'border-cyan-500/20 bg-cyan-500/5',
                },
                {
                  label: 'Location',
                  value: salaryComparison.location,
                  icon: (
                    <svg className="h-5 w-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ),
                  accent: 'border-violet-500/20 bg-violet-500/5',
                },
                {
                  label: 'Experience',
                  value: salaryComparison.experienceBand,
                  icon: (
                    <svg className="h-5 w-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ),
                  accent: 'border-fuchsia-500/20 bg-fuchsia-500/5',
                },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className={`flex items-center gap-4 rounded-2xl border ${badge.accent} p-5 backdrop-blur-xl`}
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/5">
                    {badge.icon}
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      {badge.label}
                    </p>
                    <p className="text-sm font-semibold text-white">{badge.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional context */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3
                    className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-300"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Data Confidence
                  </h3>
                  <p className="text-sm text-slate-400">
                    Based on{' '}
                    <span className="font-medium text-white">{salaryComparison.sampleSize}</span>{' '}
                    salary reports for{' '}
                    <span className="font-medium text-cyan-400">{salaryComparison.role}</span>{' '}
                    in{' '}
                    <span className="font-medium text-violet-400">{salaryComparison.location}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Confidence:</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      salaryComparison.confidence === 'high'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : salaryComparison.confidence === 'medium'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {salaryComparison.confidence}
                  </span>
                  <span className="text-xs text-slate-600">
                    Updated: {salaryComparison.lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ============================================================ */}
      {/* FOOTER */}
      {/* ============================================================ */}
      <footer className="relative z-10 border-t border-white/5 bg-slate-950/60">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-slate-600">
              NightShift &mdash; Salary decoded for Nairobi&apos;s finest.
            </p>
            <p className="text-xs text-slate-700">
              Built with data from KRA, KNBS &amp; crowd-sourced reports.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
