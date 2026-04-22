import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getCachedResult = internalQuery({
  args: { submissionId: v.id("submissions") },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("takeHomeResults")
      .withIndex("by_submission", (q) => q.eq("submissionId", args.submissionId))
      .first();
    return result;
  },
});
