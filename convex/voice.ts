import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1. Store log entries
export const addLog = mutation({
  args: {
    userId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, { userId, text }) => {
    await ctx.db.insert("voice_logs", {
      userId,
      text,
      timestamp: Date.now(),
    });
  },
});

// 2. Fetch logs for today's date
export const getLogs = query({
  args: {
    userId: v.string(),
    date: v.string(), // yyyy-mm-dd
  },
  handler: async (ctx, { userId, date }) => {
    const start = new Date(date).setHours(0, 0, 0, 0);
    const end = new Date(date).setHours(23, 59, 59, 999);

    return await ctx.db
      .query("voice_logs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), start),
          q.lte(q.field("timestamp"), end)
        )
      )
      .collect();
  },
});

// 3. Save a summary
export const saveSummary = mutation({
  args: {
    userId: v.string(),
    date: v.string(),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("daily_summaries", {
      userId: args.userId,
      date: args.date,
      summary: args.summary,
      createdAt: Date.now(),
    });
  },
});
