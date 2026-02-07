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

type TabKey = 'input' | 'dashboard' | 'growth' | 'comparison'

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'input', label: 'Calculator', icon: 'M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z' },
  { key: 'dashboard', label: 'Dashboard', icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z' },
  { key: 'growth', label: 'Growth', icon: 'M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941' },
  { key: 'comparison', label: 'Compare', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z' },
]

const categoryColors: Record<string, string> = {
  tax: 'bg-red-100 text-red-800',
  rent: 'bg-blue-100 text-blue-800',
  food: 'bg-amber-100 text-amber-800',
  transport: 'bg-emerald-100 text-emerald-800',
  custom: 'bg-purple-100 text-purple-800',
  fitness: 'bg-pink-100 text-pink-800',
  utilities: 'bg-cyan-100 text-cyan-800',
  entertainment: 'bg-indigo-100 text-indigo-800',
  savings: 'bg-emerald-100 text-emerald-800',
  giving: 'bg-yellow-100 text-yellow-800',
  fees: 'bg-gray-100 text-gray-800',
}

function getCategoryBadge(category: string) {
  const colors = categoryColors[category] || 'bg-stone-100 text-stone-800'
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors}`}>
      {category}
    </span>
  )
}

function getSourceBadge(source: string) {
  if (source === 'auto') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
        Auto
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-200 text-stone-700">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
      </svg>
      Manual
    </span>
  )
}

// Custom tooltip for charts
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string | number }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-medium text-stone-500 mb-1.5">{label !== undefined ? `Year ${label}` : ''}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {formatKES(entry.value)}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-sm font-semibold text-stone-800">{item.name}</p>
      <p className="text-sm font-bold" style={{ color: item.payload.color }}>
        {formatKES(item.value)}
      </p>
    </div>
  )
}

// =====================
// SECTION COMPONENTS
// =====================

function UserInputSection({ onNavigate }: { onNavigate: (tab: TabKey) => void }) {
  const [formData, setFormData] = useState({
    name: userData.name,
    company: userData.company,
    companyLocation: userData.companyLocation.split(',')[0].trim(),
    residentialArea: userData.residentialArea.split(',')[0].trim(),
    yearsOfExperience: userData.yearsOfExperience,
    monthlySalary: userData.monthlySalary,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50 to-stone-100">
      {/* Decorative top border */}
      <div className="h-1.5 bg-gradient-to-r from-amber-600 via-orange-700 to-amber-600" />

      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            Nairobi, Kenya
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
            Calculate Your<br />
            <span className="text-amber-700">Take-Home Salary</span>
          </h1>
          <p className="text-stone-500 text-lg max-w-md mx-auto">
            Made for Nairobi job seekers. Know your real earnings after taxes, rent, food, and transport.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200/60 p-6 sm:p-8">
          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="e.g. Amani Wanjiku"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="e.g. Safaricom PLC"
              />
            </div>

            {/* Company Location & Residential Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Company Location</label>
                <div className="relative">
                  <select
                    value={formData.companyLocation}
                    onChange={(e) => setFormData({ ...formData, companyLocation: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all appearance-none"
                  >
                    <option value="">Select area</option>
                    {nairobiAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Where You Live</label>
                <div className="relative">
                  <select
                    value={formData.residentialArea}
                    onChange={(e) => setFormData({ ...formData, residentialArea: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all appearance-none"
                  >
                    <option value="">Select area</option>
                    {nairobiAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Years of Experience & Salary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Years of Experience</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={formData.yearsOfExperience}
                  onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="e.g. 3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Monthly Gross Salary (KES)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-sm">KES</span>
                  <input
                    type="number"
                    min={0}
                    value={formData.monthlySalary}
                    onChange={(e) => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
                    className="w-full pl-14 pr-4 py-3 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    placeholder="120,000"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full mt-3 py-4 px-6 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/25 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] text-lg"
            >
              Calculate My Take-Home
              <span className="ml-2">&#8594;</span>
            </button>
          </div>
        </div>

        {/* Supported Areas */}
        <div className="mt-10 text-center">
          <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-4">Supported Nairobi Areas</p>
          <div className="flex flex-wrap justify-center gap-2">
            {nairobiAreas.slice(0, 20).map((area) => (
              <span
                key={area}
                className="inline-block px-3 py-1 bg-white/80 border border-stone-200 rounded-full text-xs font-medium text-stone-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800 transition-colors cursor-default"
              >
                {area}
              </span>
            ))}
            <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700">
              +{nairobiAreas.length - 20} more
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardSection() {
  const summaryCards = [
    { label: 'Gross Salary', value: dashboardSummary.grossSalary, color: 'text-stone-900', bg: 'bg-white', border: 'border-stone-200', icon: 'M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
    { label: 'Total Deductions', value: dashboardSummary.totalDeductions, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z' },
    { label: 'Total Expenses', value: dashboardSummary.totalExpenses, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z' },
    { label: 'Take-Home', value: dashboardSummary.takeHome, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z' },
  ]

  const allExpenses = [
    { name: 'PAYE Tax', amount: taxBreakdown.paye, category: 'tax', source: 'auto' },
    { name: 'NSSF', amount: taxBreakdown.nssf, category: 'tax', source: 'auto' },
    { name: 'SHIF (Health)', amount: taxBreakdown.shif, category: 'tax', source: 'auto' },
    { name: 'Housing Levy', amount: taxBreakdown.housingLevy, category: 'tax', source: 'auto' },
    { name: expenseBreakdown.rent.label, amount: expenseBreakdown.rent.amount, category: expenseBreakdown.rent.category, source: expenseBreakdown.rent.source },
    { name: expenseBreakdown.food.label, amount: expenseBreakdown.food.amount, category: expenseBreakdown.food.category, source: expenseBreakdown.food.source },
    { name: expenseBreakdown.transport.label, amount: expenseBreakdown.transport.amount, category: expenseBreakdown.transport.category, source: expenseBreakdown.transport.source },
    ...expenseBreakdown.custom.map((c) => ({ name: c.name, amount: c.amount, category: c.category, source: c.source })),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            Expenses Dashboard
          </h2>
          <p className="text-stone-500 mt-1">
            {userData.company} &middot; {userData.companyLocation} &rarr; {userData.residentialArea}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`${card.bg} ${card.border} border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{formatKES(card.value)}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.bg === 'bg-white' ? 'bg-stone-100' : card.bg} flex items-center justify-center`}>
                  <svg className={`w-5 h-5 ${card.color}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Donut Chart */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
              Expense Breakdown
            </h3>
            <p className="text-xs text-stone-400 mb-4">Monthly allocation of deductions & expenses</p>
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
                    strokeWidth={2}
                    stroke="#fafaf9"
                  >
                    {expenseChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
              {expenseChartData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-stone-600 truncate">{entry.name}</span>
                  <span className="text-stone-400 ml-auto font-medium">{formatKES(entry.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expense Table */}
          <div className="lg:col-span-3 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
              All Expenses
            </h3>
            <p className="text-xs text-stone-400 mb-4">Taxes, auto-detected costs, and your custom expenses</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Name</th>
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Category</th>
                    <th className="text-right py-2.5 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Monthly</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {allExpenses.map((expense, i) => (
                    <tr key={i} className="border-b border-stone-100 last:border-0 hover:bg-amber-50/40 transition-colors">
                      <td className="py-3 px-3 text-sm font-medium text-stone-800">{expense.name}</td>
                      <td className="py-3 px-3">{getCategoryBadge(expense.category)}</td>
                      <td className="py-3 px-3 text-sm font-semibold text-stone-900 text-right">{formatKES(expense.amount)}</td>
                      <td className="py-3 px-3 text-center">{getSourceBadge(expense.source)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Add & Custom */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>
                Quick Add Expenses
              </h3>
              <p className="text-xs text-stone-400">Add common expenses with one click</p>
            </div>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-semibold rounded-xl shadow-md shadow-amber-600/20 transition-all text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Custom Expense
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAddExpenses.map((expense) => (
              <button
                key={expense.name}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-sm font-medium text-stone-700 hover:text-amber-800 transition-all"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {expense.name}
                <span className="text-stone-400 text-xs">({formatKES(expense.defaultAmount)})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function GrowthSection() {
  const milestones = [
    { label: 'Year 3', data: growthProjections.year3, bg: 'bg-amber-50', border: 'border-amber-200', accent: 'text-amber-700' },
    { label: 'Year 5', data: growthProjections.year5, bg: 'bg-orange-50', border: 'border-orange-200', accent: 'text-orange-700' },
    { label: 'Year 7', data: growthProjections.year7, bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'text-emerald-700' },
    { label: 'Year 10', data: growthProjections.year10, bg: 'bg-blue-50', border: 'border-blue-200', accent: 'text-blue-700' },
  ]

  const assumptions = [
    { label: 'Salary Growth', value: growthAssumptions.salaryGrowthRate, color: 'bg-emerald-500' },
    { label: 'Rent Inflation', value: growthAssumptions.rentInflation, color: 'bg-blue-500' },
    { label: 'Food Inflation', value: growthAssumptions.foodInflation, color: 'bg-amber-500' },
    { label: 'Transport Inflation', value: growthAssumptions.transportInflation, color: 'bg-green-500' },
    { label: 'General CPI', value: growthAssumptions.generalCPI, color: 'bg-orange-500' },
  ]

  const comparisonRows = [
    { label: 'Monthly Salary', key: 'salary' as const },
    { label: 'Take-Home', key: 'takeHome' as const },
    { label: 'Total Expenses', key: 'totalExpenses' as const },
    { label: 'Total Taxes', key: 'totalTax' as const },
  ]

  const allProjections = [
    { label: 'Current', data: growthProjections.current },
    { label: 'Year 3', data: growthProjections.year3 },
    { label: 'Year 5', data: growthProjections.year5 },
    { label: 'Year 7', data: growthProjections.year7 },
    { label: 'Year 10', data: growthProjections.year10 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            Growth Projections
          </h2>
          <p className="text-stone-500 mt-1">
            Your estimated take-home salary over 10 years, adjusted for inflation and career growth
          </p>
        </div>

        {/* Milestone Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {milestones.map((m) => {
            const increase = ((m.data.takeHome - growthProjections.current.takeHome) / growthProjections.current.takeHome * 100).toFixed(1)
            return (
              <div key={m.label} className={`${m.bg} ${m.border} border rounded-2xl p-5 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-bold ${m.accent}`}>{m.label}</span>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                    +{increase}%
                  </span>
                </div>
                <p className="text-2xl font-bold text-stone-900">{formatKES(m.data.takeHome)}</p>
                <p className="text-xs text-stone-500 mt-1">monthly take-home</p>
                <div className="mt-3 pt-3 border-t border-stone-200/50 flex justify-between text-xs text-stone-500">
                  <span>Salary: {formatKES(m.data.salary)}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Line Chart */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm mb-8">
          <h3 className="text-lg font-bold text-stone-900 mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
            10-Year Trajectory
          </h3>
          <p className="text-xs text-stone-400 mb-6">Salary, take-home, expenses, and taxes over time</p>
          <ResponsiveContainer width="100%" height={360}>
            <LineChart data={growthChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis
                dataKey="year"
                tickFormatter={(v) => `Yr ${v}`}
                tick={{ fill: '#78716c', fontSize: 12 }}
                axisLine={{ stroke: '#d6d3d1' }}
              />
              <YAxis
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                tick={{ fill: '#78716c', fontSize: 12 }}
                axisLine={{ stroke: '#d6d3d1' }}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '13px', fontWeight: 500, paddingTop: '12px' }}
              />
              <Line type="monotone" dataKey="salary" name="Salary" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="takeHome" name="Take-Home" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={{ r: 2.5 }} strokeDasharray="5 3" />
              <Line type="monotone" dataKey="taxes" name="Taxes" stroke="#f97316" strokeWidth={2} dot={{ r: 2.5 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Assumptions & Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assumptions */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
              Assumptions
            </h3>
            <p className="text-xs text-stone-400 mb-5">Annual growth rates used in projections</p>
            <div className="space-y-5">
              {assumptions.map((a) => (
                <div key={a.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-stone-700">{a.label}</span>
                    <span className="text-sm font-bold text-stone-900">{a.value}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div
                      className={`${a.color} h-2 rounded-full transition-all`}
                      style={{ width: `${(a.value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Table */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
              Detailed Comparison
            </h3>
            <p className="text-xs text-stone-400 mb-5">Side-by-side financial projections</p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Metric</th>
                    {allProjections.map((p) => (
                      <th key={p.label} className="text-right py-2.5 px-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        {p.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.key} className="border-b border-stone-100 last:border-0">
                      <td className="py-3 px-3 text-sm font-medium text-stone-700">{row.label}</td>
                      {allProjections.map((p) => (
                        <td key={p.label} className="py-3 px-3 text-sm font-semibold text-stone-900 text-right">
                          {formatKES(p.data[row.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComparisonSection() {
  const verdictColor = salaryComparison.verdict === 'slightly_below'
    ? { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-800' }
    : { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>
            Salary Comparison
          </h2>
          <p className="text-stone-500 mt-1">
            See how your salary stacks up against the market
          </p>
        </div>

        {/* Verdict Card */}
        <div className={`${verdictColor.bg} ${verdictColor.border} border rounded-2xl p-6 sm:p-8 mb-8 shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl ${verdictColor.badge} flex items-center justify-center`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-xl sm:text-2xl font-bold ${verdictColor.text}`} style={{ fontFamily: '"Playfair Display", serif' }}>
                    {salaryComparison.verdictText}
                  </h3>
                  <p className="text-sm text-stone-500 mt-0.5">
                    Based on {salaryComparison.sampleSize} responses for {salaryComparison.role} in {salaryComparison.location}
                  </p>
                </div>
              </div>
            </div>
            <div className={`${verdictColor.badge} px-4 py-2 rounded-xl text-sm font-bold`}>
              {salaryComparison.percentile}th Percentile
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-200/50">
            <div className="text-center p-4 bg-white/60 rounded-xl">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Your Salary</p>
              <p className="text-2xl font-bold text-stone-900">{formatKES(salaryComparison.userSalary)}</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Market Median</p>
              <p className="text-2xl font-bold text-amber-700">{formatKES(salaryComparison.marketMedian)}</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Market Mean</p>
              <p className="text-2xl font-bold text-stone-700">{formatKES(salaryComparison.marketMean)}</p>
            </div>
          </div>
        </div>

        {/* Chart & Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bell Curve Chart */}
          <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900 mb-1" style={{ fontFamily: '"Playfair Display", serif' }}>
              Salary Distribution
            </h3>
            <p className="text-xs text-stone-400 mb-6">
              {salaryComparison.role} in {salaryComparison.location} &middot; {salaryComparison.experienceBand}
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={salaryDistributionData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="safariGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                <XAxis
                  dataKey="salary"
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                  tick={{ fill: '#78716c', fontSize: 12 }}
                  axisLine={{ stroke: '#d6d3d1' }}
                />
                <YAxis
                  tick={{ fill: '#78716c', fontSize: 12 }}
                  axisLine={{ stroke: '#d6d3d1' }}
                  label={{ value: 'Responses', angle: -90, position: 'insideLeft', style: { fill: '#a8a29e', fontSize: 12 } }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [value, name === 'frequency' ? 'Responses' : name]}
                  labelFormatter={(label) => `Salary: ${formatKES(Number(label))}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="frequency"
                  stroke="#d97706"
                  strokeWidth={2.5}
                  fill="url(#safariGradient)"
                />
                {/* User marker line (done via ReferenceLine-like styling using a second small dataset area) */}
              </AreaChart>
            </ResponsiveContainer>
            {/* Manual marker legend */}
            <div className="flex items-center gap-6 mt-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-600" />
                <span className="text-stone-600">Distribution Curve</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-red-500" />
                <span className="text-stone-600">Your Salary ({formatKES(salaryComparison.userSalary)})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-emerald-500" />
                <span className="text-stone-600">Median ({formatKES(salaryComparison.marketMedian)})</span>
              </div>
            </div>
          </div>

          {/* Role & Info Panel */}
          <div className="space-y-6">
            {/* Role Info */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                Role Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4.5 h-4.5 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Role</p>
                    <p className="text-sm font-semibold text-stone-900">{salaryComparison.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4.5 h-4.5 text-emerald-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Location</p>
                    <p className="text-sm font-semibold text-stone-900">{salaryComparison.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4.5 h-4.5 text-blue-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">Experience Band</p>
                    <p className="text-sm font-semibold text-stone-900">{salaryComparison.experienceBand}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Quality */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                Data Quality
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Sample Size</span>
                  <span className="text-sm font-bold text-stone-900">{salaryComparison.sampleSize} responses</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Confidence</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    salaryComparison.confidence === 'high'
                      ? 'bg-emerald-100 text-emerald-800'
                      : salaryComparison.confidence === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {salaryComparison.confidence.charAt(0).toUpperCase() + salaryComparison.confidence.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">Last Updated</span>
                  <span className="text-sm font-medium text-stone-700">{salaryComparison.lastUpdated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">25th Percentile</span>
                  <span className="text-sm font-semibold text-stone-900">{formatKES(salaryComparison.p25)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600">75th Percentile</span>
                  <span className="text-sm font-semibold text-stone-900">{formatKES(salaryComparison.p75)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =====================
// MAIN COMPONENT
// =====================

export default function Design1Safari() {
  const [activeTab, setActiveTab] = useState<TabKey>('input')

  return (
    <div className="min-h-screen bg-stone-100" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
      {/* Fixed Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Back */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                <span className="hidden sm:inline">Designs</span>
              </Link>
              <div className="h-6 w-px bg-stone-200" />
              <div className="flex items-center gap-2">
                <span className="text-xl" role="img" aria-label="Kenya flag">&#x1F1F0;&#x1F1EA;</span>
                <h1 className="text-xl font-bold text-stone-900" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Kazi<span className="text-amber-600">Budget</span>
                </h1>
              </div>
            </div>

            {/* Center: Tab Navigation */}
            <div className="hidden md:flex items-center bg-stone-100 rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-white text-amber-700 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right: User Greeting */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500 hidden sm:block">
                Hello, <span className="font-semibold text-stone-800">{userData.name}</span>
              </span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {userData.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden border-t border-stone-200 bg-white/90 backdrop-blur-md">
          <div className="flex overflow-x-auto px-2 py-1.5 gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-stone-500'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Section Content */}
      {activeTab === 'input' && <UserInputSection onNavigate={setActiveTab} />}
      {activeTab === 'dashboard' && <DashboardSection />}
      {activeTab === 'growth' && <GrowthSection />}
      {activeTab === 'comparison' && <ComparisonSection />}

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-lg" role="img" aria-label="Kenya flag">&#x1F1F0;&#x1F1EA;</span>
              <span className="text-lg font-bold text-stone-200" style={{ fontFamily: '"Playfair Display", serif' }}>
                Kazi<span className="text-amber-500">Budget</span>
              </span>
            </div>
            <p className="text-xs text-stone-500 text-center">
              Built for Kenyan job seekers. All data is estimated and for informational purposes only.
            </p>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-stone-600">Design 1: Safari</span>
              <span className="w-1 h-1 rounded-full bg-stone-600" />
              <span className="text-amber-500 font-medium">Warm &amp; Earthy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
