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

const tabs = ['Calculator', 'Dashboard', 'Growth', 'Comparison'] as const
type Tab = (typeof tabs)[number]

// Muted, earthy color palette for the pie chart — almost monochrome with subtle variation
const pieColors = [
  '#78716c', // stone-500
  '#a8a29e', // stone-400
  '#d6d3d1', // stone-300
  '#92918e',
  '#b0ada9',
  '#c4c1bd',
  '#8a8885',
  '#9e9b97',
  '#bcb9b5',
  '#a4a19d',
  '#cac7c3',
  '#8e8c89',
  '#d1ceca',
]

export default function Design3SavannaClean() {
  const [activeTab, setActiveTab] = useState<Tab>('Calculator')

  return (
    <div className="min-h-screen bg-stone-50 font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top bar */}
      <header className="border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-stone-400 text-sm hover:text-stone-600 transition-colors">
              &larr; Back
            </Link>
            <h1 className="text-stone-800 text-lg tracking-tight font-normal">Kifaru</h1>
          </div>
          <span className="text-stone-400 text-sm">{userData.name.split(' ')[0]} {userData.name.split(' ')[1]?.[0]}.</span>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-sm transition-colors relative ${
                activeTab === tab
                  ? 'text-emerald-600'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-emerald-600" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {activeTab === 'Calculator' && <CalculatorSection />}
        {activeTab === 'Dashboard' && <DashboardSection />}
        {activeTab === 'Growth' && <GrowthSection />}
        {activeTab === 'Comparison' && <ComparisonSection />}
      </main>
    </div>
  )
}

/* ======================================================================
   SECTION 1: CALCULATOR / INPUT FORM
   ====================================================================== */

function CalculatorSection() {
  const [formData, setFormData] = useState({
    name: userData.name,
    company: userData.company,
    companyLocation: userData.companyLocation,
    residentialArea: userData.residentialArea,
    yearsOfExperience: userData.yearsOfExperience.toString(),
    monthlySalary: userData.monthlySalary.toString(),
  })

  return (
    <div className="max-w-xl mx-auto">
      {/* Heading */}
      <div className="mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-light text-stone-800 tracking-tight leading-tight mb-3">
          What will you<br />actually take home?
        </h2>
        <p className="text-stone-400 text-sm tracking-wide">
          Salary calculator for Nairobi professionals
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white border border-stone-200 rounded-lg p-8 md:p-10">
        <div className="space-y-8">
          <FormField
            label="Name"
            value={formData.name}
            onChange={(v) => setFormData({ ...formData, name: v })}
          />
          <FormField
            label="Company"
            value={formData.company}
            onChange={(v) => setFormData({ ...formData, company: v })}
          />
          <FormField
            label="Company Location"
            value={formData.companyLocation}
            onChange={(v) => setFormData({ ...formData, companyLocation: v })}
          />
          <FormField
            label="Residential Area"
            value={formData.residentialArea}
            onChange={(v) => setFormData({ ...formData, residentialArea: v })}
          />
          <div className="grid grid-cols-2 gap-8">
            <FormField
              label="Years of Experience"
              value={formData.yearsOfExperience}
              onChange={(v) => setFormData({ ...formData, yearsOfExperience: v })}
              type="number"
            />
            <FormField
              label="Monthly Salary (KES)"
              value={formData.monthlySalary}
              onChange={(v) => setFormData({ ...formData, monthlySalary: v })}
              type="number"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button className="text-emerald-600 text-sm font-normal hover:text-emerald-700 transition-colors">
              Calculate &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Nairobi areas */}
      <div className="mt-10 text-center">
        <p className="text-xs text-stone-400 mb-2 uppercase tracking-widest">Available Areas</p>
        <p className="text-xs text-stone-400 leading-relaxed">
          {nairobiAreas.join(', ')}
        </p>
      </div>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-stone-500 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-stone-200 pb-2 text-stone-800 font-light text-base focus:outline-none focus:border-emerald-600 transition-colors placeholder:text-stone-300"
      />
    </div>
  )
}

/* ======================================================================
   SECTION 2: EXPENSES DASHBOARD
   ====================================================================== */

