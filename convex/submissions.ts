import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertOwnerAccess, getOwnerIdOrThrow } from "./lib/ownership";

export const create = mutation({
  args: {
    name: v.string(),
    company_name: v.string(),
    company_location: v.string(),
    residential_area: v.string(),
    years_of_experience: v.number(),
    monthly_gross_salary: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    const now = Date.now();
    const id = await ctx.db.insert("submissions", {
      owner_id: ownerId,
      ...args,
      status: "pending",
      created_at: now,
      updated_at: now,
    });
    return id;
  },
});

export const get = query({
  args: { id: v.id("submissions") },
  handler: async (ctx, args) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    const submission = await ctx.db.get(args.id);
    if (!submission) {
      return null;
    }
    assertOwnerAccess(submission.owner_id, ownerId);
    return submission;
  },
});
