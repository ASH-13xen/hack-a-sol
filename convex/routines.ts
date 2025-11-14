import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export type Routine = {
  _id: string;
  userId: string;
  time: string;
  message: string;
  phone: string;
};

//
// -------------------------
//      ROUTINES QUERIES
// -------------------------
//

export const getRoutines = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("routines")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Fetch ALL routines — used by cron/action
export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("routines").collect();
  },
});

//
// -------------------------
//      ROUTINES MUTATIONS
// -------------------------
//

export const addRoutine = mutation({
  args: {
    userId: v.string(),
    time: v.string(),
    message: v.string(),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("routines", args);
  },
});

export const deleteRoutine = mutation({
  args: { id: v.id("routines") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

//
// -------------------------
//      SEND REMINDERS ACTION
// -------------------------
//

export const sendReminders = action({
  args: {},
  handler: async (ctx) => {
    const sid = process.env.TWILIO_ACCOUNT_SID!;
    const token = process.env.TWILIO_AUTH_TOKEN!;
    const from = process.env.TWILIO_WHATSAPP_NUMBER!;

    // Current HH:MM
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, "0");
    const mm = now.getMinutes().toString().padStart(2, "0");
    const target = `${hh}:${mm}`;

    // Read from DB via query
    const routines = (await ctx.runQuery(api.routines.getAll)) as Routine[];

    // Filter due reminders
    const due = routines.filter((r) => r.time === target);

    for (const r of due) {
      const to = r.phone.startsWith("whatsapp:")
        ? r.phone
        : `whatsapp:${r.phone}`;

      // --- FIXED: Twilio via REST API only ---
      await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization:
              "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: from,
            To: to,
            Body: r.message,
          }).toString(),
        }
      );
    }

    return { sent: due.length, at: target };
  },
});
