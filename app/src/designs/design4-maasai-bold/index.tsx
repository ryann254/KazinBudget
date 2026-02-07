import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, AreaChart, Area, ResponsiveContainer
} from 'recharts'
import {
  userData, nairobiAreas, taxBreakdown, expenseBreakdown, dashboardSummary,
  expenseChartData, growthProjections, growthChartData, salaryComparison,
  salaryDistributionData, travelDetails, rentDetails, foodDetails,
  formatKES, quickAddExpenses, growthAssumptions
} from '../../data/dummy'

// ============================================================
// DESIGN 4 — MAASAI BOLD
// Vibrant, geometric, culturally proud. Inspired by Maasai shuka.
// ============================================================

type TabKey = 'input' | 'dashboard' | 'growth' | 'comparison'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'input', label: 'CALCULATE' },
  { key: 'dashboard', label: 'DASHBOARD' },
  { key: 'growth', label: 'GROWTH' },
  { key: 'comparison', label: 'COMPARE' },
]

// Maasai-inspired bold pie colors
const PIE_COLORS = [
  '#b91c1c', '#dc2626', '#ef4444', '#fca5a5',
  '#1e40af', '#f59e0b', '#16a34a', '#7c3aed',
  '#6d28d9', '#a855f7', '#d946ef', '#c084fc', '#8b5cf6',
]

// Decorative stripe bar component
function MaasaiStripe({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-3 w-full overflow-hidden ${className}`}>
      <div className="flex-1 bg-red-700" />
      <div className="flex-1 bg-blue-800" />
      <div className="flex-1 bg-orange-500" />
      <div className="flex-1 bg-red-600" />
      <div className="flex-1 bg-blue-700" />
      <div className="flex-1 bg-orange-400" />
      <div className="flex-1 bg-red-700" />
      <div className="flex-1 bg-blue-800" />
    </div>
  )
}

// Thin accent stripe
function ThinStripe({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-1 w-full overflow-hidden ${className}`}>
      <div className="flex-1 bg-red-600" />
      <div className="flex-1 bg-blue-700" />
      <div className="flex-1 bg-orange-500" />
    </div>
  )
}

// Category color block
function CategoryBlock({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    tax: 'bg-red-600',
    rent: 'bg-blue-600',
    food: 'bg-orange-500',
    transport: 'bg-emerald-600',
    custom: 'bg-purple-600',
    fitness: 'bg-purple-500',
    utilities: 'bg-blue-500',
    entertainment: 'bg-pink-500',
    savings: 'bg-emerald-500',
    giving: 'bg-amber-600',
    fees: 'bg-gray-600',
  }
  return (
    <span className={`inline-block w-4 h-4 rounded-sm border-2 border-black/20 ${colorMap[category] || 'bg-gray-400'}`} />
  )
}

