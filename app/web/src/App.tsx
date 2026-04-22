import { useEffect, useMemo, useRef, useState } from 'react'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { useUser, UserButton } from "@clerk/clerk-react"
import {
  userData, formatKES, growthAssumptions
} from './data/dummy'
import {
  Home, User, BarChart3, TrendingUp, Users,
  Zap, Star, AlertTriangle, ThumbsUp, ChevronRight
} from 'lucide-react'
import { calculateKenyanDeductions } from '@kazibudget/shared/lib/kenya-tax-calculator'
import { createBudgetFingerprint } from '@kazibudget/shared/lib/budget-fingerprint'
import { projectAll } from '@kazibudget/shared/lib/projections'
import { compareSalary } from '@kazibudget/shared/lib/salary-comparison'
import {
  estimateFood,
  estimateRent,
} from '@kazibudget/shared/lib/area-estimates'
import { useCommuteEstimate } from '@/hooks/use-commute-estimate'
import { useBudgetForm } from '@/hooks/use-budget-form'
import { useBudgetCalculation } from '@/hooks/use-budget-calculation'
import { useDebouncedRecalc } from '@/hooks/use-debounced-recalc'
import { useExpenseList } from '@/hooks/use-expense-list'
import { useSeedDefaultExpenses } from '@/hooks/use-seed-default-expenses'
import { useUserProfile } from '@/hooks/use-user-profile'
import { useFormAutosave } from '@/hooks/use-form-autosave'
import { ValidatedField } from '@/components/input/validated-field'
import { ExpenseRow } from '@/components/expenses/expense-row'
import { AddExpenseRow } from '@/components/expenses/add-expense-row'

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