function DashboardSection() {
  // Combine auto + custom expenses into a flat list
  const allExpenses = [
    { name: expenseBreakdown.rent.label, amount: expenseBreakdown.rent.amount, category: expenseBreakdown.rent.category, source: expenseBreakdown.rent.source },
    { name: expenseBreakdown.food.label, amount: expenseBreakdown.food.amount, category: expenseBreakdown.food.category, source: expenseBreakdown.food.source },
    { name: expenseBreakdown.transport.label, amount: expenseBreakdown.transport.amount, category: expenseBreakdown.transport.category, source: expenseBreakdown.transport.source },
    ...expenseBreakdown.custom.map((c) => ({
      name: c.name,
      amount: c.amount,
      category: c.category,
      source: c.source,
    })),
  ]

  const categoryColors: Record<string, string> = {
    rent: 'bg-stone-600',
    food: 'bg-amber-500',
    transport: 'bg-emerald-600',
    fitness: 'bg-stone-400',
    utilities: 'bg-stone-400',
    entertainment: 'bg-stone-300',
    savings: 'bg-emerald-400',
    giving: 'bg-stone-500',
    fees: 'bg-stone-300',
  }

  return (
    <div>
      {/* 4 stat sections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
        <StatBlock label="Gross Salary" amount={dashboardSummary.grossSalary} />
        <StatBlock label="Deductions" amount={dashboardSummary.totalDeductions} negative />
        <StatBlock label="Expenses" amount={dashboardSummary.totalExpenses} negative />
        <StatBlock label="Take-Home" amount={dashboardSummary.takeHome} highlight />
      </div>

      <div className="h-px bg-stone-200 my-12" />

      {/* Pie chart + details side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Pie chart */}
        <div className="flex justify-center">
          <div className="w-64 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseChartData.map((_, index) => (
                    <Cell key={index} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatKES(value)}
                  contentStyle={{
                    background: '#fafaf9',
                    border: '1px solid #e7e5e4',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 300,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tax breakdown */}
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">Tax Deductions</p>
          <div className="space-y-3">
            <TaxRow label="PAYE" amount={taxBreakdown.paye} />
            <TaxRow label="NSSF" amount={taxBreakdown.nssf} />
            <TaxRow label="SHIF" amount={taxBreakdown.shif} />
            <TaxRow label="Housing Levy" amount={taxBreakdown.housingLevy} />
            <TaxRow label="Personal Relief" amount={-taxBreakdown.personalRelief} relief />
            <div className="h-px bg-stone-200 my-2" />
            <div className="flex justify-between text-sm">
              <span className="text-stone-800">Total</span>
              <span className="text-stone-800">{formatKES(taxBreakdown.totalDeductions)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-stone-200 my-12" />

      {/* Expense table */}
      <div>
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-6">Expenses</p>
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="text-left text-xs uppercase tracking-widest text-stone-400 font-normal pb-3">Category</th>
              <th className="text-left text-xs uppercase tracking-widest text-stone-400 font-normal pb-3">Item</th>
              <th className="text-right text-xs uppercase tracking-widest text-stone-400 font-normal pb-3">Amount</th>
              <th className="text-right text-xs uppercase tracking-widest text-stone-400 font-normal pb-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {allExpenses.map((expense, i) => (
              <tr key={i} className="border-b border-stone-100">
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${categoryColors[expense.category] || 'bg-stone-300'}`} />
                    <span className="text-sm text-stone-500 capitalize">{expense.category}</span>
                  </div>
                </td>
                <td className="py-4 text-sm text-stone-800">{expense.name}</td>
                <td className="py-4 text-sm text-stone-800 text-right">{formatKES(expense.amount)}</td>
                <td className="py-4 text-right">
                  <span className={`text-xs ${expense.source === 'auto' ? 'text-emerald-600' : 'text-stone-400'}`}>
                    {expense.source === 'auto' ? 'auto' : 'manual'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-stone-200">
              <td colSpan={2} className="py-4 text-sm text-stone-800">Total</td>
              <td className="py-4 text-sm text-stone-800 text-right font-normal">{formatKES(dashboardSummary.totalExpenses)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="h-px bg-stone-200 my-12" />

      {/* Quick-add */}
      <div>
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Add expense</p>
        <p className="text-sm text-stone-500">
          {quickAddExpenses.map((item, i) => (
            <span key={item.name}>
              <button className="text-emerald-600 hover:text-emerald-700 transition-colors">
                {item.name}
              </button>
              {i < quickAddExpenses.length - 1 && <span className="text-stone-300 mx-2">/</span>}
            </span>
          ))}
        </p>
      </div>

      <div className="h-px bg-stone-200 my-12" />

      {/* Source details — travel, rent, food */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Travel */}
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">Travel</p>
          <p className="text-xs text-stone-400 mb-1">{travelDetails.origin} &rarr; {travelDetails.destination}</p>
          <p className="text-xs text-stone-400 mb-4">{travelDetails.distance} &middot; {travelDetails.duration}</p>
          <div className="space-y-2">
            {travelDetails.modes.map((mode) => (
              <div key={mode.mode} className="flex justify-between text-sm">
                <span className="text-stone-500">{mode.mode}</span>
                <span className="text-stone-800">{formatKES(mode.monthly)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rent */}
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">Rent in {rentDetails.area}</p>
          <p className="text-xs text-stone-400 mb-4">Zone: {rentDetails.zone}</p>
          <div className="space-y-2">
            {rentDetails.options.map((opt) => (
              <div key={opt.type} className="flex justify-between text-sm">
                <span className="text-stone-500">{opt.type}</span>
                <span className="text-stone-800">{formatKES(opt.median)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-3">Updated {rentDetails.lastUpdated}</p>
        </div>

        {/* Food */}
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-4">Food near {foodDetails.area}</p>
          <p className="text-xs text-stone-400 mb-4">Avg lunch: {formatKES(foodDetails.avgLunchCost)} &middot; {foodDetails.workingDays} days</p>
          <div className="space-y-2">
            {foodDetails.nearbyRestaurants.map((r) => (
              <div key={r.name} className="flex justify-between text-sm">
                <span className="text-stone-500">{r.name}</span>
                <span className="text-stone-800">{formatKES(r.avgMeal)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatBlock({
  label,
  amount,
  negative,
  highlight,
}: {
  label: string
  amount: number
  negative?: boolean
  highlight?: boolean
}) {
  return (
    <div className="py-6 px-2 text-center md:text-left">
      <p className={`text-2xl md:text-3xl font-light tracking-tight ${
        highlight ? 'text-emerald-600' : negative ? 'text-stone-600' : 'text-stone-800'
      }`}>
        {negative ? '-' : ''}{formatKES(amount)}
      </p>
      <p className="text-xs uppercase tracking-widest text-stone-400 mt-2">{label}</p>
    </div>
  )
}

function TaxRow({ label, amount, relief }: { label: string; amount: number; relief?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-stone-500">{label}</span>
      <span className={relief ? 'text-emerald-600' : 'text-stone-800'}>
        {relief ? '-' : ''}{formatKES(Math.abs(amount))}
      </span>
    </div>
  )
}

/* ======================================================================
   SECTION 3: GROWTH PROJECTIONS
   ====================================================================== */

function GrowthSection() {
  const milestones = [
    { label: 'Now', data: growthProjections.current },
    { label: 'Year 3', data: growthProjections.year3 },
    { label: 'Year 5', data: growthProjections.year5 },
    { label: 'Year 7', data: growthProjections.year7 },
    { label: 'Year 10', data: growthProjections.year10 },
  ]

  return (
    <div>
      <h3 className="text-2xl font-light text-stone-800 mb-2">Growth Projections</h3>
      <p className="text-sm text-stone-400 mb-12">Estimated take-home over the next 10 years</p>

      {/* Horizontal timeline */}
      <div className="mb-16">
        <div className="relative flex justify-between items-center">
          {/* Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-stone-200 -translate-y-1/2" />
          {milestones.map((m, i) => (
            <div key={i} className="relative flex flex-col items-center z-10">
              <p className="text-xs text-stone-400 mb-3">{m.label}</p>
              <div className={`w-3 h-3 rounded-full border-2 ${
                i === 0 ? 'bg-emerald-600 border-emerald-600' : 'bg-stone-50 border-stone-300'
              }`} />
              <p className="text-sm font-light text-stone-800 mt-3">{formatKES(m.data.takeHome)}</p>
              <p className="text-xs text-stone-400 mt-1">salary {formatKES(m.data.salary)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-stone-200 my-12" />

      {/* Line chart */}
      <div className="mb-12">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-6">Projection Curve</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 12, fill: '#a8a29e' }}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
                tickFormatter={(v) => `Yr ${v}`}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#a8a29e' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={50}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatKES(value), name]}
                contentStyle={{
                  background: '#fafaf9',
                  border: '1px solid #e7e5e4',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 300,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: '#a8a29e' }}
              />
              <Line
                type="monotone"
                dataKey="salary"
                stroke="#78716c"
                strokeWidth={1.5}
                dot={false}
                name="Gross Salary"
              />
              <Line
                type="monotone"
                dataKey="takeHome"
                stroke="#059669"
                strokeWidth={1.5}
                dot={false}
                name="Take-Home"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#d6d3d1"
                strokeWidth={1}
                dot={false}
                strokeDasharray="4 4"
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="h-px bg-stone-200 my-12" />

      {/* Assumptions */}
      <div className="mb-12">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-6">Assumptions</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <AssumptionField label="Salary Growth" value={`${growthAssumptions.salaryGrowthRate}%`} />
          <AssumptionField label="Rent Inflation" value={`${growthAssumptions.rentInflation}%`} />
          <AssumptionField label="Food Inflation" value={`${growthAssumptions.foodInflation}%`} />
          <AssumptionField label="Transport Inflation" value={`${growthAssumptions.transportInflation}%`} />
          <AssumptionField label="General CPI" value={`${growthAssumptions.generalCPI}%`} />
        </div>
      </div>

      <div className="h-px bg-stone-200 my-12" />

      {/* Detail table */}
      <div>
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-6">Breakdown</p>
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-200">
              <th className="text-left text-xs uppercase tracking-widest text-stone-400 font-normal pb-3 pr-4">Period</th>
              <th className="text-right text-xs uppercase tracking-widest text-stone-400 font-normal pb-3 px-4">Salary</th>
              <th className="text-right text-xs uppercase tracking-widest text-stone-400 font-normal pb-3 px-4">Tax</th>
              <th className="text-right text-xs uppercase tracking-widest text-stone-400 font-normal pb-3 px-4">Expenses</th>
              <th className="text-right text-xs uppercase tracking-widest text-stone-400 font-normal pb-3 pl-4">Take-Home</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m, i) => (
              <tr key={i} className="border-b border-stone-100">
                <td className="py-4 pr-4 text-sm text-stone-500">{m.label}</td>
                <td className="py-4 px-4 text-sm text-stone-800 text-right">{formatKES(m.data.salary)}</td>
                <td className="py-4 px-4 text-sm text-stone-500 text-right">{formatKES(m.data.totalTax)}</td>
                <td className="py-4 px-4 text-sm text-stone-500 text-right">{formatKES(m.data.totalExpenses)}</td>
                <td className="py-4 pl-4 text-sm text-emerald-600 text-right font-normal">{formatKES(m.data.takeHome)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AssumptionField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-400 mb-1">{label}</p>
      <div className="border-b border-stone-200 pb-1">
        <span className="text-sm text-stone-800 font-light">{value}</span>
      </div>
    </div>
  )
}

/* ======================================================================
   SECTION 4: SALARY COMPARISON
   ====================================================================== */

function ComparisonSection() {
  const isBelow = salaryComparison.verdict === 'slightly_below' || salaryComparison.verdict === 'below'
  const verdictColor = isBelow ? 'text-rose-500' : 'text-emerald-600'

  return (
    <div>
      {/* Verdict */}
      <div className="mb-12">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Market Position</p>
        <p className={`text-2xl md:text-3xl font-light ${verdictColor}`}>
          {salaryComparison.verdictText}
        </p>
        <p className="text-sm text-stone-400 mt-2">
          {salaryComparison.role} &middot; {salaryComparison.experienceBand} &middot; {salaryComparison.location}
        </p>
      </div>

      <div className="h-px bg-stone-200 my-12" />

      {/* Key stats row */}
      <div className="flex items-start divide-x divide-stone-200">
        <ComparisonStat label="Your Salary" value={formatKES(salaryComparison.userSalary)} />
        <ComparisonStat label="Market Median" value={formatKES(salaryComparison.marketMedian)} />
        <ComparisonStat label="25th Percentile" value={formatKES(salaryComparison.p25)} />
        <ComparisonStat label="75th Percentile" value={formatKES(salaryComparison.p75)} />
        <ComparisonStat label="Your Percentile" value={`${salaryComparison.percentile}th`} />
      </div>

      <div className="h-px bg-stone-200 my-12" />

      {/* Bell curve */}
      <div className="mb-12">
        <p className="text-xs uppercase tracking-widest text-stone-400 mb-6">Salary Distribution</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salaryDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
              <XAxis
                dataKey="salary"
                tick={{ fontSize: 11, fill: '#a8a29e' }}
                axisLine={{ stroke: '#e7e5e4' }}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <YAxis hide />
              <Tooltip
                formatter={(value: number) => [value, 'Respondents']}
                labelFormatter={(label) => formatKES(label as number)}
                contentStyle={{
                  background: '#fafaf9',
                  border: '1px solid #e7e5e4',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 300,
                }}
              />
              <Area
                type="monotone"
                dataKey="frequency"
                stroke="#d6d3d1"
                strokeWidth={1.5}
                fill="#f5f5f4"
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Your salary marker label */}
        <div className="flex justify-center mt-2">
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Your salary: {formatKES(salaryComparison.userSalary)}</span>
            <span className="mx-2 text-stone-300">|</span>
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            <span>Median: {formatKES(salaryComparison.marketMedian)}</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-stone-200 my-12" />

      {/* Meta info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <MetaField label="Sample Size" value={`${salaryComparison.sampleSize} respondents`} />
        <MetaField label="Confidence" value={salaryComparison.confidence} />
        <MetaField label="Last Updated" value={salaryComparison.lastUpdated} />
        <MetaField label="Market Mean" value={formatKES(salaryComparison.marketMean)} />
      </div>
    </div>
  )
}

function ComparisonStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 px-4 first:pl-0 last:pr-0">
      <p className="text-lg md:text-xl font-light text-stone-800">{value}</p>
      <p className="text-xs uppercase tracking-widest text-stone-400 mt-1">{label}</p>
    </div>
  )
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">{label}</p>
      <p className="text-sm text-stone-600 capitalize">{value}</p>
    </div>
  )
}
