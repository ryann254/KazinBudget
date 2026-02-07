import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { userData, taxBreakdown, expenseBreakdown, dashboardSummary, expenseChartData, growthProjections, growthChartData, salaryComparison, salaryDistributionData, travelDetails, rentDetails, foodDetails, formatKES, growthAssumptions } from '../../data/dummy'
import { Home, User, BarChart3, TrendingUp, Users, ArrowLeft, Wallet, MapPin, Utensils, Bus } from 'lucide-react'

// ============================================================
// Design 4 — Ankara Heritage
// Inspired by African wax print textiles, warm & organic
// ============================================================

type TabKey = 'input' | 'dashboard' | 'growth' | 'comparison'

const COLORS = {
  bg: '#FFF8F0',
  bgAlt: '#FAF3E8',
  primary: '#3C1518',
  primaryLight: '#472D30',
  gold: '#D4A574',
  goldDark: '#C68B59',
  terra: '#C75146',
  terraDark: '#B84233',
  teal: '#1B4332',
  tealLight: '#2D6A4F',
  orange: '#E76F51',
  text: '#2C1810',
  cream: '#FFF8F0',
}

const CHART_PALETTE = [COLORS.gold, COLORS.terra, COLORS.teal, COLORS.orange, COLORS.goldDark, COLORS.terraDark, COLORS.tealLight, COLORS.primaryLight, '#8B5E3C', '#A0522D', '#CD853F', '#DEB887', '#D2691E']

// Ankara-style decorative pattern strip
function AnkaraStrip({ height = 12, className = '' }: { height?: number; className?: string }) {
  return (
    <div className={`w-full ${className}`} style={{
      height,
      background: 'repeating-linear-gradient(90deg, #C75146 0px, #C75146 8px, #D4A574 8px, #D4A574 16px, #1B4332 16px, #1B4332 24px, #E76F51 24px, #E76F51 32px)',
    }} />
  )
}

