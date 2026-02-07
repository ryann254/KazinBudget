import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area, ResponsiveContainer
} from 'recharts'
import {
  userData, nairobiAreas, taxBreakdown, expenseBreakdown,
  dashboardSummary, expenseChartData, growthProjections,
  growthChartData, salaryComparison, salaryDistributionData,
  travelDetails, rentDetails, foodDetails, formatKES,
  quickAddExpenses, growthAssumptions
} from '../../data/dummy'

const tabs = [
  { id: 'form', label: 'Form', emoji: '📝' },
  { id: 'dashboard', label: 'Dashboard', emoji: '📊' },
  { id: 'growth', label: 'Growth', emoji: '📈' },
  { id: 'compare', label: 'Compare', emoji: '🏆' },
]

const categoryEmojis: Record<string, string> = {
  tax: '🏛️',
  rent: '🏠',
  food: '🍕',
  transport: '🚌',
  fitness: '💪',
  utilities: '⚡',
  entertainment: '🎬',
  savings: '🏦',
  giving: '⛪',
  fees: '📱',
  custom: '✨',
}

const quickAddEmojis: Record<string, string> = {
  fitness: '💪',
  utilities: '⚡',
  food: '🍕',
  entertainment: '🎬',
  savings: '🏦',
  giving: '⛪',
  fees: '💸',
}

const stickerColors = [
  'bg-fuchsia-500', 'bg-yellow-400', 'bg-green-500', 'bg-cyan-400',
  'bg-orange-500', 'bg-pink-500', 'bg-violet-500', 'bg-lime-500',
  'bg-amber-400', 'bg-emerald-500', 'bg-rose-500', 'bg-sky-500',
  'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
]

const BRIGHT_COLORS = [
  '#d946ef', '#facc15', '#22c55e', '#06b6d4', '#f97316',
  '#ec4899', '#8b5cf6', '#84cc16', '#f59e0b', '#10b981',
  '#ef4444', '#0ea5e9', '#14b8a6', '#6366f1', '#e11d48',
]

