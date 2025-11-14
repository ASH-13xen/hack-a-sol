import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all caregivers for the logged-in user
 */
export const get = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return []; // Not authenticated, return empty list
    }

    // Fetch all caregivers linked to the current user's Clerk ID (identity.subject)
    return await ctx.db
      .query("caretakers") // Matches 'caretakers' in your schema.ts
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});