// Diamond pattern strip (secondary ankara motif)
function DiamondStrip({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full h-2 ${className}`} style={{
      background: 'repeating-linear-gradient(90deg, #D4A574 0px, #D4A574 4px, transparent 4px, transparent 8px, #C75146 8px, #C75146 12px, transparent 12px, transparent 16px)',
    }} />
  )
}

// Decorative concentric circle motif (low opacity background element)
function ConcentricCircle({ size = 120, x, y, opacity = 0.06 }: { size?: number; x: string; y: string; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="absolute pointer-events-none" style={{ top: y, left: x, opacity }}>
      <circle cx="60" cy="60" r="55" fill="none" stroke={COLORS.gold} strokeWidth="2" />
      <circle cx="60" cy="60" r="42" fill="none" stroke={COLORS.terra} strokeWidth="2" />
      <circle cx="60" cy="60" r="29" fill="none" stroke={COLORS.teal} strokeWidth="2" />
      <circle cx="60" cy="60" r="16" fill="none" stroke={COLORS.orange} strokeWidth="2" />
      <circle cx="60" cy="60" r="6" fill={COLORS.gold} />
    </svg>
  )
}

// Decorative corner triangle for cards
function CornerTriangle({ color = COLORS.gold, position = 'top-left' }: { color?: string; position?: string }) {
  const posClass = position === 'top-left' ? 'top-0 left-0' :
    position === 'top-right' ? 'top-0 right-0' :
    position === 'bottom-left' ? 'bottom-0 left-0' : 'bottom-0 right-0'
  const rotation = position === 'top-left' ? '0' :
    position === 'top-right' ? '90' :
    position === 'bottom-right' ? '180' : '270'
  return (
    <svg width="20" height="20" className={`absolute ${posClass} pointer-events-none`} style={{ transform: `rotate(${rotation}deg)` }}>
      <polygon points="0,0 20,0 0,20" fill={color} opacity="0.25" />
    </svg>
  )
}

// Warm-styled section header with textile motif
function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3 mb-2.5">
        {icon && <span style={{ color: COLORS.terra }}>{icon}</span>}
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>{title}</h2>
      </div>
      <DiamondStrip />
    </div>
  )
}

export default function Design4Ankara() {
  const [activeTab, setActiveTab] = useState<TabKey>('input')
  const navigate = useNavigate()

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'input', label: 'Input', icon: <User size={18} /> },
    { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
    { key: 'growth', label: 'Growth', icon: <TrendingUp size={18} /> },
    { key: 'comparison', label: 'Compare', icon: <Users size={18} /> },
  ]

  // Donut chart colors mapped to warm palette
  const donutData = expenseChartData.map((item, i) => ({
    ...item,
    color: CHART_PALETTE[i % CHART_PALETTE.length],
  }))

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300;400;500;600;700;800;900&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');`}</style>
      <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: COLORS.bg, fontFamily: 'Source Sans 3, sans-serif', color: COLORS.text }}>

        {/* Background decorative elements */}
        <ConcentricCircle x="-40px" y="120px" size={180} opacity={0.04} />
        <ConcentricCircle x="85%" y="300px" size={150} opacity={0.04} />
        <ConcentricCircle x="10%" y="70%" size={200} opacity={0.03} />
        <ConcentricCircle x="75%" y="80%" size={130} opacity={0.04} />

        {/* Top Ankara Strip */}
        <AnkaraStrip height={6} />

        {/* Header */}
        <header className="relative px-4 sm:px-6 lg:px-8 pt-5 pb-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
              style={{ background: COLORS.goldDark, color: COLORS.cream }}
            >
              <ArrowLeft size={16} />
              <Home size={16} />
            </button>
            <div className="text-right">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>
                KaziBudget
              </h1>
              <p className="text-xs" style={{ color: COLORS.goldDark, fontFamily: 'Source Sans 3, sans-serif' }}>Ankara Heritage</p>
            </div>
          </div>
        </header>

        <AnkaraStrip height={4} className="mb-1" />

        {/* Tab Navigation */}
        <nav className="px-4 sm:px-6 lg:px-8 py-4 relative z-10">
          <div className="max-w-3xl mx-auto flex gap-1 rounded-xl p-1.5" style={{ background: COLORS.bgAlt, border: `1px solid ${COLORS.gold}40` }}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: activeTab === tab.key ? COLORS.terra : 'transparent',
                  color: activeTab === tab.key ? COLORS.cream : COLORS.primaryLight,
                  fontFamily: 'Source Sans 3, sans-serif',
                  boxShadow: activeTab === tab.key ? '0 2px 8px rgba(199,81,70,0.3)' : 'none',
                }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          {/* Decorative underline motif under active tab */}
          <div className="max-w-3xl mx-auto mt-2">
            <DiamondStrip />
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-10 relative z-10">
          <div className="max-w-3xl mx-auto">
            {activeTab === 'input' && <InputTab />}
            {activeTab === 'dashboard' && <DashboardTab donutData={donutData} />}
            {activeTab === 'growth' && <GrowthTab />}
            {activeTab === 'comparison' && <ComparisonTab />}
          </div>
        </main>

        {/* Footer */}
        <footer>
          <AnkaraStrip height={6} />
          <div className="py-5 text-center text-xs px-4 sm:px-6 lg:px-8" style={{ background: COLORS.primary, color: COLORS.gold, fontFamily: 'Source Sans 3, sans-serif' }}>
            <div className="max-w-3xl mx-auto">
              <p>KaziBudget &mdash; Ankara Heritage Edition</p>
              <p className="mt-1 opacity-60">Crafted with warmth for Kenyan professionals</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