// ============================================================
// SECTION 1 — USER INPUT FORM
// ============================================================
function InputFormSection() {
  return (
    <div className="space-y-8">
      {/* Hero heading */}
      <div className="text-center space-y-3">
        <h1 className="text-5xl md:text-7xl font-black text-red-700 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
          KNOW YOUR WORTH
        </h1>
        <p className="text-xl md:text-2xl font-bold text-blue-800 tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Salary calculator for Kenya's workforce
        </p>
        <MaasaiStripe className="mt-4" />
      </div>

      {/* Form card */}
      <div className="bg-white border-l-4 border-red-600 border-2 border-gray-200 p-6 md:p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-extrabold text-blue-800 uppercase tracking-wider mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Your Details
        </h2>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-gray-800 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Full Name
            </label>
            <input
              type="text"
              defaultValue={userData.name}
              className="w-full border-0 border-b-4 border-gray-300 bg-transparent px-1 py-2 text-lg font-bold text-gray-900 focus:border-blue-700 focus:outline-none transition-colors"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              readOnly
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-gray-800 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Company
            </label>
            <input
              type="text"
              defaultValue={userData.company}
              className="w-full border-0 border-b-4 border-gray-300 bg-transparent px-1 py-2 text-lg font-bold text-gray-900 focus:border-blue-700 focus:outline-none transition-colors"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              readOnly
            />
          </div>

          {/* Company Location */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-gray-800 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Company Location
            </label>
            <input
              type="text"
              defaultValue={userData.companyLocation}
              className="w-full border-0 border-b-4 border-gray-300 bg-transparent px-1 py-2 text-lg font-bold text-gray-900 focus:border-blue-700 focus:outline-none transition-colors"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              readOnly
            />
          </div>

          {/* Residential Area */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-gray-800 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Where You Live
            </label>
            <input
              type="text"
              defaultValue={userData.residentialArea}
              className="w-full border-0 border-b-4 border-gray-300 bg-transparent px-1 py-2 text-lg font-bold text-gray-900 focus:border-blue-700 focus:outline-none transition-colors"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              readOnly
            />
          </div>

          {/* Two-column: YoE + Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-800 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Years of Experience
              </label>
              <input
                type="number"
                defaultValue={userData.yearsOfExperience}
                className="w-full border-0 border-b-4 border-gray-300 bg-transparent px-1 py-2 text-lg font-bold text-gray-900 focus:border-blue-700 focus:outline-none transition-colors"
                style={{ fontFamily: 'Outfit, sans-serif' }}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-800 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Monthly Salary (KES)
              </label>
              <input
                type="text"
                defaultValue={formatKES(userData.monthlySalary)}
                className="w-full border-0 border-b-4 border-gray-300 bg-transparent px-1 py-2 text-lg font-bold text-red-700 focus:border-blue-700 focus:outline-none transition-colors"
                style={{ fontFamily: 'Outfit, sans-serif' }}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Nairobi Areas */}
        <div className="mt-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Supported Nairobi Areas
          </p>
          <div className="flex flex-wrap gap-2">
            {nairobiAreas.slice(0, 20).map((area) => (
              <span
                key={area}
                className="inline-block px-3 py-1 text-xs font-bold border-2 border-red-300 text-red-700 uppercase tracking-wider bg-red-50 hover:bg-red-100 transition-colors cursor-default"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {area}
              </span>
            ))}
            <span
              className="inline-block px-3 py-1 text-xs font-bold border-2 border-blue-300 text-blue-700 uppercase tracking-wider bg-blue-50"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              +{nairobiAreas.length - 20} MORE
            </span>
          </div>
        </div>

        {/* Submit button */}
        <button
          className="mt-8 w-full bg-red-700 hover:bg-red-800 text-white text-xl font-black uppercase tracking-widest py-4 border-4 border-red-900 transition-colors"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          CALCULATE &rarr;
        </button>
      </div>

      {/* Auto-detected details */}
      <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rent Card */}
        <div className="bg-white border-2 border-gray-200 border-t-4 border-t-blue-700 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            RENT - {rentDetails.area.toUpperCase()}
          </p>
          {rentDetails.options.map((opt) => (
            <div key={opt.type} className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>{opt.type}</span>
              <span className="text-sm font-black text-blue-800" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(opt.median)}</span>
            </div>
          ))}
        </div>

        {/* Transport Card */}
        <div className="bg-white border-2 border-gray-200 border-t-4 border-t-orange-500 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            TRANSPORT - {travelDetails.distance}
          </p>
          {travelDetails.modes.slice(0, 3).map((m) => (
            <div key={m.mode} className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>{m.mode}</span>
              <span className="text-sm font-black text-orange-700" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(m.monthly)}/mo</span>
            </div>
          ))}
        </div>

        {/* Food Card */}
        <div className="bg-white border-2 border-gray-200 border-t-4 border-t-emerald-600 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            FOOD - {foodDetails.area.toUpperCase()}
          </p>
          {foodDetails.nearbyRestaurants.slice(0, 3).map((r) => (
            <div key={r.name} className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-semibold text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>{r.name}</span>
              <span className="text-sm font-black text-emerald-700" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(r.avgMeal)}</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t-2 border-gray-200 flex justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>Monthly est.</span>
            <span className="text-sm font-black text-emerald-800" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(foodDetails.monthlyCost)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// SECTION 2 — EXPENSES DASHBOARD
// ============================================================
function DashboardSection() {
  const allExpenses = [
    { name: 'PAYE', amount: taxBreakdown.paye, category: 'tax' },
    { name: 'NSSF', amount: taxBreakdown.nssf, category: 'tax' },
    { name: 'SHIF', amount: taxBreakdown.shif, category: 'tax' },
    { name: 'Housing Levy', amount: taxBreakdown.housingLevy, category: 'tax' },
    { name: expenseBreakdown.rent.label, amount: expenseBreakdown.rent.amount, category: 'rent' },
    { name: expenseBreakdown.food.label, amount: expenseBreakdown.food.amount, category: 'food' },
    { name: expenseBreakdown.transport.label, amount: expenseBreakdown.transport.amount, category: 'transport' },
    ...expenseBreakdown.custom.map((c) => ({ name: c.name, amount: c.amount, category: c.category })),
  ]

  return (
    <div className="space-y-8">
      {/* Section heading */}
      <div>
        <h2 className="text-4xl md:text-5xl font-black text-red-700 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
          EXPENSES DASHBOARD
        </h2>
        <p className="text-lg font-bold text-blue-800 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {userData.name} &mdash; {userData.company}
        </p>
        <MaasaiStripe className="mt-3" />
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross */}
        <div className="bg-white border-2 border-gray-200 border-t-4 border-t-red-600 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Gross Salary</p>
          <p className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(dashboardSummary.grossSalary)}</p>
        </div>
        {/* Deductions */}
        <div className="bg-white border-2 border-gray-200 border-t-4 border-t-blue-700 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-700 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Deductions</p>
          <p className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(dashboardSummary.totalDeductions)}</p>
        </div>
        {/* Expenses */}
        <div className="bg-white border-2 border-gray-200 border-t-4 border-t-orange-500 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Expenses</p>
          <p className="text-2xl md:text-3xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(dashboardSummary.totalExpenses)}</p>
        </div>
        {/* Take-Home */}
        <div className="bg-white border-2 border-gray-200 border-t-4 border-t-emerald-600 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Take-Home</p>
          <p className="text-2xl md:text-3xl font-black text-emerald-700" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(dashboardSummary.takeHome)}</p>
        </div>
      </div>

      {/* Chart + Table row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white border-2 border-gray-200 p-6">
          <h3 className="text-lg font-extrabold text-blue-800 uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Expense Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={expenseChartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={50}
                dataKey="value"
                strokeWidth={3}
                stroke="#000"
              >
                {expenseChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatKES(value)}
                contentStyle={{
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 700,
                  border: '2px solid #1e3a5f',
                  borderRadius: 0,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4">
            {expenseChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 border border-black/30"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-xs font-bold text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {entry.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Table */}
        <div className="bg-white border-2 border-gray-200 p-6 overflow-auto">
          <h3 className="text-lg font-extrabold text-blue-800 uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            All Items
          </h3>
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-blue-800">
                <th className="text-left py-2 text-xs font-black uppercase tracking-widest text-blue-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Category</th>
                <th className="text-left py-2 text-xs font-black uppercase tracking-widest text-blue-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Item</th>
                <th className="text-right py-2 text-xs font-black uppercase tracking-widest text-blue-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {allExpenses.map((item, i) => (
                <tr key={item.name} className={`border-b border-gray-200 ${i % 2 === 1 ? 'bg-blue-50' : 'bg-white'}`}>
                  <td className="py-2.5 pr-3">
                    <CategoryBlock category={item.category} />
                  </td>
                  <td className="py-2.5 text-sm font-bold text-gray-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {item.name}
                  </td>
                  <td className="py-2.5 text-right text-sm font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {formatKES(item.amount)}
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="border-t-4 border-red-600">
                <td colSpan={2} className="py-3 text-sm font-black uppercase tracking-wider text-red-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  TOTAL
                </td>
                <td className="py-3 text-right text-lg font-black text-red-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatKES(dashboardSummary.totalDeductions + dashboardSummary.totalExpenses)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick-add expenses */}
      <div className="bg-white border-2 border-gray-200 border-l-4 border-l-orange-500 p-6">
        <h3 className="text-lg font-extrabold text-orange-600 uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Quick Add Expenses
        </h3>
        <div className="flex flex-wrap gap-3">
          {quickAddExpenses.map((exp) => (
            <button
              key={exp.name}
              className="px-4 py-2 border-2 border-gray-300 text-sm font-bold uppercase tracking-wider text-gray-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <CategoryBlock category={exp.category} />{' '}
              <span className="ml-2">{exp.name}</span>
              <span className="ml-2 text-gray-400 font-semibold">({formatKES(exp.defaultAmount)})</span>
            </button>
          ))}
        </div>
        <button
          className="mt-5 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm uppercase tracking-widest border-4 border-orange-700 transition-colors"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          + ADD EXPENSE
        </button>
      </div>

      <ThinStripe />
    </div>
  )
}

