import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { assertOwnerAccess, getOwnerIdOrThrow } from "./lib/ownership";

export const listBySession = query({
  args: { user_session_id: v.string() },
  handler: async (ctx, args) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    return await ctx.db
      .query("expenses")
      .withIndex("by_owner_session", (q) =>
        q
          .eq("owner_id", ownerId)
          .eq("user_session_id", args.user_session_id),
      )
      .collect();
  },
});

export const getSummary = query({
  args: {
    user_session_id: v.string(),
    gross_salary: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_owner_session", (q) =>
        q
          .eq("owner_id", ownerId)
          .eq("user_session_id", args.user_session_id),
      )
      .collect();

    const byCategory: Record<string, number> = {};
    let totalExpenses = 0;

    for (const expense of expenses) {
      const cat = expense.category;
      byCategory[cat] = (byCategory[cat] ?? 0) + expense.amount;
      totalExpenses += expense.amount;
    }

    const remaining = args.gross_salary - totalExpenses;

    return {
      totalExpenses,
      remaining,
      byCategory,
      expenseCount: expenses.length,
    };
  },
});

export const create = mutation({
  args: {
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
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    const now = Date.now();
    const id = await ctx.db.insert("expenses", {
      owner_id: ownerId,
      ...args,
      is_auto: false,
      created_at: now,
      updated_at: now,
    });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("expenses"),
    amount: v.optional(v.number()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Expense not found");
    }
    assertOwnerAccess(existing.owner_id, ownerId);

    const updates: Record<string, unknown> = {
      updated_at: Date.now(),
    };

    if (args.amount !== undefined) {
      // If this is an auto expense being manually overridden,
      // preserve the original amount for reset capability
      if (existing.is_auto && existing.original_amount === undefined) {
        updates.original_amount = existing.amount;
      }
      updates.amount = args.amount;
    }

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    if (args.description !== undefined) {
      updates.description = args.description;
    }

    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Expense not found");
    }
    assertOwnerAccess(existing.owner_id, ownerId);

    if (existing.is_auto) {
      throw new Error("Cannot delete auto-generated expenses. Use resetAuto to restore the original value.");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});

export const resetAuto = mutation({
  args: { id: v.id("expenses") },
  handler: async (ctx, args) => {
    const ownerId = getOwnerIdOrThrow(await ctx.auth.getUserIdentity());
    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error("Expense not found");
    }
    assertOwnerAccess(existing.owner_id, ownerId);

    if (!existing.is_auto) {
      throw new Error("Only auto-generated expenses can be reset");
    }

    if (existing.original_amount === undefined) {
      throw new Error("Expense has not been overridden");
    }

    await ctx.db.patch(args.id, {
      amount: existing.original_amount,
      original_amount: undefined,
      updated_at: Date.now(),
    });

    return args.id;
  },
});