// ============================================================
// INPUT TAB
// ============================================================
function InputTab() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Your Profile" icon={<User size={22} />} />

      {/* Personal Info Card */}
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#FFFFFF', border: `2px solid ${COLORS.gold}30`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
        <CornerTriangle color={COLORS.gold} position="top-left" />
        <CornerTriangle color={COLORS.terra} position="top-right" />
        <div className="space-y-5">
          <InputField label="Full Name" value={userData.name} />
          <InputField label="Company" value={userData.company} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Company Location" value={userData.companyLocation} icon={<MapPin size={16} />} />
            <InputField label="Residential Area" value={userData.residentialArea} icon={<MapPin size={16} />} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Years of Experience" value={String(userData.yearsOfExperience)} />
            <InputField label="Monthly Salary (KES)" value={formatKES(userData.monthlySalary)} icon={<Wallet size={16} />} />
          </div>
        </div>
      </div>

      {/* Tax Breakdown Card */}
      <SectionHeader title="Tax Deductions" icon={<Wallet size={22} />} />
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#FFFFFF', border: `2px solid ${COLORS.terra}20`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
        <CornerTriangle color={COLORS.terra} position="top-left" />
        <CornerTriangle color={COLORS.teal} position="bottom-right" />
        <div className="space-y-3.5">
          <TaxRow label="Gross Salary" value={formatKES(taxBreakdown.grossSalary)} bold />
          <div className="h-px" style={{ background: `${COLORS.gold}40` }} />
          <TaxRow label="PAYE" value={`- ${formatKES(taxBreakdown.paye)}`} />
          <TaxRow label="NSSF" value={`- ${formatKES(taxBreakdown.nssf)}`} />
          <TaxRow label="SHIF" value={`- ${formatKES(taxBreakdown.shif)}`} />
          <TaxRow label="Housing Levy" value={`- ${formatKES(taxBreakdown.housingLevy)}`} />
          <TaxRow label="Personal Relief" value={`+ ${formatKES(taxBreakdown.personalRelief)}`} accent />
          <div className="h-px" style={{ background: `${COLORS.gold}60` }} />
          <TaxRow label="Net After Tax" value={formatKES(taxBreakdown.netAfterTax)} bold accent />
        </div>
      </div>

      {/* Expenses Card */}
      <SectionHeader title="Monthly Expenses" icon={<Utensils size={22} />} />
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#FFFFFF', border: `2px solid ${COLORS.teal}20`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
        <CornerTriangle color={COLORS.teal} position="top-left" />
        <CornerTriangle color={COLORS.orange} position="top-right" />
        <div className="space-y-3.5">
          <TaxRow label={expenseBreakdown.rent.label} value={formatKES(expenseBreakdown.rent.amount)} />
          <TaxRow label={expenseBreakdown.food.label} value={formatKES(expenseBreakdown.food.amount)} />
          <TaxRow label={expenseBreakdown.transport.label} value={formatKES(expenseBreakdown.transport.amount)} />
          <div className="h-px" style={{ background: `${COLORS.gold}40` }} />
          {expenseBreakdown.custom.map(item => (
            <TaxRow key={item.id} label={item.name} value={formatKES(item.amount)} />
          ))}
          <div className="h-px" style={{ background: `${COLORS.gold}60` }} />
          <TaxRow label="Total Expenses" value={formatKES(dashboardSummary.totalExpenses)} bold />
        </div>
      </div>

      {/* Travel & Rent Details */}
      <SectionHeader title="Travel & Housing" icon={<Bus size={22} />} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: '#FFFFFF', borderTop: `4px solid ${COLORS.orange}`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
          <CornerTriangle color={COLORS.orange} position="top-right" />
          <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>
            Transport Options
          </h3>
          <div className="space-y-2.5">
            {travelDetails.modes.map(m => (
              <div key={m.mode} className="flex justify-between text-sm py-1.5" style={{ borderBottom: `1px dashed ${COLORS.gold}30` }}>
                <span>{m.mode}</span>
                <span className="font-semibold" style={{ color: COLORS.terra }}>{formatKES(m.monthly)}/mo</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl p-5 relative overflow-hidden" style={{ background: '#FFFFFF', borderTop: `4px solid ${COLORS.teal}`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
          <CornerTriangle color={COLORS.teal} position="top-right" />
          <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>
            Rent in {rentDetails.area}
          </h3>
          <div className="space-y-2.5">
            {rentDetails.options.map(o => (
              <div key={o.type} className="flex justify-between text-sm py-1.5" style={{ borderBottom: `1px dashed ${COLORS.gold}30` }}>
                <span>{o.type}</span>
                <span className="font-semibold" style={{ color: COLORS.teal }}>{formatKES(o.median)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function InputField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: COLORS.goldDark, fontFamily: 'Source Sans 3, sans-serif' }}>{label}</label>
      <div className="flex items-center gap-2">
        {icon && <span style={{ color: COLORS.gold }}>{icon}</span>}
        <input
          type="text"
          readOnly
          value={value}
          className="w-full bg-transparent py-2.5 text-sm font-medium outline-none"
          style={{ borderBottom: `2px solid ${COLORS.gold}`, color: COLORS.text, fontFamily: 'Source Sans 3, sans-serif' }}
        />
      </div>
    </div>
  )
}

function TaxRow({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className={`text-sm ${bold ? 'font-bold' : ''}`} style={{ color: COLORS.text, fontFamily: bold ? 'Fraunces, serif' : 'Source Sans 3, sans-serif' }}>{label}</span>
      <span className={`text-sm ${bold ? 'font-bold' : 'font-medium'}`} style={{ color: accent ? COLORS.teal : COLORS.text }}>{value}</span>
    </div>
  )
}

// ============================================================
// DASHBOARD TAB
// ============================================================
function DashboardTab({ donutData }: { donutData: typeof expenseChartData }) {
  const summaryCards = [
    { label: 'Gross Salary', value: formatKES(dashboardSummary.grossSalary), color: COLORS.gold, icon: <Wallet size={20} /> },
    { label: 'Tax & Deductions', value: formatKES(dashboardSummary.totalDeductions), color: COLORS.terra, icon: <BarChart3 size={20} /> },
    { label: 'Total Expenses', value: formatKES(dashboardSummary.totalExpenses), color: COLORS.orange, icon: <Utensils size={20} /> },
    { label: 'Take Home', value: formatKES(dashboardSummary.takeHome), color: COLORS.teal, icon: <TrendingUp size={20} /> },
  ]

  return (
    <div className="space-y-8">
      <SectionHeader title="Financial Overview" icon={<BarChart3 size={22} />} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5">
        {summaryCards.map(card => (
          <div key={card.label} className="rounded-xl p-5 relative overflow-hidden" style={{ background: '#FFFFFF', borderTop: `5px solid ${card.color}`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
            <CornerTriangle color={card.color} position="top-right" />
            <CornerTriangle color={card.color} position="bottom-left" />
            <div className="flex items-center gap-2 mb-3" style={{ color: card.color }}>{card.icon}</div>
            <p className="text-xs font-medium mb-1.5" style={{ color: COLORS.goldDark }}>{card.label}</p>
            <p className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Donut Chart */}
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#FFFFFF', border: `2px solid ${COLORS.gold}25`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
        <CornerTriangle color={COLORS.gold} position="top-left" />
        <CornerTriangle color={COLORS.terra} position="bottom-right" />
        <h3 className="text-lg font-bold mb-5" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>Expense Distribution</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-full sm:w-1/2" style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke={COLORS.cream}
                  strokeWidth={2}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatKES(value)}
                  contentStyle={{ fontFamily: 'Source Sans 3, sans-serif', fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.gold}`, background: COLORS.cream }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full sm:w-1/2 space-y-2">
            {donutData.map((item, i) => (
              <div key={item.name} className="flex items-center justify-between text-xs py-1.5" style={{ borderBottom: `1px dashed ${COLORS.gold}25` }}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-semibold" style={{ color: COLORS.primary }}>{formatKES(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: `2px solid ${COLORS.gold}25`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
        <div className="p-5 pb-3" style={{ background: '#FFFFFF' }}>
          <h3 className="text-lg font-bold" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>Expense Breakdown</h3>
        </div>
        <AnkaraStrip height={3} />
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: COLORS.primary, color: COLORS.gold }}>
              <th className="text-left py-3 px-5 font-semibold" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Item</th>
              <th className="text-left py-3 px-5 font-semibold" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Category</th>
              <th className="text-right py-3 px-5 font-semibold" style={{ fontFamily: 'Source Sans 3, sans-serif' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: expenseBreakdown.rent.label, cat: 'Rent', amount: expenseBreakdown.rent.amount },
              { name: expenseBreakdown.food.label, cat: 'Food', amount: expenseBreakdown.food.amount },
              { name: expenseBreakdown.transport.label, cat: 'Transport', amount: expenseBreakdown.transport.amount },
              ...expenseBreakdown.custom.map(c => ({ name: c.name, cat: c.category, amount: c.amount })),
            ].map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#FFFFFF' : COLORS.bgAlt, borderBottom: `1px solid ${COLORS.gold}15` }}>
                <td className="py-3 px-5 font-medium">{row.name}</td>
                <td className="py-3 px-5 capitalize" style={{ color: COLORS.goldDark }}>{row.cat}</td>
                <td className="py-3 px-5 text-right font-semibold" style={{ color: COLORS.primary }}>{formatKES(row.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: COLORS.primary, color: COLORS.cream }}>
              <td className="py-3 px-5 font-bold" style={{ fontFamily: 'Fraunces, serif' }} colSpan={2}>Total</td>
              <td className="py-3 px-5 text-right font-bold" style={{ fontFamily: 'Fraunces, serif' }}>{formatKES(dashboardSummary.totalExpenses)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Nearby food spots */}
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#FFFFFF', borderTop: `4px solid ${COLORS.orange}`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
        <CornerTriangle color={COLORS.orange} position="top-right" />
        <h3 className="font-bold text-sm mb-4" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>
          <Utensils size={14} className="inline mr-2" style={{ color: COLORS.orange }} />
          Nearby Lunch Spots ({foodDetails.area})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {foodDetails.nearbyRestaurants.map(r => (
            <div key={r.name} className="rounded-lg px-4 py-3 text-xs" style={{ background: COLORS.bgAlt, border: `1px solid ${COLORS.gold}20` }}>
              <p className="font-semibold truncate" style={{ color: COLORS.primary }}>{r.name}</p>
              <p className="mt-0.5" style={{ color: COLORS.goldDark }}>Avg: {formatKES(r.avgMeal)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// GROWTH TAB
// ============================================================
function GrowthTab() {
  const milestones = [
    { year: 'Year 3', salary: formatKES(growthProjections.year3.salary), takeHome: formatKES(growthProjections.year3.takeHome), color: COLORS.gold },
    { year: 'Year 5', salary: formatKES(growthProjections.year5.salary), takeHome: formatKES(growthProjections.year5.takeHome), color: COLORS.terra },
    { year: 'Year 7', salary: formatKES(growthProjections.year7.salary), takeHome: formatKES(growthProjections.year7.takeHome), color: COLORS.teal },
    { year: 'Year 10', salary: formatKES(growthProjections.year10.salary), takeHome: formatKES(growthProjections.year10.takeHome), color: COLORS.orange },
  ]

  return (
    <div className="space-y-8">
      <SectionHeader title="Salary Growth Projections" icon={<TrendingUp size={22} />} />

      {/* Current snapshot */}
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: COLORS.primary, boxShadow: '0 4px 20px rgba(60,21,24,0.15)' }}>
        <CornerTriangle color={COLORS.gold} position="top-left" />
        <CornerTriangle color={COLORS.gold} position="bottom-right" />
        <div className="flex items-center gap-3 mb-4">
          <Wallet size={24} style={{ color: COLORS.gold }} />
          <p className="text-sm font-medium" style={{ color: COLORS.gold }}>Current Salary</p>
        </div>
        <p className="text-3xl font-bold mb-1" style={{ fontFamily: 'Fraunces, serif', color: COLORS.cream }}>
          {formatKES(growthProjections.current.salary)}
        </p>
        <p className="text-sm" style={{ color: COLORS.gold }}>
          Take-home: {formatKES(growthProjections.current.takeHome)} / month
        </p>
      </div>

      {/* Area Chart */}
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#FFFFFF', border: `2px solid ${COLORS.gold}25`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
        <CornerTriangle color={COLORS.terra} position="top-left" />
        <CornerTriangle color={COLORS.teal} position="bottom-right" />
        <h3 className="text-lg font-bold mb-5" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>10-Year Projection</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthChartData}>
              <defs>
                <linearGradient id="ankaraGoldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.5} />
                  <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="ankaraTerraGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.terra} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={COLORS.terra} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="ankaraTealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.teal} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gold}30`} />
              <XAxis
                dataKey="year"
                tick={{ fill: COLORS.text, fontSize: 12, fontFamily: 'Source Sans 3' }}
                tickFormatter={(v: number) => `Yr ${v}`}
                stroke={COLORS.gold}
              />
              <YAxis
                tick={{ fill: COLORS.text, fontSize: 11, fontFamily: 'Source Sans 3' }}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                stroke={COLORS.gold}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatKES(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                contentStyle={{ fontFamily: 'Source Sans 3, sans-serif', fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.gold}`, background: COLORS.cream }}
              />
              <Area type="monotone" dataKey="salary" name="Salary" stroke={COLORS.gold} fill="url(#ankaraGoldGrad)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="takeHome" name="Take Home" stroke={COLORS.terra} fill="url(#ankaraTerraGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke={COLORS.teal} fill="url(#ankaraTealGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          {[
            { label: 'Salary', color: COLORS.gold },
            { label: 'Take Home', color: COLORS.terra },
            { label: 'Expenses', color: COLORS.teal },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs font-medium">
              <span className="w-3 h-3 rounded-full" style={{ background: l.color }} />
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone Cards */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5">
        {milestones.map(m => (
          <div key={m.year} className="rounded-xl p-5 relative overflow-hidden" style={{ background: '#FFFFFF', borderTop: `5px solid ${m.color}`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
            <CornerTriangle color={m.color} position="top-right" />
            <CornerTriangle color={m.color} position="bottom-left" />
            <p className="text-xs font-semibold mb-2.5" style={{ color: m.color, fontFamily: 'Source Sans 3, sans-serif' }}>{m.year}</p>
            <p className="text-base sm:text-lg font-bold" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>{m.salary}</p>
            <p className="text-xs mt-1" style={{ color: COLORS.goldDark }}>Take-home: {m.takeHome}</p>
          </div>
        ))}
      </div>

      {/* Assumptions */}
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#FFFFFF', border: `2px solid ${COLORS.teal}20`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
        <CornerTriangle color={COLORS.teal} position="top-left" />
        <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>Growth Assumptions</h3>
        <DiamondStrip className="mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Salary Growth', value: `${growthAssumptions.salaryGrowthRate}% p.a.` },
            { label: 'Rent Inflation', value: `${growthAssumptions.rentInflation}% p.a.` },
            { label: 'Food Inflation', value: `${growthAssumptions.foodInflation}% p.a.` },
            { label: 'Transport Inflation', value: `${growthAssumptions.transportInflation}% p.a.` },
          ].map(a => (
            <div key={a.label} className="flex justify-between text-xs py-2" style={{ borderBottom: `1px dashed ${COLORS.gold}30` }}>
              <span style={{ color: COLORS.goldDark }}>{a.label}</span>
              <span className="font-semibold" style={{ color: COLORS.primary }}>{a.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// COMPARISON TAB
// ============================================================
function ComparisonTab() {
  const verdictColorMap: Record<string, string> = {
    slightly_below: COLORS.orange,
    below: COLORS.terra,
    above: COLORS.teal,
    at_market: COLORS.gold,
  }
  const verdictColor = verdictColorMap[salaryComparison.verdict] || COLORS.gold

  // Bell curve data
  const bellData = salaryDistributionData.map(d => ({
    ...d,
    salaryLabel: `${(d.salary / 1000).toFixed(0)}K`,
  }))

  return (
    <div className="space-y-8">
      <SectionHeader title="Market Comparison" icon={<Users size={22} />} />

      {/* Verdict Card — decorative framed */}
      <div className="rounded-xl relative overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 6px 24px rgba(60,21,24,0.1)' }}>
        <AnkaraStrip height={5} />
        <div className="p-8 text-center relative">
          <ConcentricCircle x="calc(50% - 60px)" y="-20px" size={120} opacity={0.06} />
          <p className="text-sm font-medium mb-1" style={{ color: COLORS.goldDark, fontFamily: 'Source Sans 3, sans-serif' }}>Your Position</p>
          <p className="text-4xl sm:text-5xl font-black mb-2" style={{ fontFamily: 'Fraunces, serif', color: verdictColor }}>
            {salaryComparison.percentile}<sup className="text-lg">th</sup>
          </p>
          <p className="text-sm font-medium mb-3" style={{ color: COLORS.text }}>percentile</p>
          <div className="inline-block rounded-full px-5 py-2" style={{ background: `${verdictColor}15`, border: `2px solid ${verdictColor}40` }}>
            <p className="text-sm font-bold" style={{ color: verdictColor, fontFamily: 'Source Sans 3, sans-serif' }}>
              {salaryComparison.verdictText}
            </p>
          </div>
        </div>
        <AnkaraStrip height={5} />
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-4 sm:gap-5">
        {[
          { label: 'Your Salary', value: formatKES(salaryComparison.userSalary), color: COLORS.terra },
          { label: 'Market Median', value: formatKES(salaryComparison.marketMedian), color: COLORS.gold },
          { label: '25th Percentile', value: formatKES(salaryComparison.p25), color: COLORS.tealLight },
          { label: '75th Percentile', value: formatKES(salaryComparison.p75), color: COLORS.orange },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-5 relative overflow-hidden" style={{ background: '#FFFFFF', borderTop: `5px solid ${s.color}`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
            <CornerTriangle color={s.color} position="top-right" />
            <p className="text-xs font-medium mb-1.5" style={{ color: COLORS.goldDark }}>{s.label}</p>
            <p className="text-base sm:text-lg font-bold" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bell Curve */}
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#FFFFFF', border: `2px solid ${COLORS.gold}25`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
        <CornerTriangle color={COLORS.teal} position="top-left" />
        <CornerTriangle color={COLORS.gold} position="bottom-right" />
        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>Salary Distribution</h3>
        <p className="text-xs mb-4" style={{ color: COLORS.goldDark }}>
          {salaryComparison.role} &bull; {salaryComparison.location} &bull; {salaryComparison.experienceBand}
        </p>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bellData}>
              <defs>
                <linearGradient id="ankaraBellGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gold}25`} />
              <XAxis
                dataKey="salaryLabel"
                tick={{ fill: COLORS.text, fontSize: 10, fontFamily: 'Source Sans 3' }}
                stroke={COLORS.gold}
                interval={2}
              />
              <YAxis
                tick={{ fill: COLORS.text, fontSize: 11, fontFamily: 'Source Sans 3' }}
                stroke={COLORS.gold}
                label={{ value: 'Professionals', angle: -90, position: 'insideLeft', style: { fill: COLORS.goldDark, fontSize: 11 } }}
              />
              <Tooltip
                formatter={(value: number, _name: string, props: { payload: { salary: number } }) => [
                  `${value} professionals`,
                  `Salary: ${formatKES(props.payload.salary)}`
                ]}
                contentStyle={{ fontFamily: 'Source Sans 3, sans-serif', fontSize: 12, borderRadius: 8, border: `1px solid ${COLORS.gold}`, background: COLORS.cream }}
              />
              <Area type="monotone" dataKey="frequency" stroke={COLORS.teal} fill="url(#ankaraBellGrad)" strokeWidth={2.5} />
              {/* User salary reference line approximation using another line */}
              <Line
                data={[
                  { salaryLabel: '120K', frequency: 0 },
                  { salaryLabel: '120K', frequency: 95 },
                ]}
                dataKey="frequency"
                stroke={COLORS.terra}
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
                legendType="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {/* You indicator */}
        <div className="flex items-center justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: COLORS.teal }} />
            <span>Market Distribution</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-0.5" style={{ background: COLORS.terra, borderTop: `2px dashed ${COLORS.terra}` }} />
            <span style={{ color: COLORS.terra, fontWeight: 600 }}>You ({formatKES(salaryComparison.userSalary)})</span>
          </div>
        </div>
      </div>

      {/* Context info */}
      <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: '#FFFFFF', border: `2px solid ${COLORS.teal}20`, boxShadow: '0 4px 16px rgba(60,21,24,0.06)' }}>
        <CornerTriangle color={COLORS.teal} position="top-left" />
        <CornerTriangle color={COLORS.orange} position="bottom-right" />
        <h3 className="font-bold text-sm mb-3" style={{ fontFamily: 'Fraunces, serif', color: COLORS.primary }}>Comparison Context</h3>
        <DiamondStrip className="mb-4" />
        <div className="space-y-2.5">
          {[
            { label: 'Role', value: salaryComparison.role },
            { label: 'Location', value: salaryComparison.location },
            { label: 'Experience', value: salaryComparison.experienceBand },
            { label: 'Sample Size', value: `${salaryComparison.sampleSize} professionals` },
            { label: 'Confidence', value: salaryComparison.confidence.charAt(0).toUpperCase() + salaryComparison.confidence.slice(1) },
            { label: 'Last Updated', value: salaryComparison.lastUpdated },
          ].map(item => (
            <div key={item.label} className="flex justify-between text-sm py-2" style={{ borderBottom: `1px dashed ${COLORS.gold}25` }}>
              <span style={{ color: COLORS.goldDark }}>{item.label}</span>
              <span className="font-semibold" style={{ color: COLORS.primary }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Market mean card */}
      <div className="rounded-xl p-6 relative overflow-hidden text-center" style={{ background: COLORS.primary, boxShadow: '0 4px 20px rgba(60,21,24,0.15)' }}>
        <CornerTriangle color={COLORS.gold} position="top-left" />
        <CornerTriangle color={COLORS.gold} position="top-right" />
        <p className="text-xs mb-2" style={{ color: COLORS.gold }}>Market Average (Mean)</p>
        <p className="text-2xl font-bold" style={{ fontFamily: 'Fraunces, serif', color: COLORS.cream }}>{formatKES(salaryComparison.marketMean)}</p>
        <p className="text-xs mt-2" style={{ color: COLORS.gold }}>Based on {salaryComparison.sampleSize} data points</p>
      </div>
    </div>
  )
}
