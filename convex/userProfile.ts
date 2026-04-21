import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOwnerIdOrThrow } from "./lib/ownership";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    const row = await ctx.db
      .query("userProfiles")
      .withIndex("by_owner", (q) => q.eq("owner_id", ownerId))
      .first();
    if (!row) return null;
    return {
      fullName: row.full_name,
      company: row.company,
      jobTitle: row.job_title,
      workLocation: row.work_location,
      homeArea: row.home_area,
      grossSalary: row.gross_salary,
      experienceYears: row.experience_years,
      updatedAt: row.updated_at,
    };
  },
});

export const patch = mutation({
  args: {
    fullName: v.optional(v.string()),
    company: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    workLocation: v.optional(v.string()),
    homeArea: v.optional(v.string()),
    grossSalary: v.optional(v.number()),
    experienceYears: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_owner", (q) => q.eq("owner_id", ownerId))
      .first();
    const now = Date.now();

    const fields = {
      ...(args.fullName !== undefined && { full_name: args.fullName }),
      ...(args.company !== undefined && { company: args.company }),
      ...(args.jobTitle !== undefined && { job_title: args.jobTitle }),
      ...(args.workLocation !== undefined && { work_location: args.workLocation }),
      ...(args.homeArea !== undefined && { home_area: args.homeArea }),
      ...(args.grossSalary !== undefined && { gross_salary: args.grossSalary }),
      ...(args.experienceYears !== undefined && { experience_years: args.experienceYears }),
    };

    if (existing) {
      await ctx.db.patch(existing._id, { ...fields, updated_at: now });
      return existing._id;
    }
    return await ctx.db.insert("userProfiles", {
      owner_id: ownerId,
      updated_at: now,
      ...fields,
    });
  },
});