export default function Design5MatatuCulture() {
  const [activeTab, setActiveTab] = useState('form')

  const allExpenses = [
    { name: 'PAYE', amount: taxBreakdown.paye, category: 'tax' },
    { name: 'NSSF', amount: taxBreakdown.nssf, category: 'tax' },
    { name: 'SHIF', amount: taxBreakdown.shif, category: 'tax' },
    { name: 'Housing Levy', amount: taxBreakdown.housingLevy, category: 'tax' },
    { name: expenseBreakdown.rent.label, amount: expenseBreakdown.rent.amount, category: 'rent' },
    { name: expenseBreakdown.food.label, amount: expenseBreakdown.food.amount, category: 'food' },
    { name: expenseBreakdown.transport.label, amount: expenseBreakdown.transport.amount, category: 'transport' },
    ...expenseBreakdown.custom.map(c => ({ name: c.name, amount: c.amount, category: c.category })),
  ]

  const projectionCards = [
    {
      key: 'year3',
      data: growthProjections.year3,
      label: '3 Years From Now 📈',
      tagline: 'Leveling up!',
      bg: 'from-fuchsia-500 to-pink-500',
      border: 'border-fuchsia-400',
    },
    {
      key: 'year5',
      data: growthProjections.year5,
      label: 'Living Large at Year 5 ✨',
      tagline: 'Big moves only!',
      bg: 'from-yellow-400 to-orange-500',
      border: 'border-yellow-400',
    },
    {
      key: 'year7',
      data: growthProjections.year7,
      label: 'Year 7 Glow Up 💎',
      tagline: "Can't stop, won't stop!",
      bg: 'from-green-500 to-emerald-600',
      border: 'border-green-400',
    },
    {
      key: 'year10',
      data: growthProjections.year10,
      label: 'DECADE BOSS at Year 10 👑',
      tagline: 'You made it fam!',
      bg: 'from-cyan-400 to-blue-600',
      border: 'border-cyan-400',
    },
  ]

  const verdictConfig = salaryComparison.percentile < 40
    ? {
        emoji: '😤',
        headline: "You're getting ROBBED!",
        subline: 'Time to negotiate that bag!',
        color: 'text-red-500',
        bg: 'from-red-500 to-orange-500',
        badge: 'bg-red-100 text-red-700',
      }
    : salaryComparison.percentile < 60
      ? {
          emoji: '🤔',
          headline: "You're doing OKAY...",
          subline: 'But you could do better fam.',
          color: 'text-yellow-500',
          bg: 'from-yellow-400 to-orange-500',
          badge: 'bg-yellow-100 text-yellow-700',
        }
      : {
          emoji: '🔥',
          headline: "You're KILLING IT!",
          subline: 'Secure the bag! Keep going!',
          color: 'text-green-500',
          bg: 'from-green-500 to-emerald-500',
          badge: 'bg-green-100 text-green-700',
        }

  // Custom pie label
  const renderPieLabel = ({ name, percent }: { name: string; percent: number }) => {
    if (percent < 0.04) return null
    return `${name} ${(percent * 100).toFixed(0)}%`
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ====== TOP NAVIGATION ====== */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-fuchsia-600 via-yellow-500 to-green-500 shadow-2xl shadow-fuchsia-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-white/90 hover:text-white text-sm font-bold bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all"
            >
              👈 Back
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
              🚐 PESA YAKO
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-white/90 font-bold text-sm bg-white/20 px-3 py-1.5 rounded-full">
              Hey {userData.name.split(' ')[0]}! 👋
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-lg shadow-white/30 scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'
                }`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ====== MAIN CONTENT ====== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ========================================
            SECTION 1: USER INPUT FORM
        ======================================== */}
        {activeTab === 'form' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero heading */}
            <div className="text-center space-y-3">
              <h2
                className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-fuchsia-500 via-yellow-400 to-green-500 bg-clip-text text-transparent leading-tight"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                How Much Do You REALLY Make? 💰
              </h2>
              <p className="text-xl sm:text-2xl text-gray-400 font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                No cap. Just facts. 🇰🇪
              </p>
            </div>

            {/* Form card */}
            <div className="relative max-w-2xl mx-auto">
              {/* Gradient border glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-green-500 rounded-3xl blur-sm opacity-75" />
              <div className="relative bg-gray-900 rounded-3xl p-6 sm:p-8 space-y-6">
                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-fuchsia-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      👤 Your Name
                    </label>
                    <input
                      type="text"
                      defaultValue={userData.name}
                      className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-4 py-3 text-white font-medium focus:outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/50 transition-all placeholder-gray-500"
                      placeholder="e.g. Amani Wanjiku"
                    />
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-yellow-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      🏢 Company
                    </label>
                    <input
                      type="text"
                      defaultValue={userData.company}
                      className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-4 py-3 text-white font-medium focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 transition-all placeholder-gray-500"
                      placeholder="e.g. Safaricom PLC"
                    />
                  </div>

                  {/* Company Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-green-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      📍 Company Location
                    </label>
                    <input
                      type="text"
                      defaultValue={userData.companyLocation}
                      className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-4 py-3 text-white font-medium focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 transition-all placeholder-gray-500"
                      placeholder="e.g. Westlands, Nairobi"
                    />
                  </div>

                  {/* Home */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-cyan-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      🏠 Where You Live
                    </label>
                    <input
                      type="text"
                      defaultValue={userData.residentialArea}
                      className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-4 py-3 text-white font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all placeholder-gray-500"
                      placeholder="e.g. Juja, Kiambu"
                    />
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-orange-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      ⭐ Years of Experience
                    </label>
                    <input
                      type="number"
                      defaultValue={userData.yearsOfExperience}
                      className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-4 py-3 text-white font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/50 transition-all placeholder-gray-500"
                      placeholder="e.g. 3"
                    />
                  </div>

                  {/* Salary */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-pink-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      💵 Monthly Salary (KES)
                    </label>
                    <input
                      type="number"
                      defaultValue={userData.monthlySalary}
                      className="w-full bg-gray-800 border-2 border-gray-700 rounded-2xl px-4 py-3 text-white font-medium focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition-all placeholder-gray-500"
                      placeholder="e.g. 120000"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button className="w-full bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white font-black text-lg py-4 rounded-2xl hover:from-fuchsia-600 hover:to-orange-600 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-fuchsia-500/30 active:scale-95" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Show Me The Money! 🚀
                </button>

                {/* Nairobi areas as sticker chips */}
                <div>
                  <p className="text-sm font-bold text-gray-400 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    🔥 Popular Nairobi Areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {nairobiAreas.slice(0, 20).map((area, i) => (
                      <span
                        key={area}
                        className={`${stickerColors[i % stickerColors.length]} text-white text-xs font-bold px-3 py-1.5 rounded-full hover:scale-110 hover:rotate-3 transition-all cursor-pointer shadow-lg`}
                        style={{ transform: `rotate(${(i % 5) * 2 - 4}deg)` }}
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Travel & Rent & Food Info cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {/* Travel card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-cyan-400 rounded-3xl blur opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gray-900 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚌</span>
                    <h3 className="font-black text-green-400" style={{ fontFamily: 'Outfit, sans-serif' }}>Transport</h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    {travelDetails.origin} → {travelDetails.destination}
                  </p>
                  <p className="text-xs text-gray-500">{travelDetails.distance} · {travelDetails.duration}</p>
                  <div className="space-y-2">
                    {travelDetails.modes.map(m => (
                      <div key={m.mode} className="flex items-center justify-between bg-gray-800 rounded-xl px-3 py-2">
                        <span className="text-xs font-bold text-gray-300">{m.mode}</span>
                        <span className="text-xs font-black text-green-400">{formatKES(m.monthly)}/mo</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rent card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-3xl blur opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gray-900 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏠</span>
                    <h3 className="font-black text-fuchsia-400" style={{ fontFamily: 'Outfit, sans-serif' }}>Rent in {rentDetails.area}</h3>
                  </div>
                  <p className="text-xs text-gray-400">Zone: {rentDetails.zone}</p>
                  <div className="space-y-2">
                    {rentDetails.options.map(o => (
                      <div key={o.type} className="flex items-center justify-between bg-gray-800 rounded-xl px-3 py-2">
                        <span className="text-xs font-bold text-gray-300">{o.type}</span>
                        <div className="text-right">
                          <span className="text-xs font-black text-fuchsia-400">{formatKES(o.median)}</span>
                          <p className="text-[10px] text-gray-500">KES {o.range}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Food card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl blur opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gray-900 rounded-3xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🍕</span>
                    <h3 className="font-black text-yellow-400" style={{ fontFamily: 'Outfit, sans-serif' }}>Food in {foodDetails.area}</h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    Avg lunch: {formatKES(foodDetails.avgLunchCost)} · {foodDetails.workingDays} days
                  </p>
                  <p className="text-sm font-black text-yellow-400">{formatKES(foodDetails.monthlyCost)}/mo</p>
                  <div className="space-y-2">
                    {foodDetails.nearbyRestaurants.map(r => (
                      <div key={r.name} className="flex items-center justify-between bg-gray-800 rounded-xl px-3 py-2">
                        <span className="text-xs font-bold text-gray-300">{r.name}</span>
                        <span className="text-xs font-black text-yellow-400">{formatKES(r.avgMeal)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            SECTION 2: EXPENSES DASHBOARD
        ======================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Section heading */}
            <div className="text-center">
              <h2
                className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-fuchsia-500 via-yellow-400 to-green-500 bg-clip-text text-transparent"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Your Money Dashboard 📊
              </h2>
              <p className="text-gray-400 mt-2 font-bold">Where your pesa goes every month 💸</p>
            </div>

            {/* 4 summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Gross Salary */}
              <div className="bg-gradient-to-br from-green-500 to-cyan-500 rounded-3xl p-5 shadow-2xl shadow-green-500/20 hover:scale-105 transition-transform">
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider">💰 Gross Salary</p>
                <p className="text-white text-2xl sm:text-3xl font-black mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatKES(dashboardSummary.grossSalary)}
                </p>
              </div>

              {/* Deductions */}
              <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl p-5 shadow-2xl shadow-red-500/20 hover:scale-105 transition-transform">
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider">🏛️ Deductions</p>
                <p className="text-white text-2xl sm:text-3xl font-black mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatKES(dashboardSummary.totalDeductions)}
                </p>
              </div>

              {/* Expenses */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-5 shadow-2xl shadow-yellow-400/20 hover:scale-105 transition-transform">
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider">📋 Expenses</p>
                <p className="text-white text-2xl sm:text-3xl font-black mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatKES(dashboardSummary.totalExpenses)}
                </p>
              </div>

              {/* Take-Home */}
              <div className="bg-gradient-to-br from-fuchsia-500 to-violet-600 rounded-3xl p-5 shadow-2xl shadow-fuchsia-500/20 hover:scale-105 transition-transform">
                <p className="text-white/80 text-xs font-bold uppercase tracking-wider">🏆 Take-Home</p>
                <p className="text-white text-2xl sm:text-3xl font-black mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatKES(dashboardSummary.takeHome)}
                </p>
              </div>
            </div>

            {/* Pie chart + Expense list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-400 rounded-3xl blur opacity-50" />
                <div className="relative bg-gray-900 rounded-3xl p-6">
                  <h3 className="font-black text-xl text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Where Your Cash Goes 🥧
                  </h3>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                        label={renderPieLabel}
                        stroke="none"
                        style={{ fontSize: '11px', fontWeight: 700, fill: '#fff' }}
                      >
                        {expenseChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={BRIGHT_COLORS[index % BRIGHT_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatKES(value)}
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '2px solid #d946ef',
                          borderRadius: '16px',
                          color: '#fff',
                          fontWeight: 700,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Expense list */}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl blur opacity-50" />
                <div className="relative bg-gray-900 rounded-3xl p-6 max-h-[480px] overflow-y-auto">
                  <h3 className="font-black text-xl text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    All Expenses Breakdown 📋
                  </h3>
                  <div className="space-y-2">
                    {allExpenses.map((exp, i) => (
                      <div
                        key={`${exp.name}-${i}`}
                        className="flex items-center justify-between bg-gray-800 hover:bg-gray-750 rounded-2xl px-4 py-3 hover:scale-[1.02] transition-all group cursor-pointer"
                        style={{ borderLeft: `4px solid ${BRIGHT_COLORS[i % BRIGHT_COLORS.length]}` }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{categoryEmojis[exp.category] || '✨'}</span>
                          <span className="text-sm font-bold text-gray-200">{exp.name}</span>
                        </div>
                        <span className="text-sm font-black text-white">{formatKES(exp.amount)}</span>
                      </div>
                    ))}

                    {/* Total row */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20 border-2 border-fuchsia-500/40 rounded-2xl px-4 py-3 mt-3">
                      <span className="text-sm font-black text-fuchsia-400">💸 TOTAL OUT</span>
                      <span className="text-sm font-black text-fuchsia-400">
                        {formatKES(dashboardSummary.totalDeductions + dashboardSummary.totalExpenses)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick-add sticker buttons */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-cyan-400 rounded-3xl blur opacity-40" />
              <div className="relative bg-gray-900 rounded-3xl p-6">
                <h3 className="font-black text-xl text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Quick Add Expenses ⚡
                </h3>
                <div className="flex flex-wrap gap-3">
                  {quickAddExpenses.map((expense, i) => (
                    <button
                      key={expense.name}
                      className={`${stickerColors[i % stickerColors.length]} text-white font-bold text-sm px-4 py-2.5 rounded-2xl hover:scale-110 hover:rotate-2 transition-all shadow-lg active:scale-95`}
                      style={{
                        transform: `rotate(${(i % 3) * 2 - 2}deg)`,
                        fontFamily: 'Outfit, sans-serif',
                      }}
                    >
                      {quickAddEmojis[expense.category] || '✨'} {expense.name} · {formatKES(expense.defaultAmount)}
                    </button>
                  ))}
                </div>

                {/* Floating rainbow + button */}
                <button className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-fuchsia-500 via-yellow-400 to-green-500 rounded-full shadow-2xl shadow-fuchsia-500/40 flex items-center justify-center text-3xl font-black text-white hover:scale-125 hover:rotate-180 transition-all duration-500 z-40">
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            SECTION 3: GROWTH PROJECTIONS
        ======================================== */}
        {activeTab === 'growth' && (
          <div className="space-y-8">
            {/* Heading */}
            <div className="text-center">
              <h2
                className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-fuchsia-500 via-yellow-400 to-green-500 bg-clip-text text-transparent"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Your Future Bag 🚀
              </h2>
              <p className="text-gray-400 mt-2 font-bold">See how your money grows with time 📈</p>
            </div>

            {/* Current status */}
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 via-yellow-400 to-green-500 rounded-3xl blur opacity-70" />
              <div className="relative bg-gray-900 rounded-3xl p-6 text-center">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">📍 Right Now</p>
                <p className="text-4xl font-black text-white mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatKES(growthProjections.current.takeHome)}
                </p>
                <p className="text-sm text-gray-400 mt-1">take-home per month</p>
              </div>
            </div>

            {/* Milestone "ticket" cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {projectionCards.map(card => (
                <div key={card.key} className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${card.bg} rounded-3xl blur opacity-50 group-hover:opacity-80 transition-opacity`} />
                  <div className={`relative bg-gray-900 rounded-3xl overflow-hidden border-2 border-dashed ${card.border}`}>
                    {/* Ticket header */}
                    <div className={`bg-gradient-to-r ${card.bg} px-5 py-3`}>
                      <p className="font-black text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {card.label}
                      </p>
                      <p className="text-white/80 text-xs font-bold">{card.tagline}</p>
                    </div>
                    {/* Perforated edge */}
                    <div className="flex justify-between px-2 -my-2 relative z-10">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-gray-950 rounded-full" />
                      ))}
                    </div>
                    {/* Ticket body */}
                    <div className="px-5 py-5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400">💰 Salary</span>
                        <span className="text-sm font-black text-white">{formatKES(card.data.salary)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400">🏛️ Tax</span>
                        <span className="text-sm font-black text-red-400">{formatKES(card.data.totalTax)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400">📋 Expenses</span>
                        <span className="text-sm font-black text-orange-400">{formatKES(card.data.totalExpenses)}</span>
                      </div>
                      <div className="border-t border-dashed border-gray-700 pt-3 flex justify-between items-center">
                        <span className="text-xs font-black text-fuchsia-400">🏆 TAKE-HOME</span>
                        <span className="text-lg font-black bg-gradient-to-r from-fuchsia-400 to-yellow-400 bg-clip-text text-transparent" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {formatKES(card.data.takeHome)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Growth line chart */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-yellow-400 rounded-3xl blur opacity-40" />
              <div className="relative bg-gray-900 rounded-3xl p-6">
                <h3 className="font-black text-xl text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  10-Year Projection Chart 📊
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={growthChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="year" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontWeight: 700 }} label={{ value: 'Year', position: 'insideBottom', offset: -5, fill: '#9ca3af' }} />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontWeight: 700 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => formatKES(value)}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '2px solid #d946ef',
                        borderRadius: '16px',
                        color: '#fff',
                        fontWeight: 700,
                      }}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Legend wrapperStyle={{ fontWeight: 700, fontSize: '13px' }} />
                    <Line type="monotone" dataKey="salary" stroke="#d946ef" strokeWidth={4} dot={{ r: 5, fill: '#d946ef' }} name="💰 Salary" />
                    <Line type="monotone" dataKey="takeHome" stroke="#22c55e" strokeWidth={4} dot={{ r: 5, fill: '#22c55e' }} name="🏆 Take-Home" />
                    <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} name="📋 Expenses" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="taxes" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} name="🏛️ Taxes" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Assumptions toggle cards */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-green-500 rounded-3xl blur opacity-40" />
              <div className="relative bg-gray-900 rounded-3xl p-6">
                <h3 className="font-black text-xl text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Growth Assumptions 🎛️
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: '📈 Salary Growth', value: growthAssumptions.salaryGrowthRate, color: 'from-fuchsia-500 to-pink-500' },
                    { label: '🏠 Rent Inflation', value: growthAssumptions.rentInflation, color: 'from-yellow-400 to-orange-500' },
                    { label: '🍕 Food Inflation', value: growthAssumptions.foodInflation, color: 'from-green-500 to-emerald-600' },
                    { label: '🚌 Transport Inflation', value: growthAssumptions.transportInflation, color: 'from-cyan-400 to-blue-500' },
                  ].map(a => (
                    <div key={a.label} className={`bg-gradient-to-br ${a.color} rounded-2xl p-4 hover:scale-105 transition-transform`}>
                      <p className="text-white/80 text-xs font-bold">{a.label}</p>
                      <p className="text-white text-3xl font-black mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {a.value}%
                      </p>
                      <p className="text-white/60 text-xs font-bold mt-1">per year</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Growth table */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-fuchsia-500 rounded-3xl blur opacity-40" />
              <div className="relative bg-gray-900 rounded-3xl p-6 overflow-x-auto">
                <h3 className="font-black text-xl text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Year-by-Year Breakdown 📅
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-fuchsia-500 to-yellow-400 text-white">
                      <th className="px-4 py-3 rounded-tl-xl text-left font-black">Year</th>
                      <th className="px-4 py-3 text-right font-black">💰 Salary</th>
                      <th className="px-4 py-3 text-right font-black">🏛️ Taxes</th>
                      <th className="px-4 py-3 text-right font-black">📋 Expenses</th>
                      <th className="px-4 py-3 rounded-tr-xl text-right font-black">🏆 Take-Home</th>
                    </tr>
                  </thead>
                  <tbody>
                    {growthChartData.filter((_, i) => i % 2 === 0 || i === growthChartData.length - 1).map((row, i) => (
                      <tr
                        key={row.year}
                        className={`border-b border-gray-800 hover:bg-fuchsia-500/10 transition-colors ${i % 2 === 0 ? 'bg-gray-800/30' : ''}`}
                      >
                        <td className="px-4 py-3 font-black text-fuchsia-400">
                          {row.year === 0 ? 'Now' : `Year ${row.year}`}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-white">{formatKES(row.salary)}</td>
                        <td className="px-4 py-3 text-right font-bold text-red-400">{formatKES(row.taxes)}</td>
                        <td className="px-4 py-3 text-right font-bold text-orange-400">{formatKES(row.expenses)}</td>
                        <td className="px-4 py-3 text-right font-black text-green-400">{formatKES(row.takeHome)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            SECTION 4: SALARY COMPARISON
        ======================================== */}
        {activeTab === 'compare' && (
          <div className="space-y-8">
            {/* Big fun verdict */}
            <div className="text-center space-y-4">
              <div className="text-7xl sm:text-9xl">{verdictConfig.emoji}</div>
              <h2
                className={`text-4xl sm:text-6xl font-black bg-gradient-to-r ${verdictConfig.bg} bg-clip-text text-transparent`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {verdictConfig.headline}
              </h2>
              <p className="text-xl text-gray-400 font-bold">{verdictConfig.subline}</p>
              <div className={`inline-block ${verdictConfig.badge} font-black text-sm px-5 py-2 rounded-full`}>
                {salaryComparison.verdictText}
              </div>
            </div>

            {/* Stats in fun colored bubbles */}
            <div className="flex flex-wrap justify-center gap-5">
              {[
                { label: 'Your Salary', value: formatKES(salaryComparison.userSalary), emoji: '💵', bg: 'from-fuchsia-500 to-pink-500' },
                { label: 'Market Median', value: formatKES(salaryComparison.marketMedian), emoji: '📊', bg: 'from-yellow-400 to-orange-500' },
                { label: 'Market Mean', value: formatKES(salaryComparison.marketMean), emoji: '📈', bg: 'from-green-500 to-emerald-500' },
                { label: 'Percentile', value: `${salaryComparison.percentile}th`, emoji: '🎯', bg: 'from-cyan-400 to-blue-500' },
              ].map(stat => (
                <div
                  key={stat.label}
                  className={`bg-gradient-to-br ${stat.bg} rounded-full w-40 h-40 sm:w-48 sm:h-48 flex flex-col items-center justify-center shadow-2xl hover:scale-110 transition-transform`}
                >
                  <span className="text-2xl">{stat.emoji}</span>
                  <span className="text-white text-lg sm:text-xl font-black mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {stat.value}
                  </span>
                  <span className="text-white/70 text-xs font-bold mt-0.5">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Salary range bar */}
            <div className="relative max-w-3xl mx-auto">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-400 rounded-3xl blur opacity-50" />
              <div className="relative bg-gray-900 rounded-3xl p-6 space-y-4">
                <h3 className="font-black text-xl text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Where You Stand 📍
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-gray-400">
                    <span>{formatKES(salaryComparison.p25)}</span>
                    <span>Median: {formatKES(salaryComparison.marketMedian)}</span>
                    <span>{formatKES(salaryComparison.p75)}</span>
                  </div>
                  <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 to-cyan-400 rounded-full opacity-80" />
                    {/* User marker */}
                    <div
                      className="absolute top-0 h-full flex flex-col items-center"
                      style={{
                        left: `${((salaryComparison.userSalary - salaryComparison.p25) / (salaryComparison.p75 - salaryComparison.p25)) * 100}%`,
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className="bg-white text-gray-900 font-black text-xs px-2 py-0.5 rounded-full -mt-6 whitespace-nowrap shadow-lg">
                        👆 YOU ARE HERE
                      </div>
                      <div className="w-1 h-full bg-white" />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-red-400">25th %ile</span>
                    <span className="text-green-400">75th %ile</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bell curve / Distribution chart */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-fuchsia-500 rounded-3xl blur opacity-40" />
              <div className="relative bg-gray-900 rounded-3xl p-6">
                <h3 className="font-black text-xl text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Nairobi Salary Distribution 🔔
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={salaryDistributionData}>
                    <defs>
                      <linearGradient id="matatu-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#d946ef" stopOpacity={0.8} />
                        <stop offset="25%" stopColor="#facc15" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#22c55e" stopOpacity={0.8} />
                        <stop offset="75%" stopColor="#06b6d4" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="matatu-gradient-fill" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#d946ef" stopOpacity={0.3} />
                        <stop offset="25%" stopColor="#facc15" stopOpacity={0.3} />
                        <stop offset="50%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="75%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="salary"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontWeight: 700, fontSize: 11 }}
                      tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af', fontWeight: 700 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value} people`, 'Frequency']}
                      labelFormatter={(label: number) => formatKES(label)}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '2px solid #d946ef',
                        borderRadius: '16px',
                        color: '#fff',
                        fontWeight: 700,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="frequency"
                      stroke="url(#matatu-gradient)"
                      strokeWidth={3}
                      fill="url(#matatu-gradient-fill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparison details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-3xl blur opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative bg-gray-900 rounded-3xl p-5 text-center">
                  <span className="text-3xl">👔</span>
                  <p className="text-sm font-bold text-gray-400 mt-2">Role</p>
                  <p className="font-black text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {salaryComparison.role}
                  </p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl blur opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative bg-gray-900 rounded-3xl p-5 text-center">
                  <span className="text-3xl">📍</span>
                  <p className="text-sm font-bold text-gray-400 mt-2">Location</p>
                  <p className="font-black text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {salaryComparison.location}
                  </p>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl blur opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative bg-gray-900 rounded-3xl p-5 text-center">
                  <span className="text-3xl">⭐</span>
                  <p className="text-sm font-bold text-gray-400 mt-2">Experience</p>
                  <p className="font-black text-white text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {salaryComparison.experienceBand}
                  </p>
                </div>
              </div>
            </div>

            {/* Fun disclaimer */}
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-fuchsia-500/10 to-yellow-400/10 border border-fuchsia-500/30 rounded-2xl px-6 py-4">
                <p className="text-sm font-bold text-gray-400">
                  Based on {salaryComparison.sampleSize} real Nairobi salaries. No cap. 📊
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Confidence: {salaryComparison.confidence} · Last updated: {salaryComparison.lastUpdated}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm font-bold text-gray-500">
            🚐 PESA YAKO &copy; 2026 &mdash; Built with love in Nairobi 🇰🇪
          </p>
          <p className="text-xs text-gray-600 font-bold">
            Matatu Culture Edition ✨ Design 5
          </p>
        </div>
      </footer>
    </div>
  )
}
