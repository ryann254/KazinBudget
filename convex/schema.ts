import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  submissions: defineTable({
    owner_id: v.string(),
    name: v.string(),
    company_name: v.string(),
    company_location: v.string(),
    residential_area: v.string(),
    years_of_experience: v.number(),
    monthly_gross_salary: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("calculating"),
      v.literal("calculated"),
      v.literal("error")
    ),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_owner", ["owner_id"])
    .index("by_owner_status", ["owner_id", "status"])
    .index("by_status", ["status"]),

  expenses: defineTable({
    owner_id: v.string(),
    user_session_id: v.string(),
    name: v.string(),
    category: v.union(
      v.literal("tax"),
      v.literal("rent"),
      v.literal("food"),
      v.literal("transport"),
      v.literal("custom")
    ),
    amount: v.number(),
    is_auto: v.boolean(),
    original_amount: v.optional(v.number()),
    description: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_owner_session", ["owner_id", "user_session_id"])
    .index("by_owner", ["owner_id"])
    .index("by_session", ["user_session_id"])
    .index("by_session_category", ["user_session_id", "category"]),

  takeHomeResults: defineTable({
    submissionId: v.id("submissions"),
    grossSalary: v.number(),
    paye: v.number(),
    nssfTotal: v.number(),
    shif: v.number(),
    housingLevy: v.number(),
    totalTax: v.number(),
    rentCost: v.number(),
    rentSource: v.string(),
    rentConfidence: v.string(),
    foodCost: v.number(),
    foodSource: v.string(),
    foodConfidence: v.string(),
    transportCost: v.number(),
    transportSource: v.string(),
    transportConfidence: v.string(),
    transportMode: v.string(),
    customExpenses: v.array(
      v.object({
        label: v.string(),
        amountKES: v.number(),
      })
    ),
    totalCustomExpenses: v.number(),
    totalLivingCosts: v.number(),
    totalDeductions: v.number(),
    takeHomeSalary: v.number(),
    calculatedAt: v.number(),
    expiresAt: v.number(),
  }).index("by_submission", ["submissionId"]),

  growthAssumptions: defineTable({
    salaryGrowthRate: v.number(),
    rentInflationRates: v.object({
      premium: v.number(),
      middle: v.number(),
      budget: v.number(),
      satellite: v.number(),
    }),
    foodInflationRate: v.number(),
    transportInflationRate: v.number(),
    customInflationRate: v.number(),
    generalInflationRate: v.number(),
    updatedAt: v.number(),
  }),

  rentCache: defineTable({
    area: v.string(),
    bedrooms: v.string(),
    medianRent: v.number(),
    source: v.string(),
    scrapedAt: v.number(),
    expiresAt: v.number(),
  }).index("by_area_bedrooms", ["area", "bedrooms"]),

  foodCostCache: defineTable({
    location: v.string(),
    zone: v.string(),
    monthlyEstimate: v.number(),
    source: v.string(),
    scrapedAt: v.number(),
    expiresAt: v.number(),
  }).index("by_location", ["location"]),

  budgetCalculations: defineTable({
    owner_id: v.string(),
    fingerprint: v.string(),
    payload: v.string(),
    created_at: v.number(),
  }).index("by_owner_fingerprint", ["owner_id", "fingerprint"]),
});