export default function App() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState<TabKey>('input')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [showNavScroll, setShowNavScroll] = useState(true)
  const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
  const userDisplayName =
    fullName || user?.primaryEmailAddress?.emailAddress || userData.name
  const userCompanyMetadata = user?.unsafeMetadata?.["company"]
  const userCompany =
    typeof userCompanyMetadata === "string" && userCompanyMetadata.trim() !== ""
      ? userCompanyMetadata
      : userData.company

  const { form, errors, isValid, values, isShaking, triggerShake } =
    useBudgetForm({
      fullName: userDisplayName,
      company: userCompany,
      jobTitle: 'Software Engineer',
      workLocation: userData.companyLocation,
      homeArea: userData.residentialArea,
      grossSalary: userData.monthlySalary,
      experienceYears: userData.yearsOfExperience,
    })

  const [hasCalculated, setHasCalculated] = useState(false)
  const { calculate } = useBudgetCalculation()
  const expenseList = useExpenseList()
  useSeedDefaultExpenses(expenseList)

  const { profile, patch: patchProfile } = useUserProfile()
  const hydratedRef = useRef(false)

  const autosaveControls = useFormAutosave(values, patchProfile, {
    enabled: profile !== undefined,
  })

  useEffect(() => {
    if (hydratedRef.current) return
    if (profile === undefined) return
    if (profile === null) {
      autosaveControls.primeBaseline(form.getValues())
      hydratedRef.current = true
      return
    }
    const saved = {
      fullName: profile.fullName ?? form.getValues('fullName'),
      company: profile.company ?? form.getValues('company'),
      jobTitle: profile.jobTitle ?? form.getValues('jobTitle'),
      workLocation: profile.workLocation ?? form.getValues('workLocation'),
      homeArea: profile.homeArea ?? form.getValues('homeArea'),
      grossSalary: profile.grossSalary ?? form.getValues('grossSalary'),
      experienceYears:
        profile.experienceYears ?? form.getValues('experienceYears'),
    }
    form.reset(saved)
    autosaveControls.primeBaseline(saved)
    hydratedRef.current = true
  }, [profile, form, autosaveControls])

  const fingerprintInput = useMemo(
    () => ({
      grossSalary: Math.max(0, Number(values.grossSalary) || 0),
      workLocation: values.workLocation ?? '',
      homeArea: values.homeArea ?? '',
      expenseItems: expenseList.items.map((item) => ({
        name: item.name,
        amount: item.amount,
        category: item.category,
      })),
    }),
    [values.grossSalary, values.workLocation, values.homeArea, expenseList.items],
  )

  const currentFingerprint = useMemo(
    () => createBudgetFingerprint(fingerprintInput),
    [fingerprintInput],
  )

  const { isPending: isRecalculating } = useDebouncedRecalc(
    currentFingerprint,
    () => { void calculate(fingerprintInput) },
    { enabled: hasCalculated && isValid },
  )

  const liveTax = useMemo(
    () => calculateKenyanDeductions(fingerprintInput.grossSalary),
    [fingerprintInput.grossSalary],
  )

  const liveBudget = useMemo(() => {
    const gross = fingerprintInput.grossSalary
    const totalDeductions = liveTax.totalDeductions
    const totalExpenses = expenseList.items.reduce((sum, i) => sum + i.amount, 0)
    const takeHome = Math.max(0, liveTax.netSalary - totalExpenses)
    const savingsRate = gross > 0 ? (takeHome / gross) * 100 : 0

    const expenseChart = [
      { name: 'PAYE', value: liveTax.paye },
      { name: 'NSSF', value: liveTax.nssfTotal },
      { name: 'SHIF', value: liveTax.shif },
      { name: 'HOUSING LEVY', value: liveTax.housingLevy },
      ...expenseList.items.map((i) => ({ name: i.name.toUpperCase(), value: i.amount })),
    ].filter((x) => x.value > 0)

    return { gross, totalDeductions, totalExpenses, takeHome, savingsRate, expenseChart }
  }, [fingerprintInput.grossSalary, liveTax, expenseList.items])

  const liveProjections = useMemo(() => {
    const rent = expenseList.items.find((i) => i.category === 'rent')?.amount ?? 0
    const food = expenseList.items.find((i) => i.category === 'food')?.amount ?? 0
    const transport = expenseList.items.find((i) => i.category === 'transport')?.amount ?? 0
    const custom = expenseList.items
      .filter((i) => i.category === 'custom')
      .reduce((sum, i) => sum + i.amount, 0)

    const years = projectAll(
      {
        currentSalary: Math.max(0, fingerprintInput.grossSalary),
        currentRent: rent,
        currentFood: food,
        currentTransport: transport,
        currentCustomExpenses: custom,
        salaryGrowthRate: growthAssumptions.salaryGrowthRate / 100,
        rentInflationRate: growthAssumptions.rentInflation / 100,
        foodInflationRate: growthAssumptions.foodInflation / 100,
        transportInflationRate: growthAssumptions.transportInflation / 100,
        customInflationRate: growthAssumptions.generalCPI / 100,
        generalInflationRate: growthAssumptions.generalCPI / 100,
      },
      10,
    )

    const chart = years.map((y) => ({
      year: y.year,
      salary: Math.round(y.salary),
      takeHome: Math.round(y.takeHome),
      expenses: Math.round(y.totalExpenses),
      taxes: Math.round(y.totalTax),
    }))

    const byYear = (target: number) =>
      years.find((y) => y.year === target) ?? years[0]

    return {
      chart,
      current: byYear(0),
      year3: byYear(3),
      year5: byYear(5),
      year7: byYear(7),
      year10: byYear(10),
    }
  }, [fingerprintInput.grossSalary, expenseList.items])

  const liveComparison = useMemo(
    () =>
      compareSalary({
        userSalary: Math.max(0, fingerprintInput.grossSalary),
        jobTitle: values.jobTitle ?? '',
        experienceYears: Math.max(0, Number(values.experienceYears) || 0),
        workLocation: values.workLocation ?? '',
      }),
    [fingerprintInput.grossSalary, values.jobTitle, values.experienceYears, values.workLocation],
  )

  const liveCommute = useCommuteEstimate(
    values.homeArea ?? '',
    values.workLocation ?? '',
  )

  const setTransportToMode = async (mode: { mode: string; monthly: number }) => {
    const name = `Transport (${mode.mode})`
    const amount = mode.monthly
    const existing = expenseList.items.find(
      (i) => i.category === 'transport' || /transport|commute/i.test(i.name),
    )
    if (existing) {
      await expenseList.update(existing.id, { name, amount })
    } else {
      await expenseList.add({ name, amount, category: 'transport' })
    }
  }

  const liveRent = useMemo(
    () => estimateRent(values.homeArea ?? ''),
    [values.homeArea],
  )

  const liveFood = useMemo(
    () => estimateFood(values.workLocation ?? ''),
    [values.workLocation],
  )

  const inputBorderColor = (fieldError: string | undefined) =>
    fieldError ? COLORS.red : COLORS.black

  const handleCalculate = async () => {
    const ok = await form.trigger()
    if (!ok) {
      triggerShake()
      return
    }
    await calculate(fingerprintInput)
    setHasCalculated(true)
    setActiveTab('dashboard')
  }

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
            {([
              { name: 'fullName' as const, label: 'FULL NAME' },
              { name: 'company' as const, label: 'COMPANY' },
              { name: 'jobTitle' as const, label: 'JOB TITLE' },
              { name: 'workLocation' as const, label: 'WORK LOCATION' },
              { name: 'homeArea' as const, label: 'HOME AREA' },
            ]).map((field) => {
              const fieldError = errors[field.name]?.message
              const shouldShake = isShaking && Boolean(fieldError)
              return (
                <ValidatedField
                  key={field.name}
                  label={field.label}
                  error={fieldError}
                  shake={shouldShake}
                >
                  <input
                    type="text"
                    {...form.register(field.name)}
                    aria-invalid={Boolean(fieldError)}
                    className="w-full px-4 py-3 font-semibold text-sm outline-none"
                    style={{
                      border: `3px solid ${inputBorderColor(fieldError)}`,
                      backgroundColor: COLORS.white,
                      fontFamily: "'Work Sans', sans-serif",
                    }}
                  />
                </ValidatedField>
              )
            })}
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
            <ValidatedField
              label="GROSS SALARY (KES)"
              error={errors.grossSalary?.message}
              shake={isShaking && Boolean(errors.grossSalary)}
            >
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                {...form.register('grossSalary', { valueAsNumber: true })}
                aria-invalid={Boolean(errors.grossSalary)}
                className="w-full px-4 py-3 font-bold text-lg outline-none"
                style={{
                  border: `3px solid ${inputBorderColor(errors.grossSalary?.message)}`,
                  backgroundColor: COLORS.white,
                  fontFamily: "'Work Sans', sans-serif",
                }}
              />
            </ValidatedField>
            <ValidatedField
              label="EXPERIENCE (YEARS)"
              error={errors.experienceYears?.message}
              shake={isShaking && Boolean(errors.experienceYears)}
            >
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={50}
                step={1}
                {...form.register('experienceYears', { valueAsNumber: true })}
                aria-invalid={Boolean(errors.experienceYears)}
                className="w-full px-4 py-3 font-bold text-lg outline-none"
                style={{
                  border: `3px solid ${inputBorderColor(errors.experienceYears?.message)}`,
                  backgroundColor: COLORS.white,
                  fontFamily: "'Work Sans', sans-serif",
                }}
              />
            </ValidatedField>
          </div>

          {/* Tax Breakdown */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'PAYE', amount: liveTax.paye, bg: COLORS.yellow },
              { label: 'NSSF', amount: liveTax.nssfTotal, bg: COLORS.blue },
              { label: 'SHIF', amount: liveTax.shif, bg: COLORS.teal },
              { label: 'HOUSING', amount: liveTax.housingLevy, bg: COLORS.muted },
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
              type="button"
              onClick={handleCalculate}
              aria-disabled={!isValid}
              className={`w-full sm:w-auto px-10 py-4 font-extrabold text-sm uppercase ${isShaking ? 'animate-shake' : ''}`}
              style={{
                border: `3px solid ${COLORS.black}`,
                backgroundColor: isValid ? COLORS.red : COLORS.muted,
                color: COLORS.white,
                fontFamily: "'Work Sans', sans-serif",
                letterSpacing: '0.15em',
                boxShadow: `4px 4px 0 ${COLORS.black}`,
                cursor: isValid ? 'pointer' : 'not-allowed',
                opacity: isValid ? 1 : 0.75,
                transition: 'all 0.1s ease',
              }}
              onMouseDown={(e) => {
                if (!isValid) return
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `1px 1px 0 ${COLORS.black}`
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'translate(3px, 3px)'
              }}
              onMouseUp={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.boxShadow = `4px 4px 0 ${COLORS.black}`
                ;(e.currentTarget as HTMLButtonElement).style.transform = 'none'
              }}
            >
              CALCULATE BUDGET
            </button>
          </div>

          <div className="mt-5 p-4 text-center font-bold text-lg relative"
            style={{ border: `3px solid ${COLORS.black}`, backgroundColor: COLORS.black, color: COLORS.yellow, fontFamily: "'Work Sans', sans-serif", fontWeight: 900 }}>
            NET AFTER TAX: {formatKES(liveTax.netSalary)}
            {isRecalculating && (
              <span
                className="absolute top-1 right-2 text-[10px] font-bold uppercase"
                style={{ color: COLORS.yellow, letterSpacing: '0.15em', opacity: 0.7 }}
              >
                RECALC&hellip;
              </span>
            )}
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
              {liveCommute.origin}
            </span>
            <span className="font-black text-lg" style={{ color: COLORS.red }}>&#8594;</span>
            <span className="font-bold text-sm" style={{ fontFamily: "'Work Sans', sans-serif" }}>
              {liveCommute.destination}
            </span>
            <span className="px-3 py-1 text-xs font-extrabold"
              style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.yellow, fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em' }}>
              {liveCommute.distance}
            </span>
            {liveCommute.source === 'maps' && liveCommute.durationMin !== null && (
              <span className="text-xs font-bold" style={{ color: COLORS.muted, fontFamily: "'Work Sans', sans-serif" }}>
                ~{liveCommute.durationMin} min · Google Maps
              </span>
            )}
          </div>
          {liveCommute.distanceKm > 0 && (
            <div className="mb-4 text-xs font-bold uppercase" style={{ color: COLORS.muted, letterSpacing: '0.1em', fontFamily: "'Work Sans', sans-serif" }}>
              — Click a mode to set it as your monthly transport expense
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {liveCommute.modes.map((mode, i) => {
              const topBorderColors = [COLORS.red, COLORS.blue, COLORS.yellow, COLORS.teal]
              const disabled = liveCommute.distanceKm === 0
              return (
                <button
                  type="button"
                  key={mode.mode}
                  onClick={() => { if (!disabled) void setTransportToMode(mode) }}
                  disabled={disabled}
                  onMouseEnter={() => setHoveredCard(`travel-${i}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  aria-label={`Set monthly transport expense to ${mode.mode} — ${formatKES(mode.monthly)}`}
                  className="p-4 text-left"
                  style={{
                    ...cardStyle(`travel-${i}`, COLORS.white),
                    borderTop: `3px solid ${topBorderColors[i % topBorderColors.length]}`,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                  }}
                >
                  <div className="text-xs font-extrabold uppercase" style={{ fontFamily: "'Work Sans', sans-serif", letterSpacing: '0.15em', color: COLORS.black }}>
                    {mode.mode}
                  </div>
                  <div className="text-sm font-bold mt-2" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    {formatKES(mode.monthly)}/mo
                  </div>
                  <div className="text-xs mt-1" style={{ color: COLORS.muted }}>{formatKES(mode.costPerTrip)}/trip</div>
                </button>
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
          <div
            className="space-y-0 overflow-y-auto"
            style={{ maxHeight: '320px', border: `2px solid ${COLORS.black}` }}
          >
            {expenseList.isLoading ? (
              <div className="px-5 py-6 text-center text-xs font-bold uppercase" style={{ color: COLORS.muted, letterSpacing: '0.15em' }}>
                Loading expenses&hellip;
              </div>
            ) : expenseList.items.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs font-bold uppercase" style={{ color: COLORS.muted, letterSpacing: '0.15em' }}>
                No expenses yet
              </div>
            ) : (
              expenseList.items.map((item, i) => {
                const leftBorderColors = [COLORS.red, COLORS.blue, COLORS.yellow, COLORS.teal, COLORS.muted]
                const accent = leftBorderColors[i % leftBorderColors.length]
                return (
                  <ExpenseRow
                    key={item.id}
                    row={{ id: item.id, name: item.name, amount: item.amount, isAuto: item.isAuto }}
                    accentColor={accent}
                    onSave={(next) => expenseList.update(item.id, next)}
                    onDelete={() => expenseList.remove(item.id)}
                  />
                )
              })
            )}
            <AddExpenseRow onAdd={expenseList.add} />
          </div>
          <div className="mt-5 p-4 text-center font-bold text-lg"
            style={{ border: `3px solid ${COLORS.black}`, backgroundColor: COLORS.black, color: COLORS.yellow, fontFamily: "'Work Sans', sans-serif", fontWeight: 900 }}>
            TOTAL EXPENSES: {formatKES(expenseList.items.reduce((sum, i) => sum + i.amount, 0))}
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
          {formatKES(liveBudget.takeHome)}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-bold"
          style={{ color: COLORS.white, opacity: 0.8 }}>
          <span>Gross: {formatKES(liveBudget.gross)}</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>Deductions: {formatKES(liveBudget.totalDeductions)}</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>Expenses: {formatKES(liveBudget.totalExpenses)}</span>
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
          { label: 'GROSS', amount: liveBudget.gross, color: COLORS.blue, icon: <Zap size={20} /> },
          { label: 'DEDUCTIONS', amount: liveBudget.totalDeductions, color: COLORS.red, icon: <AlertTriangle size={20} /> },
          { label: 'EXPENSES', amount: liveBudget.totalExpenses, color: COLORS.yellow, icon: <BarChart3 size={20} /> },
          { label: 'TAKE HOME', amount: liveBudget.takeHome, color: COLORS.teal, icon: <ThumbsUp size={20} /> },
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
            {liveBudget.savingsRate.toFixed(1)}%
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
                data={liveBudget.expenseChart}
                cx="50%" cy="50%"
                outerRadius={100}
                innerRadius={40}
                dataKey="value"
                stroke={COLORS.black}
                strokeWidth={2}
              >
                {liveBudget.expenseChart.map((_, i) => (
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
            {liveBudget.expenseChart.map((item, i) => {
              const pct = liveBudget.gross > 0 ? ((item.value / liveBudget.gross) * 100).toFixed(1) : '0.0'
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
              Rent in {liveRent.area}
            </span>
          </div>
          <div className="space-y-3">
            {liveRent.options.map((opt) => (
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
              Food in {liveFood.area}
            </span>
          </div>
          <div className="space-y-3">
            {liveFood.options.map((r) => (
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
          <AreaChart data={liveProjections.chart}>
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
            { data: liveProjections.current, label: 'NOW', borderColor: COLORS.red, rotate: '-1deg' },
            { data: liveProjections.year3, label: 'YEAR 3', borderColor: COLORS.blue, rotate: '1.5deg' },
            { data: liveProjections.year5, label: 'YEAR 5', borderColor: COLORS.yellow, rotate: '-0.5deg' },
            { data: liveProjections.year10, label: 'YEAR 10', borderColor: COLORS.teal, rotate: '1deg' },
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
          <LineChart data={liveProjections.chart}>
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
    const isBelow = liveComparison.verdict === 'below'
    const isAbove = liveComparison.verdict === 'above'
    const verdictColor = isBelow ? COLORS.red : isAbove ? COLORS.teal : COLORS.blue
    const verdictLabel = isBelow
      ? 'BELOW MARKET'
      : isAbove
        ? 'ABOVE MARKET'
        : 'AT MARKET'
    return (
      <div className="space-y-12">
        {/* Role Info */}
        <div className="flex flex-wrap gap-3 items-center justify-center">
          {[
            { label: liveComparison.role, bg: COLORS.yellow },
            { label: liveComparison.location, bg: COLORS.blue },
            { label: liveComparison.experienceBand, bg: COLORS.red },
            { label: `${liveComparison.sampleSize} respondents`, bg: COLORS.teal },
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
            <AreaChart data={liveComparison.distribution}>
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
              You: {formatKES(liveComparison.userSalary)}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4" style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.red }} />
              Median: {formatKES(liveComparison.marketMedian)}
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
                width: `${liveComparison.percentile}%`,
                backgroundColor: COLORS.yellow,
                borderRight: `3px solid ${COLORS.black}`,
                transition: 'width 0.5s ease',
              }}
            >
              <span className="font-black text-lg" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.black }}>
                {liveComparison.percentile}th
              </span>
            </div>
            {/* Markers */}
            <div className="absolute top-0 h-full" style={{ left: '25%', borderLeft: `2px dashed ${COLORS.black}`, opacity: 0.3 }} />
            <div className="absolute top-0 h-full" style={{ left: '50%', borderLeft: `2px dashed ${COLORS.black}`, opacity: 0.3 }} />
            <div className="absolute top-0 h-full" style={{ left: '75%', borderLeft: `2px dashed ${COLORS.black}`, opacity: 0.3 }} />
          </div>
          <div className="flex justify-between mt-3 text-xs font-bold" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            <span>P25: {formatKES(liveComparison.p25)}</span>
            <span>MEDIAN: {formatKES(liveComparison.marketMedian)}</span>
            <span>P75: {formatKES(liveComparison.p75)}</span>
          </div>
        </div>

        {/* Market Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'YOUR SALARY', val: liveComparison.userSalary, color: COLORS.blue },
            { label: 'MARKET MEDIAN', val: liveComparison.marketMedian, color: COLORS.red },
            { label: 'MARKET MEAN', val: liveComparison.marketMean, color: COLORS.yellow },
            { label: 'P75 (TOP 25%)', val: liveComparison.p75, color: COLORS.teal },
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
              {verdictLabel}
            </div>
            <div className="text-sm font-bold mt-3" style={{ fontFamily: "'Work Sans', sans-serif", opacity: 0.9 }}>
              {liveComparison.verdictText}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-xs" style={{ opacity: 0.8 }}>
              <AlertTriangle size={12} />
              <span className="font-bold">Confidence: {liveComparison.confidence.toUpperCase()}</span>
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
                {formatKES(liveComparison.marketMedian - liveComparison.userSalary)}
              </div>
            </div>
            <div className="p-5 text-center" style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.white }}>
              <div className="text-xs font-bold uppercase mb-1" style={{ color: COLORS.muted, letterSpacing: '0.05em' }}>Annual Gap</div>
              <div className="text-lg font-black" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.red }}>
                {formatKES((liveComparison.marketMedian - liveComparison.userSalary) * 12)}
              </div>
            </div>
            <div className="p-5 text-center" style={{ border: `2px solid ${COLORS.black}`, backgroundColor: COLORS.white }}>
              <div className="text-xs font-bold uppercase mb-1" style={{ color: COLORS.muted, letterSpacing: '0.05em' }}>To Reach P75</div>
              <div className="text-lg font-black" style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 900, color: COLORS.blue }}>
                {formatKES(liveComparison.p75 - liveComparison.userSalary)}
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

          <div className="flex items-center gap-3">
            {/* User Badge */}
            <div
              className="px-3 py-1.5 text-xs font-bold hidden md:flex items-center gap-2"
              style={{
                border: `2px solid ${COLORS.yellow}`, color: COLORS.yellow,
                fontFamily: "'Work Sans', sans-serif", transform: 'rotate(1deg)',
              }}
            >
              <User size={12} />
              {values.fullName || userDisplayName} &mdash; {values.jobTitle || userCompany}
            </div>
            <UserButton />
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
