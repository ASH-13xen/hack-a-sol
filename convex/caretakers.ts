import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/***********************
 * GET CARETAKERS
 ***********************/
export const getCaretakers = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("caretakers")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/***********************
 * ADD CARETAKER
 ***********************/
export const addCaretaker = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    relation: v.string(),
    phone: v.string(),
    email: v.string(),
    avatar: v.string(),
    available: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("caretakers", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

/***********************
 * DELETE CARETAKER
 ***********************/
export const deleteCaretaker = mutation({
  args: { caretakerId: v.id("caretakers") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.caretakerId);
  },
});
