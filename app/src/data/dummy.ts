// ============================================================
// DUMMY DATA FOR ALL 5 UI DESIGNS
// Kenya-focused workplace budgeting app
// ============================================================

export const userData = {
  name: "Amani Wanjiku",
  company: "Safaricom PLC",
  companyLocation: "Westlands, Nairobi",
  residentialArea: "Juja, Kiambu",
  yearsOfExperience: 3,
  monthlySalary: 120000, // KES
};

export const nairobiAreas = [
  "Westlands", "Kilimani", "Lavington", "Karen", "Runda",
  "Parklands", "Kileleshwa", "Upper Hill", "CBD", "South B",
  "South C", "Langata", "Hurlingham", "Gigiri", "Muthaiga",
  "Eastleigh", "Buruburu", "Donholm", "Umoja", "Embakasi",
  "Kasarani", "Roysambu", "Kahawa", "Ruiru", "Juja",
  "Thika", "Kitengela", "Rongai", "Ngong", "Syokimau",
  "Athi River", "Kangundo Road", "Mombasa Road", "Industrial Area",
  "Nairobi West", "Madaraka", "Ngara", "Pangani", "Zimmerman",
  "Githurai", "Kayole", "Pipeline", "Imara Daima", "Mlolongo",
];

export const taxBreakdown = {
  grossSalary: 120000,
  paye: 11602,
  nssf: 2160,
  shif: 3300,
  housingLevy: 1800,
  personalRelief: 2400,
  totalDeductions: 16462,
  netAfterTax: 103538,
};

export const expenseBreakdown = {
  rent: { amount: 15000, label: "Rent (1BR - Juja)", source: "auto", category: "rent" },
  food: { amount: 8800, label: "Food & Meals", source: "auto", category: "food" },
  transport: { amount: 6600, label: "Transport (Matatu)", source: "auto", category: "transport" },
  custom: [
    { id: "1", name: "Gym Membership", amount: 3500, category: "fitness", source: "manual" },
    { id: "2", name: "Internet (WiFi)", amount: 3000, category: "utilities", source: "manual" },
    { id: "3", name: "Electricity", amount: 2500, category: "utilities", source: "manual" },
    { id: "4", name: "Water", amount: 800, category: "utilities", source: "manual" },
    { id: "5", name: "Groceries", amount: 8000, category: "food", source: "manual" },
    { id: "6", name: "Phone (Airtime/Data)", amount: 2000, category: "utilities", source: "manual" },
  ],
};

export const dashboardSummary = {
  grossSalary: 120000,
  totalDeductions: 16462,
  totalExpenses: 50200,
  takeHome: 53338,
};

export const expenseChartData = [
  { name: "PAYE", value: 11602, color: "#ef4444", category: "tax" },
  { name: "NSSF", value: 2160, color: "#f87171", category: "tax" },
  { name: "SHIF", value: 3300, color: "#fca5a5", category: "tax" },
  { name: "Housing Levy", value: 1800, color: "#fecaca", category: "tax" },
  { name: "Rent", value: 15000, color: "#3b82f6", category: "rent" },
  { name: "Food & Meals", value: 8800, color: "#f59e0b", category: "food" },
  { name: "Transport", value: 6600, color: "#22c55e", category: "transport" },
  { name: "Gym", value: 3500, color: "#a855f7", category: "custom" },
  { name: "Internet", value: 3000, color: "#8b5cf6", category: "custom" },
  { name: "Electricity", value: 2500, color: "#7c3aed", category: "custom" },
  { name: "Water", value: 800, color: "#6d28d9", category: "custom" },
  { name: "Groceries", value: 8000, color: "#c084fc", category: "custom" },
  { name: "Phone", value: 2000, color: "#d946ef", category: "custom" },
];

export const growthProjections = {
  current: {
    year: 0,
    salary: 120000,
    takeHome: 53338,
    totalExpenses: 50200,
    totalTax: 16462,
  },
  year3: {
    year: 3,
    salary: 149153,
    takeHome: 62450,
    totalExpenses: 58700,
    totalTax: 21003,
  },
  year5: {
    year: 5,
    salary: 172406,
    takeHome: 69200,
    totalExpenses: 64800,
    totalTax: 25406,
  },
  year7: {
    year: 7,
    salary: 199280,
    takeHome: 76100,
    totalExpenses: 71500,
    totalTax: 30680,
  },
  year10: {
    year: 10,
    salary: 246170,
    takeHome: 88700,
    totalExpenses: 82300,
    totalTax: 39170,
  },
};

