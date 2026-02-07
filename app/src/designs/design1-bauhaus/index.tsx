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
  Wallet, Receipt, PiggyBank, Building2
} from 'lucide-react'

// ============================================================
// DESIGN 1 — BAUHAUS BLUEPRINT
// Geometric, constructivist, primary colors on white
// Mondrian-inspired color blocking
// ============================================================

const BAUHAUS = {
  red: '#E63946',
  blue: '#1D3557',
  yellow: '#F4D35E',
  white: '#FEFAE0',
  black: '#0D1B2A',
} as const

const CHART_COLORS = [
  BAUHAUS.red, BAUHAUS.blue, BAUHAUS.yellow, '#457B9D',
  '#A8DADC', '#E76F51', '#264653', '#2A9D8F',
  '#F4A261', '#E9C46A', '#606C38', '#BC6C25', '#DDA15E',
]

type TabKey = 'input' | 'dashboard' | 'growth' | 'comparison'

const TABS: { key: TabKey; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'input', label: 'Input', icon: <User size={18} />, color: BAUHAUS.blue },
  { key: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} />, color: BAUHAUS.red },
  { key: 'growth', label: 'Growth', icon: <TrendingUp size={18} />, color: BAUHAUS.yellow },
  { key: 'comparison', label: 'Compare', icon: <Users size={18} />, color: BAUHAUS.blue },
]

// ── Geometric decorative block ──────────────────────────────
function GeometricCorner({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const posStyles: Record<string, React.CSSProperties> = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, right: 0 },
    bl: { bottom: 0, left: 0 },
    br: { bottom: 0, right: 0 },
  }
  return (
    <div style={{ position: 'absolute', ...posStyles[position], pointerEvents: 'none', zIndex: 0 }}>
      <div style={{
        width: 48, height: 48, display: 'grid',
        gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 2,
      }}>
        <div style={{ background: BAUHAUS.red, opacity: 0.15 }} />
        <div style={{ background: 'transparent' }} />
        <div style={{ background: 'transparent' }} />
        <div style={{ background: BAUHAUS.blue, opacity: 0.12 }} />
      </div>
    </div>
  )
}

// ── Thick Mondrian divider line ─────────────────────────────
function MondrianDivider({ color = BAUHAUS.black }: { color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '20px 0' }}>
      <div style={{ width: 18, height: 4, background: BAUHAUS.red }} />
      <div style={{ flex: 1, height: 2, background: color, opacity: 0.18 }} />
      <div style={{ width: 10, height: 10, background: BAUHAUS.yellow, opacity: 0.6 }} />
    </div>
  )
}

// ── Summary stat card ───────────────────────────────────────
function StatCard({ label, value, accent, icon }: {
  label: string; value: string; accent: string; icon: React.ReactNode
}) {
  return (
    <div
      style={{
        background: '#fff', borderLeft: `4px solid ${accent}`,
        padding: '18px 16px', position: 'relative', overflow: 'hidden',
        boxShadow: '2px 2px 0px rgba(0,0,0,0.06)',
      }}
    >
      <GeometricCorner position="br" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: accent, color: '#fff', fontSize: 14,
        }}>
          {icon}
        </div>
        <span style={{
          fontFamily: '"DM Sans", sans-serif', fontSize: 12, fontWeight: 500,
          color: BAUHAUS.black, opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1.2,
        }}>
          {label}
        </span>
      </div>
      <div style={{
        fontFamily: '"Syne", sans-serif', fontSize: 22, fontWeight: 700,
        color: BAUHAUS.black, position: 'relative', zIndex: 1,
      }}>
        {value}
      </div>
    </div>
  )
}