// ============================================================
// SECTION 3 — GROWTH PROJECTIONS
// ============================================================
function GrowthSection() {
  const milestones = [
    { year: 3, data: growthProjections.year3, color: 'red' },
    { year: 5, data: growthProjections.year5, color: 'blue' },
    { year: 7, data: growthProjections.year7, color: 'orange' },
    { year: 10, data: growthProjections.year10, color: 'emerald' },
  ]

  const colorClasses: Record<string, { text: string; border: string; bg: string; yearText: string }> = {
    red: { text: 'text-red-700', border: 'border-red-600', bg: 'bg-red-50', yearText: 'text-red-600' },
    blue: { text: 'text-blue-800', border: 'border-blue-700', bg: 'bg-blue-50', yearText: 'text-blue-700' },
    orange: { text: 'text-orange-600', border: 'border-orange-500', bg: 'bg-orange-50', yearText: 'text-orange-500' },
    emerald: { text: 'text-emerald-700', border: 'border-emerald-600', bg: 'bg-emerald-50', yearText: 'text-emerald-600' },
  }

  return (
    <div className="space-y-8">
      {/* Section heading */}
      <div>
        <h2 className="text-4xl md:text-5xl font-black text-red-700 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
          GROWTH PROJECTIONS
        </h2>
        <p className="text-lg font-bold text-blue-800 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Estimated salary trajectory based on market trends
        </p>
        <MaasaiStripe className="mt-3" />
      </div>

      {/* Current baseline */}
      <div className="bg-white border-2 border-gray-200 border-l-4 border-l-red-600 p-5 max-w-md">
        <p className="text-xs font-bold uppercase tracking-widest text-red-600 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Current Take-Home</p>
        <p className="text-3xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(growthProjections.current.takeHome)}</p>
        <p className="text-sm font-bold text-gray-500 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
          from gross {formatKES(growthProjections.current.salary)}
        </p>
      </div>

      {/* Milestone cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {milestones.map((m) => {
          const cls = colorClasses[m.color]
          return (
            <div key={m.year} className={`bg-white border-2 border-gray-200 ${cls.border} border-t-4 p-5 relative overflow-hidden`}>
              {/* Big year number */}
              <div className={`absolute -right-2 -top-3 text-8xl font-black ${cls.yearText} opacity-15 select-none leading-none`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                {m.year}
              </div>
              <div className="relative z-10">
                <p className={`text-xs font-bold uppercase tracking-widest ${cls.text} mb-1`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Year {m.year}
                </p>
                <p className={`text-sm font-bold text-gray-500 mb-2`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Salary: {formatKES(m.data.salary)}
                </p>
                <p className="text-2xl font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatKES(m.data.takeHome)}
                </p>
                <p className="text-xs font-semibold text-gray-400 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  take-home/mo
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Growth Line Chart */}
      <div className="bg-white border-2 border-gray-200 p-6">
        <h3 className="text-lg font-extrabold text-blue-800 uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          10-Year Projection
        </h3>
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={growthChartData}>
            <CartesianGrid strokeDasharray="4 4" stroke="#d1d5db" strokeWidth={1} />
            <XAxis
              dataKey="year"
              tick={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 12 }}
              tickFormatter={(v) => `Yr ${v}`}
              stroke="#374151"
              strokeWidth={2}
            />
            <YAxis
              tick={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              stroke="#374151"
              strokeWidth={2}
            />
            <Tooltip
              formatter={(value: number, name: string) => [formatKES(value), name]}
              contentStyle={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                border: '2px solid #1e3a5f',
                borderRadius: 0,
              }}
            />
            <Legend
              wrapperStyle={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 12 }}
            />
            <Line type="monotone" dataKey="salary" name="Gross Salary" stroke="#b91c1c" strokeWidth={3} dot={{ r: 4, fill: '#b91c1c', strokeWidth: 2 }} />
            <Line type="monotone" dataKey="takeHome" name="Take-Home" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: '#16a34a', strokeWidth: 2 }} />
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2 }} />
            <Line type="monotone" dataKey="taxes" name="Taxes" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 4, fill: '#1d4ed8', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Assumptions sliders */}
      <div className="bg-white border-2 border-gray-200 border-l-4 border-l-blue-700 p-6">
        <h3 className="text-lg font-extrabold text-blue-800 uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Assumptions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Salary Growth Rate', value: growthAssumptions.salaryGrowthRate, unit: '%' },
            { label: 'Rent Inflation', value: growthAssumptions.rentInflation, unit: '%' },
            { label: 'Food Inflation', value: growthAssumptions.foodInflation, unit: '%' },
            { label: 'Transport Inflation', value: growthAssumptions.transportInflation, unit: '%' },
            { label: 'General CPI', value: growthAssumptions.generalCPI, unit: '%' },
          ].map((a) => (
            <div key={a.label}>
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-sm font-bold uppercase tracking-wider text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {a.label}
                </label>
                <span className="text-lg font-black text-red-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {a.value}{a.unit}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={0.5}
                defaultValue={a.value}
                className="w-full h-2 appearance-none bg-gray-300 accent-red-600 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-white border-2 border-gray-200 p-6 overflow-auto">
        <h3 className="text-lg font-extrabold text-blue-800 uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Detailed Comparison
        </h3>
        <table className="w-full">
          <thead>
            <tr className="border-b-4 border-blue-800">
              <th className="text-left py-2 text-xs font-black uppercase tracking-widest text-blue-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Metric</th>
              <th className="text-right py-2 text-xs font-black uppercase tracking-widest text-red-600" style={{ fontFamily: 'Outfit, sans-serif' }}>Current</th>
              <th className="text-right py-2 text-xs font-black uppercase tracking-widest text-red-600" style={{ fontFamily: 'Outfit, sans-serif' }}>Yr 3</th>
              <th className="text-right py-2 text-xs font-black uppercase tracking-widest text-blue-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Yr 5</th>
              <th className="text-right py-2 text-xs font-black uppercase tracking-widest text-blue-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Yr 10</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Gross Salary', key: 'salary' as const },
              { label: 'Take-Home', key: 'takeHome' as const },
              { label: 'Total Expenses', key: 'totalExpenses' as const },
              { label: 'Total Tax', key: 'totalTax' as const },
            ].map((row, i) => (
              <tr key={row.label} className={`border-b border-gray-200 ${i % 2 === 1 ? 'bg-blue-50' : 'bg-white'}`}>
                <td className="py-2.5 text-sm font-bold text-gray-800" style={{ fontFamily: 'Outfit, sans-serif' }}>{row.label}</td>
                <td className="py-2.5 text-right text-sm font-black text-red-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatKES(growthProjections.current[row.key])}
                </td>
                <td className="py-2.5 text-right text-sm font-black text-red-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatKES(growthProjections.year3[row.key])}
                </td>
                <td className="py-2.5 text-right text-sm font-black text-blue-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatKES(growthProjections.year5[row.key])}
                </td>
                <td className="py-2.5 text-right text-sm font-black text-blue-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {formatKES(growthProjections.year10[row.key])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ThinStripe />
    </div>
  )
}

// ============================================================
// SECTION 4 — SALARY COMPARISON
// ============================================================
function ComparisonSection() {
  const isBelow = salaryComparison.verdict === 'slightly_below' || salaryComparison.verdict === 'below'
  const pctDiff = Math.round(
    Math.abs(salaryComparison.userSalary - salaryComparison.marketMedian) / salaryComparison.marketMedian * 100
  )

  return (
    <div className="space-y-8">
      {/* Section heading */}
      <div>
        <h2 className="text-4xl md:text-5xl font-black text-red-700 uppercase tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
          SALARY COMPARISON
        </h2>
        <p className="text-lg font-bold text-blue-800 mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {salaryComparison.role} in {salaryComparison.location}
        </p>
        <MaasaiStripe className="mt-3" />
      </div>

      {/* HUGE verdict */}
      <div className="bg-white border-4 border-gray-200 p-8 md:p-12 text-center">
        <p className={`text-5xl md:text-7xl font-black uppercase tracking-tight ${isBelow ? 'text-red-700' : 'text-emerald-600'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
          {pctDiff}% {isBelow ? 'BELOW' : 'ABOVE'} MARKET
        </p>
        <p className="text-lg font-bold text-gray-600 mt-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {salaryComparison.verdictText}
        </p>
        <ThinStripe className="mt-6" />
      </div>

      {/* Stats boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-700 text-white p-5 border-4 border-red-900">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Salary</p>
          <p className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(salaryComparison.userSalary)}</p>
        </div>
        <div className="bg-blue-800 text-white p-5 border-4 border-blue-950">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Market Median</p>
          <p className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(salaryComparison.marketMedian)}</p>
        </div>
        <div className="bg-orange-500 text-white p-5 border-4 border-orange-700">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>25th Percentile</p>
          <p className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(salaryComparison.p25)}</p>
        </div>
        <div className="bg-emerald-600 text-white p-5 border-4 border-emerald-800">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>75th Percentile</p>
          <p className="text-2xl font-black" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(salaryComparison.p75)}</p>
        </div>
      </div>

      {/* Bell Curve / Distribution Chart */}
      <div className="bg-white border-2 border-gray-200 p-6">
        <h3 className="text-lg font-extrabold text-blue-800 uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Market Distribution ({salaryComparison.sampleSize} samples)
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={salaryDistributionData}>
            <CartesianGrid strokeDasharray="4 4" stroke="#d1d5db" strokeWidth={1} />
            <XAxis
              dataKey="salary"
              tick={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              stroke="#374151"
              strokeWidth={2}
            />
            <YAxis
              tick={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 11 }}
              stroke="#374151"
              strokeWidth={2}
            />
            <Tooltip
              formatter={(value: number, name: string) => [value, 'Frequency']}
              labelFormatter={(label) => formatKES(Number(label))}
              contentStyle={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                border: '2px solid #1e3a5f',
                borderRadius: 0,
              }}
            />
            <defs>
              <linearGradient id="maasaiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d4ed8" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="frequency"
              stroke="#1d4ed8"
              strokeWidth={3}
              fill="url(#maasaiFill)"
            />
            {/* User marker - vertical reference line simulated */}
            <CartesianGrid
              horizontalPoints={[]}
              verticalPoints={[]}
              stroke="none"
            />
          </AreaChart>
        </ResponsiveContainer>
        {/* User position indicator */}
        <div className="flex items-center gap-3 mt-4 px-4">
          <div className="w-4 h-4 bg-red-600 border-2 border-red-900" />
          <span className="text-sm font-bold text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your salary: {formatKES(salaryComparison.userSalary)} (Percentile: {salaryComparison.percentile}th)
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 px-4">
          <div className="w-4 h-4 bg-blue-700 border-2 border-blue-900" />
          <span className="text-sm font-bold text-gray-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Market Median: {formatKES(salaryComparison.marketMedian)}
          </span>
        </div>
      </div>

      {/* Info card with alternating accents */}
      <div className="bg-white border-2 border-gray-200 overflow-hidden">
        <div className="flex h-2">
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-blue-700" />
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-blue-700" />
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-blue-700" />
        </div>
        <div className="p-6 space-y-3">
          <h3 className="text-lg font-extrabold text-blue-800 uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Comparison Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-red-600 pl-4 py-2">
              <p className="text-xs font-bold uppercase tracking-widest text-red-600" style={{ fontFamily: 'Outfit, sans-serif' }}>Role</p>
              <p className="text-base font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{salaryComparison.role}</p>
            </div>
            <div className="border-l-4 border-blue-700 pl-4 py-2">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Experience Band</p>
              <p className="text-base font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{salaryComparison.experienceBand}</p>
            </div>
            <div className="border-l-4 border-red-600 pl-4 py-2">
              <p className="text-xs font-bold uppercase tracking-widest text-red-600" style={{ fontFamily: 'Outfit, sans-serif' }}>Location</p>
              <p className="text-base font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{salaryComparison.location}</p>
            </div>
            <div className="border-l-4 border-blue-700 pl-4 py-2">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Market Mean</p>
              <p className="text-base font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{formatKES(salaryComparison.marketMean)}</p>
            </div>
            <div className="border-l-4 border-red-600 pl-4 py-2">
              <p className="text-xs font-bold uppercase tracking-widest text-red-600" style={{ fontFamily: 'Outfit, sans-serif' }}>Confidence</p>
              <p className="text-base font-black text-gray-900 uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>{salaryComparison.confidence}</p>
            </div>
            <div className="border-l-4 border-blue-700 pl-4 py-2">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Sample Size</p>
              <p className="text-base font-black text-gray-900" style={{ fontFamily: 'Outfit, sans-serif' }}>{salaryComparison.sampleSize} respondents</p>
            </div>
          </div>
          <p className="text-xs font-semibold text-gray-400 pt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Last updated: {salaryComparison.lastUpdated}
          </p>
        </div>
        <div className="flex h-2">
          <div className="flex-1 bg-orange-500" />
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-orange-500" />
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-orange-500" />
          <div className="flex-1 bg-red-600" />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// MAIN COMPONENT — MAASAI BOLD
// ============================================================
export default function Design4MaasaiBold() {
  const [activeTab, setActiveTab] = useState<TabKey>('input')

  return (
    <div className="min-h-screen bg-stone-100" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* ===== TOP NAV ===== */}
      <nav className="bg-red-700 border-b-4 border-blue-800 sticky top-0 z-50">
        {/* Kenya flag stripe */}
        <div className="flex h-1.5">
          <div className="flex-1 bg-black" />
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-emerald-700" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: Back + Brand */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm font-black text-white/80 hover:text-white uppercase tracking-widest transition-colors"
            >
              &larr; BACK
            </Link>
            <div className="hidden sm:block w-px h-6 bg-white/30" />
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest">
              MSHAHARA
            </h1>
          </div>

          {/* Right: User badge */}
          <div className="bg-white/15 border-2 border-white/30 px-4 py-1.5">
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              {userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}.
            </span>
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 text-sm font-black uppercase tracking-widest transition-all border-2 ${
                activeTab === tab.key
                  ? 'bg-white text-red-700 border-white'
                  : 'bg-transparent text-white/80 border-white/30 hover:bg-white/10 hover:text-white hover:border-white/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ===== CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {activeTab === 'input' && <InputFormSection />}
        {activeTab === 'dashboard' && <DashboardSection />}
        {activeTab === 'growth' && <GrowthSection />}
        {activeTab === 'comparison' && <ComparisonSection />}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 border-t-4 border-red-600">
        <MaasaiStripe />
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-lg font-black text-white uppercase tracking-widest">
              MSHAHARA
            </p>
            <p className="text-sm font-semibold text-gray-400">
              Workplace budgeting for Kenya's workforce
            </p>
          </div>
          <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
            Nairobi, Kenya &bull; 2026
          </div>
        </div>
        <div className="flex h-1.5">
          <div className="flex-1 bg-black" />
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-emerald-700" />
        </div>
      </footer>
    </div>
  )
}
