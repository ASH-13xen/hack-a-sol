// convex/logs.ts

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Format today's date as yyyy-mm-dd
function getDateString(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/*                          1. ADD LIVE VOICE LOG                              */
/* -------------------------------------------------------------------------- */

export const addVoiceLog = mutation({
  args: { userId: v.string(), text: v.string() },
  handler: async (ctx, { userId, text }) => {
    const now = Date.now();

    // Save individual utterance
    await ctx.db.insert("voice_logs", {
      userId,
      text,
      timestamp: now,
    });
  },
});

/* -------------------------------------------------------------------------- */
/*                    2. GET TODAY'S LIVE LOGS (NOT ARCHIVED)                */
/* -------------------------------------------------------------------------- */

export const getTodayLogs = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const today = getDateString(Date.now());

    // Fetch logs for only today
    const logs = await ctx.db
      .query("voice_logs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    return logs.filter((log) => getDateString(log.timestamp) === today);
  },
});

/* -------------------------------------------------------------------------- */
/*                     3. ARCHIVE TODAY LOGS INTO daily_logs                  */
/* -------------------------------------------------------------------------- */

export const archiveTodayLogs = mutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const now = Date.now();
    const today = getDateString(now);

    // Fetch today's logs
    const logs = await ctx.db
      .query("voice_logs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    const todaysLogs = logs.filter((l) => getDateString(l.timestamp) === today);

    if (todaysLogs.length === 0) return;

    // Insert into daily_logs
    await ctx.db.insert("daily_logs", {
      userId,
      date: today,
      logs: todaysLogs.map((l) => l.text),
      createdAt: now,
    });

    // Delete today's individual logs
    for (const log of todaysLogs) {
      await ctx.db.delete(log._id);
    }

    return { archived: true };
  },
});

/* -------------------------------------------------------------------------- */
/*                   4. LIST PAST DAYS WHERE LOGS EXIST                       */
/* -------------------------------------------------------------------------- */

export const getLogDays = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const days = await ctx.db
      .query("daily_logs")
      .withIndex("by_user_date", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return days.map((d) => ({
      date: d.date,
      id: d._id,
    }));
  },
});

/* -------------------------------------------------------------------------- */
/*                       5. GET LOGS FOR A SPECIFIC DATE                     */
/* -------------------------------------------------------------------------- */

export const getLogsByDate = query({
  args: { id: v.id("daily_logs") },
  handler: async (ctx, { id }) => {
    const entry = await ctx.db.get(id);
    return entry || null;
  },
});