export const growthChartData = [
  { year: 0, salary: 120000, takeHome: 53338, expenses: 50200, taxes: 16462 },
  { year: 1, salary: 129000, takeHome: 56200, expenses: 52700, taxes: 17700 },
  { year: 2, salary: 138675, takeHome: 59300, expenses: 55400, taxes: 19175 },
  { year: 3, salary: 149153, takeHome: 62450, expenses: 58700, taxes: 21003 },
  { year: 4, salary: 160339, takeHome: 65700, expenses: 61700, taxes: 23139 },
  { year: 5, salary: 172406, takeHome: 69200, expenses: 64800, taxes: 25406 },
  { year: 6, salary: 185336, takeHome: 72500, expenses: 68100, taxes: 27936 },
  { year: 7, salary: 199280, takeHome: 76100, expenses: 71500, taxes: 30680 },
  { year: 8, salary: 214226, takeHome: 80100, expenses: 75200, taxes: 33726 },
  { year: 9, salary: 230293, takeHome: 84200, expenses: 78600, taxes: 37093 },
  { year: 10, salary: 246170, takeHome: 88700, expenses: 82300, taxes: 39170 },
];

export const salaryComparison = {
  userSalary: 120000,
  marketMedian: 135000,
  marketMean: 142000,
  p25: 95000,
  p75: 175000,
  percentile: 38,
  verdict: "slightly_below" as const,
  verdictText: "You're earning 11% below the market median",
  sampleSize: 342,
  confidence: "medium" as const,
  role: "Software Developer",
  location: "Nairobi",
  experienceBand: "Mid-Level (3-5 years)",
  lastUpdated: "2026-02-05",
};

export const salaryDistributionData = [
  { salary: 40000, frequency: 2 },
  { salary: 50000, frequency: 5 },
  { salary: 60000, frequency: 12 },
  { salary: 70000, frequency: 22 },
  { salary: 80000, frequency: 38 },
  { salary: 90000, frequency: 55 },
  { salary: 100000, frequency: 72 },
  { salary: 110000, frequency: 85 },
  { salary: 120000, frequency: 90 },
  { salary: 130000, frequency: 95 },
  { salary: 140000, frequency: 88 },
  { salary: 150000, frequency: 75 },
  { salary: 160000, frequency: 60 },
  { salary: 170000, frequency: 45 },
  { salary: 180000, frequency: 32 },
  { salary: 190000, frequency: 20 },
  { salary: 200000, frequency: 14 },
  { salary: 220000, frequency: 8 },
  { salary: 250000, frequency: 4 },
  { salary: 300000, frequency: 2 },
];

export const travelDetails = {
  origin: "Juja, Kiambu",
  destination: "Westlands, Nairobi",
  distance: "32 km",
  duration: "45 min - 1 hr 20 min",
  modes: [
    { mode: "Matatu", costPerTrip: 150, monthly: 6600, icon: "bus" },
    { mode: "Boda Boda", costPerTrip: 350, monthly: 15400, icon: "bike" },
    { mode: "Uber/Bolt", costPerTrip: 850, monthly: 37400, icon: "car" },
    { mode: "Personal Car", costPerTrip: 420, monthly: 18480, icon: "car" },
  ],
};

export const rentDetails = {
  area: "Juja",
  zone: "Satellite",
  options: [
    { type: "Bedsitter", median: 7000, range: "5,000 - 10,000" },
    { type: "1 Bedroom", median: 15000, range: "10,000 - 20,000" },
    { type: "2 Bedroom", median: 22000, range: "15,000 - 30,000" },
  ],
  source: "estimate",
  lastUpdated: "2026-02-01",
};

export const foodDetails = {
  area: "Westlands",
  avgLunchCost: 400,
  dailyCost: 400,
  workingDays: 22,
  monthlyCost: 8800,
  nearbyRestaurants: [
    { name: "Java House", avgMeal: 650 },
    { name: "Mama Oliech", avgMeal: 350 },
    { name: "KFC Westlands", avgMeal: 500 },
    { name: "Kenchic", avgMeal: 300 },
    { name: "Street Food Vendor", avgMeal: 150 },
  ],
  source: "live",
};

// Utility: Format KES currency
export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

// Quick-add expense suggestions
export const quickAddExpenses = [
  { name: "Gym", defaultAmount: 3500, category: "fitness" },
  { name: "Internet", defaultAmount: 3000, category: "utilities" },
  { name: "Electricity", defaultAmount: 2500, category: "utilities" },
  { name: "Water", defaultAmount: 800, category: "utilities" },
  { name: "Groceries", defaultAmount: 8000, category: "food" },
  { name: "Phone", defaultAmount: 2000, category: "utilities" },
  { name: "Netflix/DSTV", defaultAmount: 1500, category: "entertainment" },
  { name: "Savings (SACCO)", defaultAmount: 10000, category: "savings" },
  { name: "Church/Tithe", defaultAmount: 12000, category: "giving" },
  { name: "M-PESA Fees", defaultAmount: 500, category: "fees" },
];

// Growth assumptions defaults
export const growthAssumptions = {
  salaryGrowthRate: 7.5,
  rentInflation: 5.0,
  foodInflation: 6.5,
  transportInflation: 4.0,
  generalCPI: 6.0,
};
