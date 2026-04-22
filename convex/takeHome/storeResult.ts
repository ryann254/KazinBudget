import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const storeResult = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    // Check for existing result with the same submissionId
    const existing = await ctx.db
      .query("takeHomeResults")
      .withIndex("by_submission", (q) => q.eq("submissionId", args.submissionId))
      .first();

    // Delete existing result if found
    if (existing) {
      await ctx.db.delete(existing._id);
    }

    const now = Date.now();
    const ONE_HOUR_MS = 60 * 60 * 1000;

    // Insert new result with timestamps
    const id = await ctx.db.insert("takeHomeResults", {
      ...args,
      calculatedAt: now,
      expiresAt: now + ONE_HOUR_MS,
    });

    return id;
  },
});
