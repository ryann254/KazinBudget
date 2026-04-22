import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOwnerIdOrThrow } from "./lib/ownership";

export const getByFingerprint = query({
  args: { fingerprint: v.string() },
  handler: async (ctx, { fingerprint }) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    const row = await ctx.db
      .query("budgetCalculations")
      .withIndex("by_owner_fingerprint", (q) =>
        q.eq("owner_id", ownerId).eq("fingerprint", fingerprint),
      )
      .order("desc")
      .first();
    if (!row) return null;
    return { payload: row.payload, createdAt: row.created_at };
  },
});

export const upsertByFingerprint = mutation({
  args: {
    fingerprint: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, { fingerprint, payload }) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    const existing = await ctx.db
      .query("budgetCalculations")
      .withIndex("by_owner_fingerprint", (q) =>
        q.eq("owner_id", ownerId).eq("fingerprint", fingerprint),
      )
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { payload, created_at: now });
      return existing._id;
    }
    return await ctx.db.insert("budgetCalculations", {
      owner_id: ownerId,
      fingerprint,
      payload,
      created_at: now,
    });
  },
});
