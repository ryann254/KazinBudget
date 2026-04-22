import { query } from "./_generated/server";

const DEFAULT_ASSUMPTIONS = {
  salaryGrowthRate: 0.075,
  rentInflationRates: {
    premium: 0.04,
    middle: 0.035,
    budget: 0.03,
    satellite: 0.05,
  },
  foodInflationRate: 0.07,
  transportInflationRate: 0.06,
  customInflationRate: 0.065,
  generalInflationRate: 0.07,
};

export const getDefaults = query({
  args: {},
  handler: async (ctx) => {
    // Query the single assumptions document from the table
    const stored = await ctx.db.query("growthAssumptions").first();

    if (stored) {
      return stored;
    }

    // Return hardcoded defaults if no document exists
    return DEFAULT_ASSUMPTIONS;
  },
});