// ── Milestone card for growth tab ───────────────────────────
function MilestoneCard({ year, salary, takeHome, expenses, tax, accent }: {
  year: number; salary: number; takeHome: number; expenses: number; tax: number; accent: string
}) {
  return (
    <div style={{
      background: '#fff', borderTop: `5px solid ${accent}`, padding: '20px 16px',
      position: 'relative', overflow: 'hidden',
      boxShadow: '2px 2px 0px rgba(0,0,0,0.06)',
    }}>
      <GeometricCorner position="tr" />
      <div style={{
        fontFamily: '"Syne", sans-serif', fontSize: 28, fontWeight: 800,
        color: accent, marginBottom: 4,
      }}>
        Year {year}
      </div>
      <div style={{
        fontFamily: '"Syne", sans-serif', fontSize: 16, fontWeight: 700,
        color: BAUHAUS.black, marginBottom: 12,
      }}>
        {formatKES(salary)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Take-Home', val: takeHome },
          { label: 'Expenses', val: expenses },
          { label: 'Taxes', val: tax },
          { label: 'Savings', val: takeHome - expenses },
        ].map((item) => (
          <div key={item.label}>
            <div style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: 10,
              textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5, marginBottom: 2,
            }}>
              {item.label}
            </div>
            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, fontWeight: 600, color: BAUHAUS.black }}>
              {formatKES(item.val)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function Design1Bauhaus() {
  const [activeTab, setActiveTab] = useState<TabKey>('input')
  const navigate = useNavigate()

  // ── Custom tooltip for Recharts ───────────────────────────
  const BauhausTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{
        background: BAUHAUS.black, color: BAUHAUS.white, padding: '10px 14px',
        fontFamily: '"DM Sans", sans-serif', fontSize: 12, border: `2px solid ${BAUHAUS.red}`,
      }}>
        {label !== undefined && (
          <div style={{ fontWeight: 700, marginBottom: 4, fontFamily: '"Syne", sans-serif' }}>{label}</div>
        )}
        {payload.map((entry: any, i: number) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 8, height: 8, background: entry.color || BAUHAUS.red }} />
            <span>{entry.name}: {formatKES(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  // ── Pie chart custom label ────────────────────────────────
  const renderPieLabel = ({ name, percent }: any) =>
    `${name} ${(percent * 100).toFixed(0)}%`

  // ════════════════════════════════════════════════════════════
  // TAB: INPUT
  // ════════════════════════════════════════════════════════════
  const renderInput = () => (
    <div style={{ display: 'grid', gap: 28 }}>
      {/* Hero header block */}
      <div style={{
        display: 'grid', gridTemplateColumns: '8px 1fr', gap: 0,
      }}>
        <div style={{ background: BAUHAUS.red }} />
        <div style={{
          background: BAUHAUS.blue, padding: '28px 24px', color: BAUHAUS.white,
        }}>
          <h2 style={{
            fontFamily: '"Syne", sans-serif', fontSize: 26, fontWeight: 800,
            margin: 0, lineHeight: 1.15,
          }}>
            Salary Profile
          </h2>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: 14, opacity: 0.75,
            margin: '6px 0 0',
          }}>
            Enter your employment details to calculate a comprehensive budget breakdown.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div style={{
        background: '#fff', padding: '28px 24px', position: 'relative',
        borderLeft: `4px solid ${BAUHAUS.yellow}`,
        boxShadow: '3px 3px 0px rgba(0,0,0,0.06)',
      }}>
        <GeometricCorner position="tr" />
        <div style={{ display: 'grid', gap: 22, position: 'relative', zIndex: 1 }}>
          {/* Personal info section */}
          <div>
            <div style={{
              fontFamily: '"Syne", sans-serif', fontSize: 14, fontWeight: 700,
              color: BAUHAUS.red, textTransform: 'uppercase', letterSpacing: 2,
              marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 12, height: 12, background: BAUHAUS.red }} />
              Personal Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FormField label="Full Name" value={userData.name} />
              <FormField label="Years of Experience" value={String(userData.yearsOfExperience)} />
            </div>
          </div>

          <MondrianDivider />

          {/* Employment section */}
          <div>
            <div style={{
              fontFamily: '"Syne", sans-serif', fontSize: 14, fontWeight: 700,
              color: BAUHAUS.blue, textTransform: 'uppercase', letterSpacing: 2,
              marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 12, height: 12, background: BAUHAUS.blue }} />
              Employment
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FormField label="Company" value={userData.company} />
              <FormField label="Office Location" value={userData.companyLocation} />
            </div>
          </div>

          <MondrianDivider />

          {/* Living & salary section */}
          <div>
            <div style={{
              fontFamily: '"Syne", sans-serif', fontSize: 14, fontWeight: 700,
              color: '#457B9D', textTransform: 'uppercase', letterSpacing: 2,
              marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 12, height: 12, background: '#457B9D' }} />
              Living & Salary
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <FormField label="Residential Area" value={userData.residentialArea} />
              <FormField label="Monthly Salary (KES)" value={userData.monthlySalary.toLocaleString('en-KE')} highlight />
            </div>
          </div>
        </div>
      </div>

      {/* Travel & rent info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          background: '#fff', borderTop: `4px solid ${BAUHAUS.red}`,
          padding: '20px 16px', boxShadow: '2px 2px 0px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            fontFamily: '"Syne", sans-serif', fontSize: 14, fontWeight: 700,
            color: BAUHAUS.black, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Building2 size={16} /> Commute Info
          </div>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, lineHeight: 1.7, color: BAUHAUS.black }}>
            <div><strong>Route:</strong> {travelDetails.origin} &rarr; {travelDetails.destination}</div>
            <div><strong>Distance:</strong> {travelDetails.distance}</div>
            <div><strong>Duration:</strong> {travelDetails.duration}</div>
            <div style={{ marginTop: 8 }}>
              {travelDetails.modes.map((m) => (
                <div key={m.mode} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '2px 0' }}>
                  <span>{m.mode}</span>
                  <span style={{ fontWeight: 600 }}>{formatKES(m.monthly)}/mo</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: '#fff', borderTop: `4px solid ${BAUHAUS.blue}`,
          padding: '20px 16px', boxShadow: '2px 2px 0px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            fontFamily: '"Syne", sans-serif', fontSize: 14, fontWeight: 700,
            color: BAUHAUS.black, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Home size={16} /> Rent in {rentDetails.area}
          </div>
          <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, lineHeight: 1.7, color: BAUHAUS.black }}>
            <div><strong>Zone:</strong> {rentDetails.zone}</div>
            <div style={{ marginTop: 8 }}>
              {rentDetails.options.map((o) => (
                <div key={o.type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '3px 0', borderBottom: '1px solid #eee' }}>
                  <span>{o.type}</span>
                  <span style={{ fontWeight: 600 }}>{formatKES(o.median)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 10, opacity: 0.5 }}>
              Updated: {rentDetails.lastUpdated}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════
  // TAB: DASHBOARD
  // ════════════════════════════════════════════════════════════
  const renderDashboard = () => {
    const allExpenses = [
      { name: expenseBreakdown.rent.label, amount: expenseBreakdown.rent.amount },
      { name: expenseBreakdown.food.label, amount: expenseBreakdown.food.amount },
      { name: expenseBreakdown.transport.label, amount: expenseBreakdown.transport.amount },
      ...expenseBreakdown.custom.map((c) => ({ name: c.name, amount: c.amount })),
    ]

    return (
      <div style={{ display: 'grid', gap: 24 }}>
        {/* Summary stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <StatCard label="Gross Salary" value={formatKES(dashboardSummary.grossSalary)} accent={BAUHAUS.blue} icon={<Wallet size={16} />} />
          <StatCard label="Deductions" value={formatKES(dashboardSummary.totalDeductions)} accent={BAUHAUS.red} icon={<Receipt size={16} />} />
          <StatCard label="Expenses" value={formatKES(dashboardSummary.totalExpenses)} accent={BAUHAUS.yellow} icon={<BarChart3 size={16} />} />
          <StatCard label="Take-Home" value={formatKES(dashboardSummary.takeHome)} accent="#2A9D8F" icon={<PiggyBank size={16} />} />
        </div>

        {/* Pie chart section */}
        <div style={{
          background: '#fff', padding: '24px 16px', position: 'relative',
          borderLeft: `4px solid ${BAUHAUS.red}`,
          boxShadow: '3px 3px 0px rgba(0,0,0,0.06)',
        }}>
          <GeometricCorner position="tr" />
          <h3 style={{
            fontFamily: '"Syne", sans-serif', fontSize: 18, fontWeight: 700,
            color: BAUHAUS.black, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 14, height: 14, background: BAUHAUS.red }} />
            Expense Distribution
          </h3>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, opacity: 0.5, margin: '0 0 16px' }}>
            Monthly breakdown of taxes, deductions, and living costs
          </p>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke={BAUHAUS.black}
                  strokeWidth={1}
                >
                  {expenseChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<BauhausTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginTop: 12,
          }}>
            {expenseChartData.map((item, i) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: '"DM Sans", sans-serif' }}>
                <div style={{ width: 10, height: 10, background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tax breakdown */}
        <div style={{
          background: '#fff', padding: '24px 16px',
          borderLeft: `4px solid ${BAUHAUS.blue}`,
          boxShadow: '3px 3px 0px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{
            fontFamily: '"Syne", sans-serif', fontSize: 18, fontWeight: 700,
            color: BAUHAUS.black, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 14, height: 14, background: BAUHAUS.blue }} />
            Tax & Deductions
          </h3>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, opacity: 0.5, margin: '0 0 16px' }}>
            Statutory deductions as per KRA regulations
          </p>
          <div style={{ display: 'grid', gap: 0 }}>
            {[
              { label: 'PAYE', value: taxBreakdown.paye, accent: BAUHAUS.red },
              { label: 'NSSF', value: taxBreakdown.nssf, accent: BAUHAUS.blue },
              { label: 'SHIF', value: taxBreakdown.shif, accent: BAUHAUS.yellow },
              { label: 'Housing Levy', value: taxBreakdown.housingLevy, accent: '#457B9D' },
              { label: 'Personal Relief', value: -taxBreakdown.personalRelief, accent: '#2A9D8F' },
            ].map((item, i) => (
              <div
                key={item.label}
                style={{
                  display: 'grid', gridTemplateColumns: '4px 1fr auto',
                  borderBottom: i < 4 ? '1px solid #eee' : 'none',
                }}
              >
                <div style={{ background: item.accent }} />
                <div style={{ padding: '12px 14px', fontFamily: '"DM Sans", sans-serif', fontSize: 14, color: BAUHAUS.black }}>
                  {item.label}
                </div>
                <div style={{
                  padding: '12px 14px', fontFamily: '"Syne", sans-serif', fontSize: 14,
                  fontWeight: 700, color: item.value < 0 ? '#2A9D8F' : BAUHAUS.red,
                  textAlign: 'right',
                }}>
                  {item.value < 0 ? `- ${formatKES(Math.abs(item.value))}` : formatKES(item.value)}
                </div>
              </div>
            ))}
            {/* Total row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '4px 1fr auto',
              background: BAUHAUS.black, color: BAUHAUS.white, marginTop: 4,
            }}>
              <div style={{ background: BAUHAUS.red }} />
              <div style={{ padding: '14px 14px', fontFamily: '"Syne", sans-serif', fontSize: 14, fontWeight: 700 }}>
                Net Deductions
              </div>
              <div style={{ padding: '14px 14px', fontFamily: '"Syne", sans-serif', fontSize: 14, fontWeight: 700, textAlign: 'right' }}>
                {formatKES(taxBreakdown.totalDeductions)}
              </div>
            </div>
          </div>
        </div>

        {/* Expense table */}
        <div style={{
          background: '#fff', padding: '24px 16px',
          borderLeft: `4px solid ${BAUHAUS.yellow}`,
          boxShadow: '3px 3px 0px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{
            fontFamily: '"Syne", sans-serif', fontSize: 18, fontWeight: 700,
            color: BAUHAUS.black, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 14, height: 14, background: BAUHAUS.yellow }} />
            Living Expenses
          </h3>
          <div style={{ display: 'grid', gap: 0 }}>
            {allExpenses.map((item, i) => (
              <div
                key={item.name}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr auto',
                  padding: '10px 0',
                  borderBottom: i < allExpenses.length - 1 ? '1px solid #eee' : 'none',
                  fontFamily: '"DM Sans", sans-serif', fontSize: 14,
                }}
              >
                <span style={{ color: BAUHAUS.black }}>{item.name}</span>
                <span style={{ fontWeight: 600, color: BAUHAUS.black }}>{formatKES(item.amount)}</span>
              </div>
            ))}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              padding: '14px 0 0', marginTop: 4,
              borderTop: `3px solid ${BAUHAUS.black}`,
              fontFamily: '"Syne", sans-serif', fontSize: 15, fontWeight: 700,
              color: BAUHAUS.black,
            }}>
              <span>Total Expenses</span>
              <span>{formatKES(dashboardSummary.totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════
  // TAB: GROWTH
  // ════════════════════════════════════════════════════════════
  const renderGrowth = () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Header block */}
      <div style={{
        display: 'grid', gridTemplateColumns: '6px 1fr 6px', gap: 0,
      }}>
        <div style={{ background: BAUHAUS.yellow }} />
        <div style={{ background: BAUHAUS.black, padding: '24px 20px', color: BAUHAUS.white }}>
          <h2 style={{
            fontFamily: '"Syne", sans-serif', fontSize: 24, fontWeight: 800, margin: 0,
          }}>
            10-Year Projection
          </h2>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: 13, opacity: 0.7, margin: '4px 0 0',
          }}>
            Salary growth trajectory based on industry averages and inflation estimates
          </p>
        </div>
        <div style={{ background: BAUHAUS.red }} />
      </div>

      {/* Growth line chart */}
      <div style={{
        background: '#fff', padding: '24px 16px',
        borderLeft: `4px solid ${BAUHAUS.yellow}`,
        boxShadow: '3px 3px 0px rgba(0,0,0,0.06)',
      }}>
        <h3 style={{
          fontFamily: '"Syne", sans-serif', fontSize: 16, fontWeight: 700,
          color: BAUHAUS.black, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 14, height: 14, background: BAUHAUS.yellow }} />
          Salary vs Take-Home vs Expenses
        </h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={growthChartData}>
              <CartesianGrid strokeDasharray="4 4" stroke="#ddd" />
              <XAxis
                dataKey="year"
                tick={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, fill: BAUHAUS.black }}
                tickFormatter={(v) => `Yr ${v}`}
              />
              <YAxis
                tick={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, fill: BAUHAUS.black }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<BauhausTooltip />} />
              <Line type="monotone" dataKey="salary" name="Gross Salary" stroke={BAUHAUS.blue} strokeWidth={3} dot={{ r: 3, fill: BAUHAUS.blue }} />
              <Line type="monotone" dataKey="takeHome" name="Take-Home" stroke="#2A9D8F" strokeWidth={3} dot={{ r: 3, fill: '#2A9D8F' }} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke={BAUHAUS.red} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: BAUHAUS.red }} />
              <Line type="monotone" dataKey="taxes" name="Taxes" stroke={BAUHAUS.yellow} strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: BAUHAUS.yellow }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 18, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Gross', color: BAUHAUS.blue },
            { label: 'Take-Home', color: '#2A9D8F' },
            { label: 'Expenses', color: BAUHAUS.red },
            { label: 'Taxes', color: BAUHAUS.yellow },
          ].map((l) => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: '"DM Sans", sans-serif', fontSize: 12 }}>
              <div style={{ width: 14, height: 3, background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      {/* Milestone cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <MilestoneCard
          year={3} salary={growthProjections.year3.salary}
          takeHome={growthProjections.year3.takeHome} expenses={growthProjections.year3.totalExpenses}
          tax={growthProjections.year3.totalTax} accent={BAUHAUS.blue}
        />
        <MilestoneCard
          year={5} salary={growthProjections.year5.salary}
          takeHome={growthProjections.year5.takeHome} expenses={growthProjections.year5.totalExpenses}
          tax={growthProjections.year5.totalTax} accent={BAUHAUS.red}
        />
        <MilestoneCard
          year={7} salary={growthProjections.year7.salary}
          takeHome={growthProjections.year7.takeHome} expenses={growthProjections.year7.totalExpenses}
          tax={growthProjections.year7.totalTax} accent={BAUHAUS.yellow}
        />
        <MilestoneCard
          year={10} salary={growthProjections.year10.salary}
          takeHome={growthProjections.year10.takeHome} expenses={growthProjections.year10.totalExpenses}
          tax={growthProjections.year10.totalTax} accent="#2A9D8F"
        />
      </div>

      {/* Assumptions card */}
      <div style={{
        background: '#fff', padding: '20px 16px',
        borderLeft: `4px solid ${BAUHAUS.blue}`,
        boxShadow: '2px 2px 0px rgba(0,0,0,0.06)',
      }}>
        <h3 style={{
          fontFamily: '"Syne", sans-serif', fontSize: 16, fontWeight: 700,
          color: BAUHAUS.black, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 14, height: 14, background: BAUHAUS.blue }} />
          Growth Assumptions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { label: 'Salary Growth', value: `${growthAssumptions.salaryGrowthRate}%`, accent: BAUHAUS.blue },
            { label: 'Rent Inflation', value: `${growthAssumptions.rentInflation}%`, accent: BAUHAUS.red },
            { label: 'Food Inflation', value: `${growthAssumptions.foodInflation}%`, accent: BAUHAUS.yellow },
            { label: 'Transport Inflation', value: `${growthAssumptions.transportInflation}%`, accent: '#457B9D' },
          ].map((a) => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: a.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: '"Syne", sans-serif', fontSize: 13, fontWeight: 700 }}>
                {a.value}
              </div>
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: BAUHAUS.black }}>
                {a.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontFamily: '"DM Sans", sans-serif', fontSize: 11, opacity: 0.45 }}>
          General CPI: {growthAssumptions.generalCPI}% per annum
        </div>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════
  // TAB: COMPARISON
  // ════════════════════════════════════════════════════════════
  const renderComparison = () => {
    const verdictColor = salaryComparison.verdict === 'above' ? '#2A9D8F'
      : salaryComparison.verdict === 'slightly_below' ? BAUHAUS.yellow
      : BAUHAUS.red

    return (
      <div style={{ display: 'grid', gap: 24 }}>
        {/* Verdict card */}
        <div style={{
          display: 'grid', gridTemplateColumns: '6px 1fr', gap: 0,
        }}>
          <div style={{ background: verdictColor }} />
          <div style={{
            background: BAUHAUS.black, padding: '28px 24px', color: BAUHAUS.white,
            position: 'relative', overflow: 'hidden',
          }}>
            <GeometricCorner position="tr" />
            <div style={{
              fontFamily: '"Syne", sans-serif', fontSize: 42, fontWeight: 800,
              color: verdictColor, lineHeight: 1,
            }}>
              P{salaryComparison.percentile}
            </div>
            <div style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: 15, marginTop: 8,
              opacity: 0.9,
            }}>
              {salaryComparison.verdictText}
            </div>
            <div style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: 12, marginTop: 10,
              opacity: 0.5, display: 'flex', gap: 16, flexWrap: 'wrap',
            }}>
              <span>Role: {salaryComparison.role}</span>
              <span>Location: {salaryComparison.location}</span>
              <span>Band: {salaryComparison.experienceBand}</span>
            </div>
          </div>
        </div>

        {/* Market stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <StatCard label="Your Salary" value={formatKES(salaryComparison.userSalary)} accent={BAUHAUS.blue} icon={<User size={16} />} />
          <StatCard label="Market Median" value={formatKES(salaryComparison.marketMedian)} accent={BAUHAUS.red} icon={<Users size={16} />} />
          <StatCard label="25th Percentile" value={formatKES(salaryComparison.p25)} accent={BAUHAUS.yellow} icon={<BarChart3 size={16} />} />
          <StatCard label="75th Percentile" value={formatKES(salaryComparison.p75)} accent="#457B9D" icon={<TrendingUp size={16} />} />
        </div>

        {/* Bell curve / distribution chart */}
        <div style={{
          background: '#fff', padding: '24px 16px',
          borderLeft: `4px solid ${BAUHAUS.red}`,
          boxShadow: '3px 3px 0px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{
            fontFamily: '"Syne", sans-serif', fontSize: 16, fontWeight: 700,
            color: BAUHAUS.black, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 14, height: 14, background: BAUHAUS.red }} />
            Salary Distribution
          </h3>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, opacity: 0.5, margin: '0 0 16px' }}>
            Based on {salaryComparison.sampleSize} responses &middot; Confidence: {salaryComparison.confidence}
          </p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={salaryDistributionData}>
                <CartesianGrid strokeDasharray="4 4" stroke="#ddd" />
                <XAxis
                  dataKey="salary"
                  tick={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, fill: BAUHAUS.black }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <YAxis
                  tick={{ fontFamily: '"DM Sans", sans-serif', fontSize: 10, fill: BAUHAUS.black }}
                  label={{ value: 'Frequency', angle: -90, position: 'insideLeft', style: { fontFamily: '"DM Sans", sans-serif', fontSize: 11, fill: BAUHAUS.black } }}
                />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div style={{
                      background: BAUHAUS.black, color: BAUHAUS.white, padding: '10px 14px',
                      fontFamily: '"DM Sans", sans-serif', fontSize: 12, border: `2px solid ${BAUHAUS.red}`,
                    }}>
                      <div style={{ fontWeight: 700, fontFamily: '"Syne", sans-serif' }}>{formatKES(d.salary)}</div>
                      <div>{d.frequency} respondents</div>
                    </div>
                  )
                }} />
                <defs>
                  <linearGradient id="bauhausGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BAUHAUS.blue} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={BAUHAUS.blue} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone" dataKey="frequency" name="Respondents"
                  stroke={BAUHAUS.blue} strokeWidth={2.5} fill="url(#bauhausGrad)"
                />
                {/* User salary reference line via a second Area with single point won't work,
                    so we use the Tooltip to highlight and add a visual marker below */}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Visual percentile bar */}
          <div style={{ marginTop: 20 }}>
            <div style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: 12, fontWeight: 500,
              color: BAUHAUS.black, marginBottom: 6,
            }}>
              Your position in the market
            </div>
            <div style={{ position: 'relative', height: 28, background: '#f0f0f0' }}>
              {/* Colored segments */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '25%', height: '100%', background: BAUHAUS.red, opacity: 0.25 }} />
              <div style={{ position: 'absolute', top: 0, left: '25%', width: '25%', height: '100%', background: BAUHAUS.yellow, opacity: 0.25 }} />
              <div style={{ position: 'absolute', top: 0, left: '50%', width: '25%', height: '100%', background: BAUHAUS.blue, opacity: 0.2 }} />
              <div style={{ position: 'absolute', top: 0, left: '75%', width: '25%', height: '100%', background: '#2A9D8F', opacity: 0.2 }} />
              {/* User marker */}
              <div style={{
                position: 'absolute', top: -4, left: `${salaryComparison.percentile}%`,
                transform: 'translateX(-50%)',
                width: 4, height: 36, background: BAUHAUS.red,
              }} />
              <div style={{
                position: 'absolute', top: -20,
                left: `${salaryComparison.percentile}%`, transform: 'translateX(-50%)',
                fontFamily: '"Syne", sans-serif', fontSize: 11, fontWeight: 700,
                color: BAUHAUS.red, whiteSpace: 'nowrap',
              }}>
                You (P{salaryComparison.percentile})
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: '"DM Sans", sans-serif', fontSize: 10, opacity: 0.5 }}>
              <span>{formatKES(salaryComparison.p25)}</span>
              <span>Median: {formatKES(salaryComparison.marketMedian)}</span>
              <span>{formatKES(salaryComparison.p75)}</span>
            </div>
          </div>
        </div>

        {/* Food details card */}
        <div style={{
          background: '#fff', padding: '20px 16px',
          borderLeft: `4px solid ${BAUHAUS.yellow}`,
          boxShadow: '2px 2px 0px rgba(0,0,0,0.06)',
        }}>
          <h3 style={{
            fontFamily: '"Syne", sans-serif', fontSize: 16, fontWeight: 700,
            color: BAUHAUS.black, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 14, height: 14, background: BAUHAUS.yellow }} />
            Nearby Eateries &middot; {foodDetails.area}
          </h3>
          <div style={{ display: 'grid', gap: 0 }}>
            {foodDetails.nearbyRestaurants.map((r, i) => (
              <div key={r.name} style={{
                display: 'grid', gridTemplateColumns: '1fr auto',
                padding: '8px 0',
                borderBottom: i < foodDetails.nearbyRestaurants.length - 1 ? '1px solid #eee' : 'none',
                fontFamily: '"DM Sans", sans-serif', fontSize: 13,
              }}>
                <span>{r.name}</span>
                <span style={{ fontWeight: 600 }}>avg {formatKES(r.avgMeal)}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontFamily: '"DM Sans", sans-serif', fontSize: 11, opacity: 0.4 }}>
            Estimated lunch budget: {formatKES(foodDetails.dailyCost)}/day &times; {foodDetails.workingDays} days = {formatKES(foodDetails.monthlyCost)}/month
          </div>
        </div>

        {/* Comparison metadata */}
        <div style={{
          fontFamily: '"DM Sans", sans-serif', fontSize: 11, opacity: 0.4,
          textAlign: 'center', padding: '0 16px',
        }}>
          Data from {salaryComparison.sampleSize} respondents &middot; Last updated: {salaryComparison.lastUpdated}
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <div style={{
        minHeight: '100vh', background: BAUHAUS.white,
        fontFamily: '"DM Sans", sans-serif', color: BAUHAUS.black,
      }}>
        {/* ── Top bar ──────────────────────────────────────────── */}
        <header style={{
          background: BAUHAUS.black, padding: '0', position: 'sticky', top: 0, zIndex: 50,
        }}>
          {/* Colored strip on top */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 3fr 1fr', height: 5 }}>
            <div style={{ background: BAUHAUS.red }} />
            <div style={{ background: BAUHAUS.yellow }} />
            <div style={{ background: BAUHAUS.blue }} />
            <div style={{ background: BAUHAUS.red }} />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px',
          }}>
            {/* Back button */}
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none', border: `2px solid ${BAUHAUS.white}`,
                color: BAUHAUS.white, display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', cursor: 'pointer',
                fontFamily: '"Syne", sans-serif', fontSize: 12, fontWeight: 700,
                letterSpacing: 1, textTransform: 'uppercase',
              }}
            >
              <ArrowLeft size={14} />
              Home
            </button>

            {/* Title */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: '"Syne", sans-serif', fontSize: 16, fontWeight: 800,
                color: BAUHAUS.white, letterSpacing: 1.5,
              }}>
                KAZI<span style={{ color: BAUHAUS.red }}>BUDGET</span>
              </div>
              <div style={{
                fontFamily: '"DM Sans", sans-serif', fontSize: 10, color: BAUHAUS.white,
                opacity: 0.5, letterSpacing: 0.5,
              }}>
                Bauhaus Blueprint
              </div>
            </div>
          </div>
        </header>

        {/* ── Tab navigation ───────────────────────────────────── */}
        <nav style={{
          background: '#fff', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          position: 'sticky', top: 57, zIndex: 40,
          borderBottom: `2px solid ${BAUHAUS.black}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: isActive ? tab.color : 'transparent',
                  color: isActive ? '#fff' : BAUHAUS.black,
                  border: 'none',
                  borderRight: `1px solid ${BAUHAUS.black}20`,
                  padding: '12px 0',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  fontFamily: '"Syne", sans-serif', fontSize: 11, fontWeight: isActive ? 700 : 500,
                  letterSpacing: 0.8, textTransform: 'uppercase',
                  transition: 'background 0.15s, color 0.15s',
                  position: 'relative',
                }}
              >
                {tab.icon}
                {tab.label}
                {/* Geometric active indicator */}
                {isActive && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 24, height: 3, background: BAUHAUS.yellow,
                  }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* ── Main content area ────────────────────────────────── */}
        <main style={{
          maxWidth: 720, margin: '0 auto', padding: '24px 16px 80px',
        }}>
          {activeTab === 'input' && renderInput()}
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'growth' && renderGrowth()}
          {activeTab === 'comparison' && renderComparison()}
        </main>

        {/* ── Footer strip ─────────────────────────────────────── */}
        <footer style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 30 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 1fr', height: 4 }}>
            <div style={{ background: BAUHAUS.blue }} />
            <div style={{ background: BAUHAUS.yellow }} />
            <div style={{ background: BAUHAUS.red }} />
            <div style={{ background: BAUHAUS.black }} />
          </div>
        </footer>
      </div>
    </>
  )
}

// ── Form field helper ─────────────────────────────────────────
function FormField({ label, value, highlight }: {
  label: string; value: string; highlight?: boolean
}) {
  return (
    <div>
      <label style={{
        display: 'block', fontFamily: '"DM Sans", sans-serif', fontSize: 11,
        fontWeight: 500, color: BAUHAUS.black, opacity: 0.55,
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
      }}>
        {label}
      </label>
      <div style={{
        padding: '10px 12px', background: highlight ? BAUHAUS.yellow + '18' : '#f8f8f4',
        border: `2px solid ${highlight ? BAUHAUS.yellow : BAUHAUS.black + '15'}`,
        fontFamily: '"DM Sans", sans-serif', fontSize: 15, fontWeight: highlight ? 700 : 500,
        color: BAUHAUS.black,
      }}>
        {value}
      </div>
    </div>
  )
}
